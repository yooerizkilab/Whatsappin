import 'dotenv/config';
import { Worker, Job, ConnectionOptions } from 'bullmq';
import { redisConnection } from '../config/redis';
import { prisma } from '../config/prisma';
import { logger } from '../utils/logger';
import { sessionManager } from '../providers/whatsapp/sessionManager';
import { addMessageJob } from '../queues/messageQueue';
import { messageRepository } from '../repositories/messageRepository';

let messageWorker: Worker | null = null;

export async function startMessageWorker() {
    messageWorker = new Worker(
        'message-queue',
        async (job: Job) => {
            const { messageId } = job.data as { messageId: string };
            // logger.debug(`[MessageWorker] Processing message: ${messageId}`);

            const message = await prisma.message.findUnique({
                where: { id: messageId },
            });

            if (!message) {
                logger.error(`[MessageWorker] Message ${messageId} not found`);
                return;
            }

            if (message.status !== 'PENDING') {
                // logger.debug(`[MessageWorker] Skip: Message ${messageId} status is ${message.status}`);
                return;
            }

            try {
                if (message.type === 'IMAGE' && message.mediaUrl) {
                    await sessionManager.sendImageMessage(message.deviceId, message.to, message.mediaUrl, message.content);
                } else if (message.type === 'DOCUMENT' && message.mediaUrl) {
                    const filename = message.mediaUrl.split('/').pop() || 'document.pdf';
                    await sessionManager.sendDocumentMessage(message.deviceId, message.to, message.mediaUrl, filename);
                    if (message.content) {
                        await sessionManager.sendTextMessage(message.deviceId, message.to, message.content);
                    }
                } else {
                    await sessionManager.sendTextMessage(message.deviceId, message.to, message.content);
                }

                await messageRepository.updateStatus(message.id, 'SENT', new Date());
                await messageRepository.addLog(message.id, 'sent');
            } catch (err: any) {
                logger.error(`[MessageWorker] Failed to send ${messageId}:`, err.message);
                await messageRepository.updateStatus(message.id, 'FAILED');
                await messageRepository.addLog(message.id, 'failed', { error: err.message });
            }
        },
        {
            connection: redisConnection as ConnectionOptions,
            concurrency: 10,
        }
    );

    messageWorker.on('failed', (job, err) => {
        logger.error(`[MessageWorker] Job ${job?.id} failed:`, err.message);
    });

    logger.info('[MessageWorker] BullMQ Message Worker started.');

    // Re-sync pending scheduled messages on startup
    await backfillScheduledMessages();
}

export async function stopMessageWorker() {
    if (messageWorker) {
        await messageWorker.close();
        logger.info('[MessageWorker] BullMQ Message Worker stopped.');
    }
}
