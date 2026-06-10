import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

export const redisConnection = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    maxRetriesPerRequest: null, // Required for BullMQ
    retryStrategy(times) {
        const delay = Math.min(times * 100, 3000);
        logger.warn(`[Redis] Retrying connection (attempt ${times}) in ${delay}ms...`);
        return delay;
    },
    reconnectOnError(err) {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
            // Only reconnect when the error contains "READONLY"
            return true;
        }
        return false;
    }
});

redisConnection.on('error', (err) => {
    logger.error('[Redis] Connection error:', err.message);
});

redisConnection.on('connect', () => {
    logger.info(`[Redis] Connected to ${env.REDIS_HOST}:${env.REDIS_PORT}`);
});
