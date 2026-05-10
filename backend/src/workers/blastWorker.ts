import 'dotenv/config';
import { Worker, Job, ConnectionOptions } from 'bullmq';
import { redisConnection } from '../config/redis';
import { env } from '../config/env';
import { addRecipientJob } from '../queues/blastQueue';
import { prisma } from '../config/prisma';
import { blastRepository } from '../repositories/blastRepository';
import { sessionManager } from '../baileys/sessionManager';
import { wsServer } from '../websocket/wsServer';
import { logger } from '../utils/logger';

export async function startBlastWorker() {
    // logger.debug('[Worker] Initializing BullMQ Blast Worker...');

    // Backfill scheduled jobs
    await backfillScheduledJobs();

    const worker = new Worker(
        'blast-queue',
        async (job: Job) => {
            const { recipientId } = job.data as { recipientId: string };
            // logger.debug(`[Worker] Processing recipient: ${recipientId}`);

            const recipient = await blastRepository.findRecipientById(recipientId);
            if (!recipient) {
                logger.error(`[Worker] Recipient ${recipientId} not found in DB`);
                return;
            }

            const blastJob = recipient.blastJob as any;
            const device = blastJob?.device;

            if (recipient.status !== 'PENDING') {
                logger.info(`[Worker] Skipping recipient ${recipient.id}; status is ${recipient.status}`);
                return;
            }

            const claim = await blastRepository.markRecipientProcessing(recipient.id);
            if (claim.count === 0) {
                logger.info(`[Worker] Recipient ${recipient.id} was already claimed by another worker/job`);
                return;
            }

            if (!device) {
                await blastRepository.updateRecipientStatus(recipient.id, 'FAILED', 'Device not found');
                return;
            }

            // Mark job as processing on first recipient if it's still PENDING
            if (blastJob.status === 'PENDING' || blastJob.status === 'SCHEDULED') {
                await blastRepository.updateJobStatus(blastJob.id, 'PROCESSING', {
                    startedAt: new Date(),
                });
            }

            try {
                if (blastJob.type === 'IMAGE') {
                    await sessionManager.sendImageMessage(device.id, recipient.phone, blastJob.mediaUrl, recipient.message);
                } else if (blastJob.type === 'DOCUMENT') {
                    const filename = blastJob.mediaUrl.split('/').pop() || 'document.pdf';
                    await sessionManager.sendDocumentMessage(device.id, recipient.phone, blastJob.mediaUrl, filename);
                    if (recipient.message) {
                        await sessionManager.sendTextMessage(device.id, recipient.phone, recipient.message);
                    }
                } else {
                    await sessionManager.sendTextMessage(device.id, recipient.phone, recipient.message);
                }

                await blastRepository.updateRecipientStatus(recipient.id, 'SENT', undefined, new Date());

                wsServer.sendToDevice(device.id, 'blast_progress', {
                    blastJobId: recipient.blastJobId,
                    phone: recipient.phone,
                    status: 'SENT',
                });
            } catch (err: any) {
                logger.error(`[Worker] Failed to send to ${recipient.phone}:`, err.message);
                await blastRepository.updateRecipientStatus(recipient.id, 'FAILED', err.message);

                wsServer.sendToDevice(device.id, 'blast_progress', {
                    blastJobId: recipient.blastJobId,
                    phone: recipient.phone,
                    status: 'FAILED',
                    error: err.message,
                });
            }

            // Efficiently check completion using the repository's new count logic
            const counts = await blastRepository.countRecipients(recipient.blastJobId);
            if (counts.pending === 0) {
                await blastRepository.updateJobStatus(recipient.blastJobId, 'COMPLETED', {
                    completedAt: new Date(),
                });
                wsServer.broadcast('blast_completed', {
                    blastJobId: recipient.blastJobId,
                    stats: counts
                });
                logger.info(`[Worker] Blast job ${recipient.blastJobId} COMPLETED`);
            }
        },
        {
            connection: redisConnection as ConnectionOptions,
            concurrency: 5,
        }
    );

    worker.on('failed', (job, err) => {
        logger.error(`[Worker] Job ${job?.id} failed:`, err.message);
    });

    logger.info('[Worker] Blast Worker is now listening for jobs.');
}

async function backfillScheduledJobs() {
    // logger.debug('[Worker] Checking for unsent recipients to backfill...');
    const pendingRecipients = await prisma.blastRecipient.findMany({
        where: { status: 'PENDING' },
        include: { blastJob: true }
    });

    for (const recipient of pendingRecipients) {
        const job = recipient.blastJob;
        const delay = job.scheduledAt ? Math.max(0, new Date(job.scheduledAt).getTime() - Date.now()) : 0;
        await addRecipientJob(recipient.id, delay);
    }

    if (pendingRecipients.length > 0) {
        logger.info(`[Worker] Backfilled ${pendingRecipients.length} recipients into Redis.`);
    }
}

