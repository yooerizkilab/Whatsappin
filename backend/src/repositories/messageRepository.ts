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
        // Fetch latest message per unique conversation partner using raw SQL
        // This is more efficient than loading all messages and deduping in JS
        const raw = await prisma.$queryRawUnsafe<Array<{ id: string; remote: string; content: string; to: string; from: string | null; direction: string; status: string; createdAt: Date }>>(`
            SELECT m.*, COALESCE(m.from, m.to) AS remote
            FROM messages m
            INNER JOIN (
                SELECT
                    CASE
                        WHEN direction = 'OUTGOING' THEN \`to\`
                        ELSE \`from\`
                    END AS remote_jid,
                    MAX(created_at) AS max_created
                FROM messages
                WHERE device_id = ?
                GROUP BY remote_jid
            ) latest
                ON m.device_id = ?
                AND m.created_at = latest.max_created
                AND COALESCE(m.from, m.to) = latest.remote_jid
            ORDER BY m.created_at DESC
            LIMIT 100
        `, deviceId, deviceId);

        return raw.map(row => ({
            id: row.id,
            content: row.content,
            to: row.to,
            from: row.from,
            direction: row.direction,
            status: row.status,
            createdAt: row.createdAt,
            remote: row.remote
        }));
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
