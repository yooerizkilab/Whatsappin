import { prisma } from '../config/prisma';
import { MessageStatus, MessageType } from '@prisma/client';

export const messageRepository = {
    async create(data: {
        deviceId: string;
        to: string;
        type: MessageType;
        content: string;
        mediaUrl?: string;
        scheduledAt?: Date | null;
    }) {
        return prisma.message.create({ data });
    },

    async updateStatus(id: string, status: MessageStatus, sentAt?: Date) {
        return prisma.message.update({
            where: { id },
            data: { status, ...(sentAt && { sentAt }) },
        });
    },

    async addLog(messageId: string, event: string, data?: object) {
        return prisma.messageLog.create({
            data: { messageId, event, data: data as any },
        });
    },

    async findAll(filters: { userId?: string; deviceId?: string; status?: MessageStatus; limit?: number; offset?: number }) {
        const { userId, deviceId, status, limit = 50, offset = 0 } = filters;
        const where = {
            ...(deviceId && { deviceId }),
            ...(status && { status }),
            ...(userId && { device: { userId } }),
        };
        const [data, total] = await prisma.$transaction([
            prisma.message.findMany({
                where,
                include: { device: { select: { name: true } }, logs: true },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            prisma.message.count({ where }),
        ]);
        return { data, total };
    },

    async upsertIncoming(data: {
        deviceId: string;
        from: string;
        to: string;
        externalId: string;
        type: MessageType;
        content: string;
        status: MessageStatus;
    }) {
        return prisma.message.upsert({
            where: { externalId: data.externalId },
            update: { status: data.status },
            create: {
                ...data,
                direction: 'INCOMING',
            },
        });
    },

    async getChatList(deviceId: string) {
        // SQL query to get latest message per unique contact (remote)
        // For simplicity with Prisma, we'll fetch recently active messages and unique them in JS for now
        // or use raw query for performance later.
        const messages = await prisma.message.findMany({
            where: { deviceId },
            orderBy: { createdAt: 'desc' },
            distinct: ['to', 'from'], // This is limited in some DBs, let's refine
            take: 100,
        });

        // Group by 'remote' phone number
        const chats: Record<string, any> = {};
        messages.forEach(msg => {
            const remote = msg.direction === 'OUTGOING' ? msg.to : msg.from;
            if (remote && !chats[remote]) {
                chats[remote] = msg;
            }
        });

        return Object.values(chats);
    },

    async getChatHistory(deviceId: string, remotePhone: string) {
        return prisma.message.findMany({
            where: {
                deviceId,
                OR: [
                    { to: remotePhone },
                    { from: remotePhone }
                ]
            },
            include: { logs: true },
            orderBy: { createdAt: 'asc' },
        });
    },

    async count(filters: { deviceId?: string; status?: MessageStatus }) {
        return prisma.message.count({ where: filters });
    },
};
