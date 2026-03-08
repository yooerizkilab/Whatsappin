import { prisma } from '../config/prisma';

export const messageRepository = {
    async create(data: {
        deviceId: string;
        to: string;
        type: 'TEXT' | 'IMAGE' | 'DOCUMENT';
        content: string;
        mediaUrl?: string;
    }) {
        return prisma.message.create({ data });
    },

    async updateStatus(id: string, status: string, sentAt?: Date) {
        return prisma.message.update({
            where: { id },
            data: { status: status as any, ...(sentAt && { sentAt }) },
        });
    },

    async addLog(messageId: string, event: string, data?: object) {
        return prisma.messageLog.create({
            data: { messageId, event, data: data as any },
        });
    },

    async findAll(filters: { userId?: string; deviceId?: string; status?: string; limit?: number; offset?: number }) {
        const { userId, deviceId, status, limit = 50, offset = 0 } = filters;
        return prisma.message.findMany({
            where: {
                ...(deviceId && { deviceId }),
                ...(status && { status: status as any }),
                ...(userId && { device: { userId } }),
            },
            include: { device: { select: { name: true } }, logs: true },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        });
    },

    async upsertIncoming(data: {
        deviceId: string;
        from: string;
        to: string;
        externalId: string;
        type: 'TEXT' | 'IMAGE' | 'DOCUMENT';
        content: string;
        status: 'SENT' | 'DELIVERED' | 'READ';
    }) {
        return prisma.message.upsert({
            where: { externalId: data.externalId },
            update: { status: data.status as any },
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

    async count(filters: { deviceId?: string; status?: string }) {
        return prisma.message.count({ where: filters as any });
    },
};
