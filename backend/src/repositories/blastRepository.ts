import { prisma } from '../config/prisma';

export const blastRepository = {
    async createJob(data: {
        userId: string;
        deviceId: string;
        templateId?: string;
        name: string;
        message: string;
        scheduledAt?: Date;
    }) {
        return prisma.blastJob.create({ data: { ...data, status: data.scheduledAt ? 'SCHEDULED' : 'PENDING' } });
    },

    async createRecipients(
        recipients: { blastJobId: string; contactId?: string; phone: string; message: string }[]
    ) {
        return prisma.blastRecipient.createMany({ data: recipients });
    },

    async findJobsByUser(userId: string) {
        return prisma.blastJob.findMany({
            where: { userId },
            include: {
                device: { select: { name: true } },
                template: { select: { name: true } },
                _count: { select: { recipients: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    },

    async findJobById(id: string) {
        return prisma.blastJob.findUnique({
            where: { id },
            include: { recipients: true },
        });
    },

    async updateJobStatus(id: string, status: string, extra?: { startedAt?: Date; completedAt?: Date }) {
        return prisma.blastJob.update({ where: { id }, data: { status: status as any, ...extra } });
    },


    async updateRecipientStatus(id: string, status: 'SENT' | 'FAILED', error?: string, sentAt?: Date) {
        return prisma.blastRecipient.update({
            where: { id },
            data: { status, error, ...(sentAt && { sentAt }) },
        });
    },

    async findRecipientById(id: string) {
        return prisma.blastRecipient.findUnique({
            where: { id },
            include: { blastJob: { include: { device: true } } },
        });
    },

    async countRecipients(blastJobId: string) {
        const [total, sent, failed, pending] = await Promise.all([
            prisma.blastRecipient.count({ where: { blastJobId } }),
            prisma.blastRecipient.count({ where: { blastJobId, status: 'SENT' } }),
            prisma.blastRecipient.count({ where: { blastJobId, status: 'FAILED' } }),
            prisma.blastRecipient.count({ where: { blastJobId, status: 'PENDING' } }),
        ]);
        return { total, sent, failed, pending };
    }
};
