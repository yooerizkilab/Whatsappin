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

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isTransientDeviceConnectionError(error: any) {
    const message = String(error?.message || '').toLowerCase();
    return [
        'is not connected',
        'connection closed',
        'stream errored',
        'timed out',
        'not open',
        'connection was lost',
    ].some((pattern) => message.includes(pattern));
}

async function refreshDeviceSession(deviceId: string) {
    try {
        logger.info(`[Worker] Refreshing WhatsApp session for device ${deviceId} before retry.`);
        await sessionManager.createSession(deviceId);
    } catch (refreshError: any) {
        logger.error(`[Worker] Failed to refresh session for device ${deviceId}:`, refreshError.message);
    }
}

async function ensureDeviceSession(deviceId: string) {
    const hasReadySession = () => Boolean(sessionManager.getSession(deviceId)?.socket.user);

    if (!hasReadySession()) {
        logger.info(`[Worker] Restoring WhatsApp session for device ${deviceId} before sending blast.`);
        if (!sessionManager.getSession(deviceId)) {
            await sessionManager.createSession(deviceId);
        }
    }

    const deadline = Date.now() + 15000;
    while (!hasReadySession() && Date.now() < deadline) {
        await wait(500);
    }

    if (!hasReadySession()) {
        throw new Error(`Device ${deviceId} is not connected`);
    }
}

async function completeBlastJobIfDone(blastJobId: string) {
    const counts = await blastRepository.countRecipients(blastJobId);
    if (counts.pending === 0) {
        const finalStatus = counts.sent > 0 ? 'COMPLETED' : 'FAILED';

        await blastRepository.updateJobStatus(blastJobId, finalStatus, {
            completedAt: new Date(),
        });
        wsServer.broadcast('blast_completed', {
            blastJobId,
            status: finalStatus,
            stats: counts
        });
        logger.info(`[Worker] Blast job ${blastJobId} ${finalStatus}`);
    }
}

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
                await completeBlastJobIfDone(recipient.blastJobId);
                return;
            }

            // Mark job as processing on first recipient if it's still PENDING
            if (blastJob.status === 'PENDING' || blastJob.status === 'SCHEDULED') {
                await blastRepository.updateJobStatus(blastJob.id, 'PROCESSING', {
                    startedAt: new Date(),
                });
            }

            try {
                logger.info(`[Worker] Sending blast to ${recipient.phone} via device ${device.id} (${device.phoneNumber || 'unknown number'}) type=${blastJob.type}`);

                await ensureDeviceSession(device.id);
                await sessionManager.assertWhatsAppRecipient(device.id, recipient.phone);

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

                logger.info(`[Worker] Successfully sent blast to ${recipient.phone} via device ${device.id}`);

                await blastRepository.updateRecipientStatus(recipient.id, 'SENT', undefined, new Date());

                wsServer.sendToDevice(device.id, 'blast_progress', {
                    blastJobId: recipient.blastJobId,
                    phone: recipient.phone,
                    status: 'SENT',
                });
            } catch (err: any) {
                logger.error(`[Worker] Failed to send to ${recipient.phone}:`, err.message);

                if (isTransientDeviceConnectionError(err)) {
                    await blastRepository.resetRecipientPending(recipient.id, err.message);
                    await refreshDeviceSession(device.id);
                    throw err;
                }

                await blastRepository.updateRecipientStatus(recipient.id, 'FAILED', err.message);

                wsServer.sendToDevice(device.id, 'blast_progress', {
                    blastJobId: recipient.blastJobId,
                    phone: recipient.phone,
                    status: 'FAILED',
                    error: err.message,
                });
            }

            await completeBlastJobIfDone(recipient.blastJobId);
        },
        {
            connection: redisConnection as ConnectionOptions,
            concurrency: 5,
        }
    );

    worker.on('failed', async (job, err) => {
        logger.error(`[Worker] Job ${job?.id} failed:`, err.message);
        const attempts = job?.opts.attempts || 1;
        const attemptsMade = job?.attemptsMade || 0;
        if (attemptsMade < attempts) return;

        const recipientId = (job?.data as { recipientId?: string } | undefined)?.recipientId;
        if (!recipientId) return;

        const recipient = await blastRepository.findRecipientById(recipientId);
        if (!recipient || recipient.status === 'SENT' || recipient.status === 'FAILED') return;

        await blastRepository.updateRecipientStatus(recipient.id, 'FAILED', err.message);
        await completeBlastJobIfDone(recipient.blastJobId);
    });

    logger.info('[Worker] Blast Worker is now listening for jobs.');
}

async function backfillScheduledJobs() {
    // logger.debug('[Worker] Checking for unsent recipients to backfill...');
    const pendingRecipients = await prisma.blastRecipient.findMany({
        where: { status: 'PENDING' },
        include: { blastJob: true },
        orderBy: [
            { blastJobId: 'asc' },
            { createdAt: 'asc' },
        ],
    });

    const blastDelayOffsets = new Map<string, number>();

    for (const recipient of pendingRecipients) {
        const job = recipient.blastJob;
        const offset = blastDelayOffsets.get(job.id) || 0;
        const delay = job.scheduledAt ? Math.max(0, new Date(job.scheduledAt).getTime() - Date.now()) : 0;
        await addRecipientJob(recipient.id, delay + offset);
        // Random jitter between 60%-140% of MESSAGE_DELAY_MS so intervals look natural
        const jitter = Math.round(env.MESSAGE_DELAY_MS * (0.6 + Math.random() * 0.8));
        blastDelayOffsets.set(job.id, offset + jitter);
    }

    if (pendingRecipients.length > 0) {
        logger.info(`[Worker] Backfilled ${pendingRecipients.length} recipients into Redis.`);
    }
}

if (require.main === module) {
    (async () => {
        await sessionManager.restoreAllSessions();
        logger.info('[Worker] WhatsApp sessions restored');
        await startBlastWorker();
    })().catch((err) => {
        logger.error('[Worker] Failed to start Blast Worker:', err);
        process.exit(1);
    });
}
