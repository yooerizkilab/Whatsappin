import { FastifyRequest, FastifyReply } from 'fastify';
import { deviceRepository } from '../repositories/deviceRepository';
import { sessionManager } from '../baileys/sessionManager';

export const deviceController = {
    async list(request: FastifyRequest, reply: FastifyReply) {
        const { ownerId } = request.user;
        const devices = await deviceRepository.findAll(ownerId);
        return reply.send({ success: true, data: devices });
    },

    async connect(request: FastifyRequest, reply: FastifyReply) {
        const { ownerId } = request.user;
        const { name } = request.body as { name: string };

        const device = await deviceRepository.create({ userId: ownerId, name });
        await deviceRepository.updateStatus(device.id, 'CONNECTING');

        // Start Baileys session asynchronously
        sessionManager.createSession(device.id).catch((err) =>
            console.error('Session start error:', err)
        );

        return reply.status(201).send({
            success: true,
            data: { ...device, status: 'CONNECTING' },
            message: 'Device created. Scan the QR code shortly.',
        });
    },

    async disconnect(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const { ownerId } = request.user;

        const device = await deviceRepository.findById(id);
        if (!device || device.userId !== ownerId) {
            return reply.status(404).send({ success: false, message: 'Device not found' });
        }

        await sessionManager.destroySession(id);
        await deviceRepository.delete(id);

        return reply.send({ success: true, message: 'Device disconnected and removed' });
    },

    async getStatus(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const device = await deviceRepository.findById(id);
        if (!device) return reply.status(404).send({ success: false, message: 'Device not found' });
        return reply.send({ success: true, data: { status: device.status, phoneNumber: device.phoneNumber } });
    },
};
