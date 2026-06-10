import { FastifyInstance } from 'fastify';
import { messageController } from '../controllers/messageController';
import { blastController } from '../controllers/blastController';
import { authenticate, hasActiveSubscription } from '../middlewares/auth';
import { quotaMiddleware } from '../middlewares/quotaMiddleware';

export async function messageRoutes(fastify: FastifyInstance) {
    fastify.addHook('preHandler', authenticate);

    fastify.post('/send', { preHandler: [hasActiveSubscription, quotaMiddleware.checkMessageQuota] }, messageController.send);
    fastify.get('/logs', messageController.getLogs);
    fastify.get('/logs/report', messageController.downloadReport);
    fastify.post('/blast', { preHandler: [hasActiveSubscription] }, blastController.create);
    fastify.get('/blast', blastController.list);
    fastify.get('/blast/:id', blastController.getJob);
    fastify.get('/blast/:id/report', blastController.downloadReport);
    fastify.delete('/blast/:id', blastController.deleteJob);
}
