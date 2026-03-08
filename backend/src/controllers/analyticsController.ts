import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../config/prisma';
import { startOfMonth, startOfDay, subDays, endOfDay } from 'date-fns';

export const analyticsController = {
    async getSummary(request: FastifyRequest, reply: FastifyReply) {
        const { ownerId } = request.user;
        const now = new Date();
        const monthStart = startOfMonth(now);

        // Get total messages sent this month (for quota comparison)
        const user = await prisma.user.findUnique({
            where: { id: ownerId },
            select: { messagesSentThisMonth: true }
        });

        // Get status distribution for all time or specific period? Let's do last 30 days for dashboard
        const thirtyDaysAgo = subDays(now, 30);

        const stats = await prisma.message.groupBy({
            by: ['status'],
            where: {
                device: { userId: ownerId },
                createdAt: { gte: thirtyDaysAgo }
            },
            _count: {
                id: true
            }
        });

        const summary = {
            totalMonth: user?.messagesSentThisMonth || 0,
            last30Days: {
                sent: stats.find(s => s.status === 'SENT')?._count.id || 0,
                delivered: stats.find(s => s.status === 'DELIVERED')?._count.id || 0,
                read: stats.find(s => s.status === 'READ')?._count.id || 0,
                failed: stats.find(s => s.status === 'FAILED')?._count.id || 0,
                pending: stats.find(s => s.status === 'PENDING')?._count.id || 0,
            }
        };

        const totalOutgoing = summary.last30Days.sent + summary.last30Days.delivered + summary.last30Days.read + summary.last30Days.failed;
        const successCount = summary.last30Days.sent + summary.last30Days.delivered + summary.last30Days.read;

        const successRate = totalOutgoing > 0 ? (successCount / totalOutgoing) * 100 : 0;

        return reply.send({
            success: true,
            data: {
                ...summary,
                successRate: Math.round(successRate * 10) / 10
            }
        });
    },

    async getChartData(request: FastifyRequest, reply: FastifyReply) {
        const { ownerId } = request.user;
        const days = 7; // Default to last 7 days for the main chart
        const now = new Date();
        const startDate = startOfDay(subDays(now, days - 1));

        // Fetch all messages in the range
        const messages = await prisma.message.findMany({
            where: {
                device: { userId: ownerId },
                createdAt: { gte: startDate }
            },
            select: {
                status: true,
                createdAt: true
            }
        });

        // Group by day manually since Prisma doesn't support grouping by dynamic date formats in all DBs easily
        const chartData = [];
        for (let i = 0; i < days; i++) {
            const date = subDays(now, i);
            const dateStr = date.toISOString().split('T')[0];

            const dayMessages = messages.filter(m => m.createdAt.toISOString().split('T')[0] === dateStr);

            chartData.unshift({
                date: dateStr,
                sent: dayMessages.filter(m => ['SENT', 'DELIVERED', 'READ'].includes(m.status)).length,
                failed: dayMessages.filter(m => m.status === 'FAILED').length,
            });
        }

        return reply.send({ success: true, data: chartData });
    },

    async getBlastStats(request: FastifyRequest, reply: FastifyReply) {
        const { ownerId } = request.user;

        const blastJobs = await prisma.blastJob.findMany({
            where: { userId: ownerId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                _count: {
                    select: { recipients: true }
                },
                recipients: {
                    select: { status: true }
                }
            }
        });

        const stats = blastJobs.map(job => {
            const total = job._count.recipients;
            const sent = job.recipients.filter(r => r.status === 'SENT').length;
            const failed = job.recipients.filter(r => r.status === 'FAILED').length;
            const pending = job.recipients.filter(r => r.status === 'PENDING').length;

            return {
                id: job.id,
                name: job.name,
                status: job.status,
                createdAt: job.createdAt,
                total,
                sent,
                failed,
                pending,
                progress: total > 0 ? Math.round(((sent + failed) / total) * 100) : 0
            };
        });

        return reply.send({ success: true, data: stats });
    }
};
