import { FastifyInstance } from 'fastify';
import { deviceController } from '../controllers/deviceController';
import { authenticate, hasActiveSubscription } from '../middlewares/auth';
import { quotaMiddleware } from '../middlewares/quotaMiddleware';

export async function deviceRoutes(fastify: FastifyInstance) {
    fastify.addHook('preHandler', authenticate);

    fastify.get('/', deviceController.list);
    fastify.post('/connect', { preHandler: [hasActiveSubscription, quotaMiddleware.checkDeviceQuota] }, deviceController.connect);
    fastify.get('/:id/status', deviceController.getStatus);
    fastify.delete('/:id', deviceController.disconnect);
}
