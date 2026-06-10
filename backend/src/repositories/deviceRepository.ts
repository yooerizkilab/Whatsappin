import { prisma } from '../config/prisma';
import { DeviceStatus } from '@prisma/client';

export const deviceRepository = {
    async findAll(userId: string) {
        return prisma.device.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    },

    async findById(id: string) {
        return prisma.device.findUnique({ where: { id } });
    },

    async create(data: { userId: string; name: string }) {
        return prisma.device.create({ data });
    },

    async updateStatus(id: string, status: DeviceStatus, phoneNumber?: string | null) {
        return prisma.device.update({
            where: { id },
            data: { status, ...(phoneNumber !== undefined && { phoneNumber }) },
        });
    },

    async delete(id: string) {
        return prisma.device.delete({ where: { id } });
    },
};
