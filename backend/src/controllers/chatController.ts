import { FastifyRequest, FastifyReply } from 'fastify';
import { messageRepository } from '../repositories/messageRepository';
import { prisma } from '../config/prisma';

export const chatController = {
    async getChatList(request: FastifyRequest, reply: FastifyReply) {
        const { deviceId } = request.query as { deviceId: string };
        const { ownerId } = request.user;
        if (!deviceId) return reply.status(400).send({ message: 'Device ID is required' });

        const device = await prisma.device.findFirst({ where: { id: deviceId, userId: ownerId } });
        if (!device) return reply.status(404).send({ message: 'Device not found' });

        const chats = await messageRepository.getChatList(deviceId);
        return reply.send({ success: true, data: chats });
    },

    async getChatHistory(request: FastifyRequest, reply: FastifyReply) {
        const { deviceId, phone } = request.query as { deviceId: string; phone: string };
        const { ownerId } = request.user;
        if (!deviceId || !phone) {
            return reply.status(400).send({ message: 'Device ID and Phone are required' });
        }

        const device = await prisma.device.findFirst({ where: { id: deviceId, userId: ownerId } });
        if (!device) return reply.status(404).send({ message: 'Device not found' });

        const history = await messageRepository.getChatHistory(deviceId, phone);
        return reply.send({ success: true, data: history });
    },
};
