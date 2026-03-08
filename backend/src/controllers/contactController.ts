import { FastifyRequest, FastifyReply } from 'fastify';
import { contactRepository } from '../repositories/contactRepository';
import { parseCsvContacts } from '../utils/csvParser';
import { MultipartFile } from '@fastify/multipart';

export const contactController = {
    async list(request: FastifyRequest, reply: FastifyReply) {
        const { ownerId } = request.user;
        const { groupId, tagId } = request.query as { groupId?: string; tagId?: string };
        const contacts = await contactRepository.findAll(ownerId, groupId, tagId);
        return reply.send({ success: true, data: contacts });
    },

    async create(request: FastifyRequest, reply: FastifyReply) {
        const { ownerId } = request.user;
        const { name, phone, email, groupId, tagIds } = request.body as {
            name: string;
            phone: string;
            email?: string;
            groupId?: string;
            tagIds?: string[];
        };
        const contact = await contactRepository.create({ userId: ownerId, name, phone, email, groupId, tagIds });
        return reply.status(201).send({ success: true, data: contact });
    },

    async update(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const data = request.body as Partial<{ name: string; phone: string; email: string; groupId: string; tagIds: string[] }>;
        const contact = await contactRepository.update(id, data);
        return reply.send({ success: true, data: contact });
    },

    async delete(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        await contactRepository.delete(id);
        return reply.send({ success: true, message: 'Contact deleted' });
    },

    async importCsv(request: FastifyRequest, reply: FastifyReply) {
        const { ownerId } = request.user;

        const data = await request.file();
        if (!data) return reply.status(400).send({ success: false, message: 'No file uploaded' });

        const groupId = (request.query as any).groupId;
        const buffer = await data.toBuffer();
        const parsed = parseCsvContacts(buffer);

        if (parsed.length === 0) {
            return reply.status(400).send({ success: false, message: 'No valid contacts found in CSV' });
        }

        const result = await contactRepository.createMany(
            parsed.map((c) => ({ ...c, userId: ownerId, groupId }))
        );

        return reply.send({
            success: true,
            message: `Imported ${result.count} contacts`,
            data: { count: result.count },
        });
    },

    async listGroups(request: FastifyRequest, reply: FastifyReply) {
        const { ownerId } = request.user;
        const groups = await contactRepository.findGroups(ownerId);
        return reply.send({ success: true, data: groups });
    },

    async createGroup(request: FastifyRequest, reply: FastifyReply) {
        const { ownerId } = request.user;
        const { name } = request.body as { name: string };
        const group = await contactRepository.createGroup(ownerId, name);
        return reply.status(201).send({ success: true, data: group });
    },
};
