import { prisma } from '../config/prisma';

export const blastRepository = {
    async createJob(data: {
        userId: string;
        deviceId: string;
        templateId?: string;
        name: string;
        message: string;
        type?: 'TEXT' | 'IMAGE' | 'DOCUMENT';
        mediaUrl?: string;
        scheduledAt?: Date;
    }) {
        return prisma.blastJob.create({
            data: {
                ...data,
                type: (data.type as any) || 'TEXT',
                status: data.scheduledAt ? 'SCHEDULED' : 'PENDING'
            }
        });
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


    async markRecipientProcessing(id: string) {
        return prisma.blastRecipient.updateMany({
            where: { id, status: 'PENDING' },
            data: { status: 'PROCESSING' as any },
        });
    },

    async resetRecipientPending(id: string, error?: string) {
        return prisma.blastRecipient.update({
            where: { id },
            data: { status: 'PENDING' as any, error },
        });
    },

    async updateRecipientStatus(id: string, status: 'SENT' | 'FAILED', error?: string, sentAt?: Date) {
        const recipient = await prisma.blastRecipient.update({
            where: { id },
            data: { status, error, ...(sentAt && { sentAt }) },
            include: { blastJob: true }
        });

        // Increment counts on the parent job
        if (status === 'SENT') {
            await prisma.blastJob.update({
                where: { id: recipient.blastJobId },
                data: { sentCount: { increment: 1 } }
            });
        } else if (status === 'FAILED') {
            await prisma.blastJob.update({
                where: { id: recipient.blastJobId },
                data: { failedCount: { increment: 1 } }
            });
        }

        return recipient;
    },

    async findRecipientById(id: string) {
        return prisma.blastRecipient.findUnique({
            where: { id },
            include: { blastJob: { include: { device: true } } },
        });
    },

    async deleteJob(id: string) {
        return prisma.blastJob.delete({ where: { id } });
    },

    async countRecipients(blastJobId: string) {
        const job = await prisma.blastJob.findUnique({
            where: { id: blastJobId },
            select: { totalRecipients: true, sentCount: true, failedCount: true }
        });

        if (job) {
            return {
                total: job.totalRecipients,
                sent: job.sentCount,
                failed: job.failedCount,
                pending: job.totalRecipients - (job.sentCount + job.failedCount)
            };
        }

        // Fallback to slow count if job not found (shouldn't happen)
        const [total, sent, failed, pending] = await Promise.all([
            prisma.blastRecipient.count({ where: { blastJobId } }),
            prisma.blastRecipient.count({ where: { blastJobId, status: 'SENT' } }),
            prisma.blastRecipient.count({ where: { blastJobId, status: 'FAILED' } }),
            prisma.blastRecipient.count({ where: { blastJobId, status: 'PENDING' } }),
        ]);
        return { total, sent, failed, pending };
    }
};
