import { Queue, ConnectionOptions } from 'bullmq';
import { redisConnection } from '../config/redis';

export const blastQueue = new Queue('blast-queue', {
    connection: redisConnection as ConnectionOptions,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
});

export const addRecipientJob = async (recipientId: string, delayMs?: number) => {
    await blastQueue.add(
        'process-recipient',
        { recipientId },
        {
            delay: delayMs || 0,
            jobId: `blast-recipient-${recipientId}`,
        }
    );
};
