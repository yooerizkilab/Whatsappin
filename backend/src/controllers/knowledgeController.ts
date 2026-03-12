import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../config/prisma';
import { knowledgeService } from '../services/knowledgeService';

export const knowledgeController = {
  async getKnowledgeBase(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).id;
    const { deviceId } = request.params as { deviceId: string };

    const kb = await prisma.knowledgeBase.findFirst({
      where: { userId, deviceId },
      include: {
        sources: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return reply.send(kb || { sources: [] });
  },

  async createKnowledgeBase(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).id;
    const { deviceId, name } = request.body as { deviceId: string; name: string };

    const kb = await prisma.knowledgeBase.upsert({
      where: { deviceId },
      update: { name },
      create: {
        userId,
        deviceId,
        name,
      }
    });

    return reply.send(kb);
  },

  async addSource(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).id;
    const { kbId, type, url, content } = request.body as { 
      kbId: string; 
      type: 'URL' | 'TEXT'; 
      url?: string; 
      content?: string 
    };

    // Verify ownership
    const kb = await prisma.knowledgeBase.findFirst({ where: { id: kbId, userId } });
    if (!kb) return reply.status(404).send({ error: 'Knowledge Base not found' });

    if (type === 'URL' && url) {
        // Run ingestion in background (or use a worker/queue for production)
        knowledgeService.ingestUrl(kbId, url).catch(console.error);
        return reply.send({ message: 'URL ingestion started' });
    } else if (type === 'TEXT' && content) {
        const source = await prisma.knowledgeSource.create({
            data: {
                knowledgeBaseId: kbId,
                type: 'TEXT',
                content,
                status: 'PROCESSING'
            }
        });
        
        knowledgeService.processContent(source.id, content)
            .then(() => prisma.knowledgeSource.update({ where: { id: source.id }, data: { status: 'COMPLETED' } }))
            .catch(() => prisma.knowledgeSource.update({ where: { id: source.id }, data: { status: 'FAILED' } }));

        return reply.send({ message: 'Text source added' });
    }

    return reply.status(400).send({ error: 'Invalid source data' });
  },

  async deleteSource(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).id;
    const { id } = request.params as { id: string };

    // Verify ownership via KnowledgeBase
    const source = await prisma.knowledgeSource.findFirst({
        where: { id, knowledgeBase: { userId } }
    });

    if (!source) return reply.status(404).send({ error: 'Source not found' });

    await prisma.knowledgeSource.delete({ where: { id } });
    return reply.send({ success: true });
  }
};
