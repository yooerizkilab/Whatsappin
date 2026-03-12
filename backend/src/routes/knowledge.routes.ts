import { FastifyInstance } from 'fastify';
import { knowledgeController } from '../controllers/knowledgeController';
import { authenticate } from '../middlewares/auth';

export async function knowledgeRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', authenticate);

  fastify.get('/:deviceId', knowledgeController.getKnowledgeBase);
  fastify.post('/', knowledgeController.createKnowledgeBase);
  fastify.post('/sources', knowledgeController.addSource);
  fastify.delete('/sources/:id', knowledgeController.deleteSource);
}
