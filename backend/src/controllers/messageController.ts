import { FastifyRequest, FastifyReply } from 'fastify';
import { messageRepository } from '../repositories/messageRepository';
import { sessionManager } from '../baileys/sessionManager';
import { prisma } from '../config/prisma';

export const messageController = {
    async send(request: FastifyRequest, reply: FastifyReply) {
        const { deviceId, to, type = 'TEXT', content, mediaUrl } = request.body as {
            deviceId: string;
            to: string;
            type?: 'TEXT' | 'IMAGE' | 'DOCUMENT';
            content: string;
            mediaUrl?: string;
        };

        const message = await messageRepository.create({ deviceId, to, type, content, mediaUrl });

        try {
            if (type === 'TEXT') {
                await sessionManager.sendTextMessage(deviceId, to, content);
            } else if (type === 'IMAGE' && mediaUrl) {
                await sessionManager.sendImageMessage(deviceId, to, mediaUrl, content);
            } else if (type === 'DOCUMENT' && mediaUrl) {
                await sessionManager.sendDocumentMessage(deviceId, to, mediaUrl, content);
            }

            await messageRepository.updateStatus(message.id, 'SENT', new Date());
            await messageRepository.addLog(message.id, 'sent');

            // Increment kuota message user (Skip if ADMIN)
            const { ownerId, role } = request.user;
            if (role !== 'ADMIN') {
                await prisma.user.update({
                    where: { id: ownerId },
                    data: { messagesSentThisMonth: { increment: 1 } }
                });
            }

            return reply.send({ success: true, data: { ...message, status: 'SENT' } });
        } catch (err: any) {
            await messageRepository.updateStatus(message.id, 'FAILED');
            await messageRepository.addLog(message.id, 'failed', { error: err.message });
            return reply.status(500).send({ success: false, message: err.message || 'Failed to send message' });
        }
    },

    async getLogs(request: FastifyRequest, reply: FastifyReply) {
        const { deviceId, status, limit = '50', offset = '0' } = request.query as {
            deviceId?: string;
            status?: string;
            limit?: string;
            offset?: string;
        };

        const { ownerId } = request.user;
        const messages = await messageRepository.findAll({
            userId: ownerId,
            deviceId,
            status,
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10),
        });

        return reply.send({ success: true, data: messages });
    },
};
