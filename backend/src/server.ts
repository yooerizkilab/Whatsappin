import 'dotenv/config';
import Fastify from 'fastify';
import path from 'path';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import { env } from './config/env';
import fastifyWebsocket from '@fastify/websocket';
import { errorHandler } from './middlewares/errorHandler';
import fastifyStatic from '@fastify/static';
import { authenticate } from './middlewares/auth';
import rateLimit from '@fastify/rate-limit';
import { redisConnection } from './config/redis';
import compression from '@fastify/compress';
import { authRoutes } from './routes/auth.routes';
import { deviceRoutes } from './routes/device.routes';
import { messageRoutes } from './routes/message.routes';
import { templateRoutes } from './routes/template.routes';
import { contactRoutes } from './routes/contact.routes';
import { autoResponderRoutes } from './routes/autoResponder.routes';
import webhookRoutes from './routes/webhook.routes';
import { billingRoutes } from './routes/billing.routes';
import { chatRoutes } from './routes/chat.routes';
import { adminRoutes } from './routes/admin.routes';
import { apiKeyRoutes } from './routes/apiKey.routes';
import { analyticsRoutes } from './routes/analytics.routes';
import { tagRoutes } from './routes/tag.routes';
import { mediaRoutes } from './routes/media.routes';
import { agentRoutes } from './routes/agent.routes';
import { knowledgeRoutes } from './routes/knowledge.routes';
import { wsServer } from './websocket/wsServer';
import { sessionManager } from './baileys/sessionManager';
import { prisma } from './config/prisma';
import { startBlastWorker } from './workers/blastWorker';
import { logger } from './utils/logger';

async function buildServer() {
    const fastify = Fastify({
        logger: false,
    });

    // ── Plugins ──────────────────────────────────────────────
    await fastify.register(cors, {
        origin: [env.FRONTEND_URL],
        credentials: true,
    });

    await fastify.register(compression);

    await fastify.register(jwt, { secret: env.JWT_SECRET });

    await fastify.register(multipart, {
        limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    });

    // ── Rate Limiter ─────────────────────────────────────────
    await fastify.register(rateLimit, {
        max: 100, // Default 100 requests
        timeWindow: '1 minute',
        redis: redisConnection,
        keyGenerator: (request) => {
            return (request.user as any)?.id || request.ip;
        },
        allowList: ['/ws', '/health', '/ping'],
    });

    // Expose authenticate decorator
    fastify.decorate('authenticate', authenticate);

    // ── WebSocket Plugin ──────────────────────────────────────
    await fastify.register(fastifyWebsocket);

    fastify.register(async (fastify) => {
        fastify.get('/ws', { websocket: true }, (connection: any, req: any) => {
            wsServer.handleConnection(connection.socket);
        });
    });

    // ── Health ────────────────────────────────────────────────
    fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

    fastify.register(fastifyStatic, {
        root: path.join(__dirname, '../uploads'),
        prefix: '/uploads/',
    });

    // ── Routes ────────────────────────────────────────────────
    fastify.get('/ping', async () => ({ pong: true }));

    // API Versioning v1
    fastify.register(async (v1) => {
        v1.register(authRoutes, { prefix: '/auth' });
        v1.register(deviceRoutes, { prefix: '/devices' });
        v1.register(messageRoutes, { prefix: '/messages' });
        v1.register(chatRoutes, { prefix: '/chats' });
        v1.register(templateRoutes, { prefix: '/templates' });
        v1.register(contactRoutes, { prefix: '/contacts' });
        v1.register(autoResponderRoutes, { prefix: '/auto-responder' });
        v1.register(webhookRoutes, { prefix: '/webhooks' });
        v1.register(billingRoutes, { prefix: '/billing' });
        v1.register(adminRoutes, { prefix: '/admin' });
        v1.register(apiKeyRoutes, { prefix: '/api-keys' });
        v1.register(analyticsRoutes, { prefix: '/analytics' });
        v1.register(tagRoutes, { prefix: '/tags' });
        v1.register(mediaRoutes, { prefix: '/media' });
        v1.register(agentRoutes, { prefix: '/agents' });
        v1.register(knowledgeRoutes, { prefix: '/knowledge' });
    }, { prefix: '/v1' });

    // ── Error handler ─────────────────────────────────────────
    fastify.setErrorHandler(errorHandler);

    return fastify;
}

async function start() {
    const fastify = await buildServer();

    try {
        await fastify.listen({ port: env.PORT, host: env.HOST });

        // ── WebSocket ──────────────────────────────────────────
        logger.info(`WebSocket server ready at /ws`);

        // ── Restore active WhatsApp sessions ──────────────────
        await sessionManager.restoreAllSessions();
        logger.info(`WhatsApp sessions restored`);

        // ── Start Blast Worker ────────────────────────────────
        await startBlastWorker();
        logger.info(`Blast worker started`);

        logger.info(`Server running at http://${env.HOST}:${env.PORT}`);
    } catch (err) {
        logger.error('Failed to start server:', err);
        process.exit(1);
    }

    // ── Graceful shutdown ─────────────────────────────────────
    const shutdown = async () => {
        logger.info('Shutting down gracefully...');
        await prisma.$disconnect();
        await fastify.close();
        process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
}

start();
