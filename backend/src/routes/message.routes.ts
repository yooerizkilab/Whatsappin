import { FastifyInstance } from 'fastify';
import { messageController } from '../controllers/messageController';
import { blastController } from '../controllers/blastController';
import { authenticate } from '../middlewares/auth';
import { quotaMiddleware } from '../middlewares/quotaMiddleware';

export async function messageRoutes(fastify: FastifyInstance) {
    fastify.addHook('preHandler', authenticate);

    fastify.post('/send', { preHandler: [quotaMiddleware.checkMessageQuota] }, messageController.send);
    fastify.get('/logs', messageController.getLogs);
    fastify.post('/blast', blastController.create);
    fastify.get('/blast', blastController.list);
    fastify.get('/blast/:id', blastController.getJob);
    fastify.delete('/blast/:id', blastController.deleteJob);
}
