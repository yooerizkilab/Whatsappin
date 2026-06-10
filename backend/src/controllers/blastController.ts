import { FastifyRequest, FastifyReply } from 'fastify';
import { blastRepository } from '../repositories/blastRepository';
import { blastService } from '../services/blastService';
import { prisma } from '../config/prisma';

export const blastController = {
    async create(request: FastifyRequest, reply: FastifyReply) {
        const { ownerId, role } = request.user;
        const body = request.body as any;

        if (!body.deviceId || !body.name || !body.message) {
            return reply.status(400).send({ success: false, message: 'deviceId, name, and message are required' });
        }

        try {
            const result = await blastService.createBlast({
                ownerId,
                role,
                ...body
            });

            return reply.status(201).send({
                success: true,
                data: {
                    jobId: result.jobId,
                    totalRecipients: result.totalRecipients,
                    status: result.status,
                },
                message: result.scheduled ? 'Blast scheduled' : 'Blast queued',
            });
        } catch (err: any) {
            if (err.message.includes('Quota Exceeded')) {
                return reply.status(403).send({ success: false, message: err.message });
            }
            if (err.message.includes('not found') || err.message.includes('denied')) {
                return reply.status(404).send({ success: false, message: err.message });
            }
            return reply.status(400).send({ success: false, message: err.message });
        }
    },

    async list(request: FastifyRequest, reply: FastifyReply) {
        const { ownerId } = request.user;
        const { page: pageStr, pageSize: pageSizeStr } = request.query as { page?: string; pageSize?: string };
        const page = Math.max(1, parseInt(pageStr || '1', 10) || 1);
        const pageSize = Math.min(100, Math.max(1, parseInt(pageSizeStr || '20', 10) || 20));
        const skip = (page - 1) * pageSize;
        const result = await blastRepository.findJobsByUser(ownerId, skip, pageSize);
        return reply.send({
            success: true,
            data: result.data,
            pagination: {
                page,
                pageSize,
                total: result.total,
                totalPages: Math.ceil(result.total / pageSize),
            }
        });
    },

    async getJob(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const { ownerId, role } = request.user;
        const job = await blastRepository.findJobById(id);
        if (!job) return reply.status(404).send({ success: false, message: 'Blast job not found' });
        if (job.userId !== ownerId && role !== 'ADMIN') return reply.status(403).send({ success: false, message: 'Forbidden' });
        const counts = await blastRepository.countRecipients(id);
        return reply.send({ success: true, data: { ...job, stats: counts } });
    },

    async downloadReport(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const { ownerId, role } = request.user;

        const job = await blastRepository.findJobById(id);
        if (!job) return reply.status(404).send({ success: false, message: 'Blast job not found' });
        if (job.userId !== ownerId && role !== 'ADMIN') return reply.status(403).send({ success: false, message: 'Forbidden' });

        const recipients = await prisma.blastRecipient.findMany({
            where: { blastJobId: id },
            orderBy: { createdAt: 'asc' },
        });

        const csvRows: string[] = [];
        // BOM for Excel compatibility
        const BOM = '﻿';
        csvRows.push(BOM + 'No,Phone,Message,Status,Error,Sent At');

        recipients.forEach((r, i) => {
            const row = [
                i + 1,
                r.phone,
                `"${(r.message || '').replace(/"/g, '""')}"`,
                r.status,
                `"${(r.error || '').replace(/"/g, '""')}"`,
                r.sentAt ? new Date(r.sentAt).toISOString() : '',
            ].join(',');
            csvRows.push(row);
        });

        const csvContent = csvRows.join('\r\n');
        const safeName = job.name.replace(/[^a-zA-Z0-9_\- ]/g, '_');

        reply.header('Content-Type', 'text/csv; charset=utf-8');
        reply.header('Content-Disposition', `attachment; filename="blast-report-${safeName}.csv"`);
        return reply.send(csvContent);
    },

    async deleteJob(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const { ownerId, role } = request.user;

        const job = await blastRepository.findJobById(id);
        if (!job) return reply.status(404).send({ success: false, message: 'Blast job not found' });
        if (job.userId !== ownerId && role !== 'ADMIN') return reply.status(403).send({ success: false, message: 'Forbidden' });

        await blastRepository.deleteJob(id);
        return reply.send({ success: true, message: 'Blast job deleted' });
    },
};
