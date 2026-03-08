import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../config/prisma';
import { userRepository } from '../repositories/userRepository';

export const agentController = {
    async list(request: FastifyRequest, reply: FastifyReply) {
        const { id: userId } = request.user;
        const agents = await prisma.user.findMany({
            where: { parentId: userId, role: 'AGENT' },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                permissions: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' }
        });
        return reply.send({ success: true, data: agents });
    },

    async create(request: FastifyRequest, reply: FastifyReply) {
        const { id: userId } = request.user;
        const { email, password, name, phone, permissions } = request.body as any;

        const existing = await userRepository.findByEmail(email);
        if (existing) {
            return reply.status(400).send({ success: false, message: 'Email already registered' });
        }

        const agent = await userRepository.create({
            email,
            password,
            name,
            role: 'AGENT',
            parentId: userId,
            permissions: permissions || {},
            subscriptionStatus: 'ACTIVE', // Agents inherit activity from parent's plan mostly, but need active status to login
        });

        const { password: _, ...safe } = agent;
        return reply.status(201).send({ success: true, data: safe });
    },

    async update(request: FastifyRequest, reply: FastifyReply) {
        const { id: userId } = request.user;
        const { id: agentId } = request.params as { id: string };
        const { name, phone, permissions, password } = request.body as any;

        const agent = await prisma.user.findFirst({
            where: { id: agentId, parentId: userId }
        });

        if (!agent) {
            return reply.status(404).send({ success: false, message: 'Agent not found' });
        }

        const updateData: any = { name, phone, permissions };
        if (password) {
            const { hashPassword } = await import('../utils/hash');
            updateData.password = await hashPassword(password);
        }

        const updatedAgent = await prisma.user.update({
            where: { id: agentId },
            data: updateData
        });

        const { password: _, ...safe } = updatedAgent;
        return reply.send({ success: true, data: safe });
    },

    async delete(request: FastifyRequest, reply: FastifyReply) {
        const { id: userId } = request.user;
        const { id: agentId } = request.params as { id: string };

        const agent = await prisma.user.findFirst({
            where: { id: agentId, parentId: userId }
        });

        if (!agent) {
            return reply.status(404).send({ success: false, message: 'Agent not found' });
        }

        await prisma.user.delete({ where: { id: agentId } });
        return reply.send({ success: true, message: 'Agent deleted successfully' });
    }
};
