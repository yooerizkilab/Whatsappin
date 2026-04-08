import { Queue, Worker, ConnectionOptions } from 'bullmq';
import { redisConnection } from '../config/redis';
import { prisma } from '../config/prisma';
import { logger } from '../utils/logger';

export async function startCronWorker() {
    logger.info('[Cron Worker] Initializing Purge Logs Cron Worker...');

    const cronQueue = new Queue('cron-queue', { connection: redisConnection as ConnectionOptions });

    // Add repeatable job (runs every day at 00:00 midnight)
    await cronQueue.add('purge-old-logs', {}, {
        repeat: {
            pattern: '0 0 * * *'
        },
        jobId: 'purge-old-logs-job' // Prevent duplicate adding
    });

    const worker = new Worker('cron-queue', async (job) => {
        if (job.name === 'purge-old-logs') {
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

            try {
                logger.info(`[Cron Worker] Starting purge for messages older than ${threeMonthsAgo.toISOString()}`);
                
                const { count } = await prisma.message.deleteMany({
                    where: {
                        createdAt: {
                            lt: threeMonthsAgo
                        }
                    }
                });
                
                logger.info(`[Cron Worker] Successfully purged ${count} old messages (> 90 days).`);
            } catch (err: any) {
                logger.error(`[Cron Worker] Failed to purge logs:`, err.message);
            }
        }
    }, { connection: redisConnection as ConnectionOptions });

    worker.on('failed', (job, err) => {
        logger.error(`[Cron Worker] Job ${job?.name} failed:`, err.message);
    });

    logger.info('[Cron Worker] Started.');
}
