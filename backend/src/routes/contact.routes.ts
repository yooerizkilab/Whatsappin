import { FastifyInstance } from 'fastify';
import { contactController } from '../controllers/contactController';
import { authenticate } from '../middlewares/auth';

export async function contactRoutes(fastify: FastifyInstance) {
    fastify.addHook('preHandler', authenticate);

    fastify.get('/', contactController.list);
    fastify.post('/', contactController.create);
    fastify.put('/:id', contactController.update);
    fastify.delete('/:id', contactController.delete);
    fastify.post('/import', contactController.importCsv);
    fastify.get('/groups', contactController.listGroups);
    fastify.post('/groups', contactController.createGroup);
    fastify.delete('/groups/:id', contactController.deleteGroup);
}
