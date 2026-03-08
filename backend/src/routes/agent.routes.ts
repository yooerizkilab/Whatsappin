import { FastifyInstance } from 'fastify';
import { agentController } from '../controllers/agentController';
import { authenticate } from '../middlewares/auth';

export async function agentRoutes(fastify: FastifyInstance) {
    fastify.addHook('preHandler', authenticate);

    // Only USER role can manage agents (AGENT cannot manage other agents)
    fastify.addHook('preHandler', async (request, reply) => {
        const user = request.user as { role: string };
        if (user.role !== 'USER' && user.role !== 'ADMIN') {
            return reply.status(403).send({ success: false, message: 'Forbidden: Only primary users can manage team members' });
        }
    });

    fastify.get('/', agentController.list);
    fastify.post('/', agentController.create);
    fastify.put('/:id', agentController.update);
    fastify.delete('/:id', agentController.delete);
}
