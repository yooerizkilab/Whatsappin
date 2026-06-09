import { FastifyRequest, FastifyReply } from 'fastify';
import { templateRepository } from '../repositories/templateRepository';

export const templateController = {
    async list(request: FastifyRequest, reply: FastifyReply) {
        const { ownerId } = request.user;
        const { page: pageStr, pageSize: pageSizeStr } = request.query as { page?: string; pageSize?: string };
        const page = Math.max(1, parseInt(pageStr || '1', 10) || 1);
        const pageSize = Math.min(100, Math.max(1, parseInt(pageSizeStr || '20', 10) || 20));
        const skip = (page - 1) * pageSize;
        const result = await templateRepository.findAll(ownerId, skip, pageSize);
        return reply.send({
            success: true,
            data: result.data,
            pagination: {
                page,
                pageSize,
                total: result.total,
                totalPages: Math.ceil(result.total / pageSize),
            }
        });
    },

    async create(request: FastifyRequest, reply: FastifyReply) {
        const { ownerId } = request.user;
        const { name, content, variables } = request.body as {
            name: string;
            content: string;
            variables?: string[];
        };
        const template = await templateRepository.create({ userId: ownerId, name, content, variables });
        return reply.status(201).send({ success: true, data: template });
    },

    async update(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const data = request.body as Partial<{ name: string; content: string; variables: string[] }>;
        const template = await templateRepository.update(id, data);
        return reply.send({ success: true, data: template });
    },

    async delete(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        await templateRepository.delete(id);
        return reply.send({ success: true, message: 'Template deleted' });
    },
};
