import { FastifyRequest, FastifyReply } from 'fastify';
import { blastRepository } from '../repositories/blastRepository';
import { contactRepository } from '../repositories/contactRepository';
import { resolveTemplateFromContact } from '../utils/csvParser';
import { prisma } from '../config/prisma';
import { normalizePhone } from '../utils/phone';
import { addRecipientJob } from '../queues/blastQueue';

const DEFAULT_FREE_PLAN = {
    maxMessagesPerMonth: 100,
};

export const blastController = {
    async create(request: FastifyRequest, reply: FastifyReply) {
        const { ownerId } = request.user;
        const {
            deviceId,
            templateId,
            name,
            message,
            groupId,
            scheduledAt,
            type,
            mediaUrl,
        } = request.body as {
            deviceId: string;
            templateId?: string;
            name: string;
            message: string;
            groupId?: string;
            scheduledAt?: string;
            type?: 'TEXT' | 'IMAGE' | 'DOCUMENT';
            mediaUrl?: string;
        };

        const blastType = type || 'TEXT';
        const scheduledDate = scheduledAt ? new Date(scheduledAt) : undefined;

        if (!deviceId || !name || !message) {
            return reply.status(400).send({ success: false, message: 'deviceId, name, and message are required' });
        }

        if (scheduledAt && Number.isNaN(scheduledDate?.getTime())) {
            return reply.status(400).send({ success: false, message: 'Invalid scheduledAt value' });
        }

        if ((blastType === 'IMAGE' || blastType === 'DOCUMENT') && !mediaUrl) {
            return reply.status(400).send({ success: false, message: 'mediaUrl is required for image or document blast' });
        }

        const [owner, device] = await Promise.all([
            prisma.user.findUnique({
                where: { id: ownerId },
                include: { subscriptionPlan: true },
            }),
            prisma.device.findFirst({
                where: { id: deviceId, userId: ownerId },
            }),
        ]);

        if (!owner) {
            return reply.status(404).send({ success: false, message: 'Owner not found' });
        }

        if (!device) {
            return reply.status(404).send({ success: false, message: 'Device not found' });
        }

        const contacts = await contactRepository.findAll(ownerId, groupId);
        if (contacts.length === 0) {
            return reply.status(400).send({ success: false, message: 'No contacts found for blast' });
        }

        const uniqueContactsByPhone = new Map<string, any>();
        for (const contact of contacts) {
            const normalizedPhone = normalizePhone(contact.phone);
            if (!normalizedPhone || uniqueContactsByPhone.has(normalizedPhone)) continue;
            uniqueContactsByPhone.set(normalizedPhone, { ...contact, phone: normalizedPhone });
        }

        const resolvedRecipients = Array.from(uniqueContactsByPhone.values()).map((contact: any) => ({
            contactId: contact.id,
            phone: contact.phone,
            message: resolveTemplateFromContact(message, contact),
        }));

        if (resolvedRecipients.length === 0) {
            return reply.status(400).send({ success: false, message: 'No valid contacts found for blast' });
        }

        if (owner.role !== 'ADMIN') {
            const maxMessages = owner.subscriptionStatus === 'ACTIVE' && owner.subscriptionPlan
                ? owner.subscriptionPlan.maxMessagesPerMonth
                : DEFAULT_FREE_PLAN.maxMessagesPerMonth;

            if (owner.messagesSentThisMonth + resolvedRecipients.length > maxMessages) {
                return reply.status(403).send({
                    success: false,
                    message: `Quota Exceeded: Message limit reached. You can only send ${maxMessages - owner.messagesSentThisMonth} more messages this month.`,
                });
            }
        }

        const job = await blastRepository.createJob({
            userId: ownerId,
            deviceId,
            templateId: templateId || undefined,
            name,
            message,
            type: blastType,
            mediaUrl,
            scheduledAt: scheduledDate,
        });

        const recipients = resolvedRecipients.map((recipient) => ({
            blastJobId: job.id,
            contactId: recipient.contactId,
            phone: recipient.phone,
            message: recipient.message,
        }));

        await blastRepository.createRecipients(recipients);

        await prisma.blastJob.update({
            where: { id: job.id },
            data: { totalRecipients: recipients.length },
        });

        const createdRecipients = await prisma.blastRecipient.findMany({
            where: { blastJobId: job.id },
            orderBy: { createdAt: 'asc' },
        });

        const staggeredInterval = parseInt(process.env.MESSAGE_DELAY_MS || '3000', 10);
        const baseDelay = scheduledDate ? Math.max(0, scheduledDate.getTime() - Date.now()) : 0;

        for (let i = 0; i < createdRecipients.length; i++) {
            await addRecipientJob(createdRecipients[i].id, baseDelay + (i * staggeredInterval));
        }

        if (owner.role !== 'ADMIN') {
            await prisma.user.update({
                where: { id: ownerId },
                data: { messagesSentThisMonth: { increment: recipients.length } },
            });
        }

        return reply.status(201).send({
            success: true,
            data: {
                jobId: job.id,
                totalRecipients: recipients.length,
                status: job.status,
            },
            message: scheduledDate ? 'Blast scheduled' : 'Blast queued',
        });
    },

    async list(request: FastifyRequest, reply: FastifyReply) {
        const { ownerId } = request.user;
        const jobs = await blastRepository.findJobsByUser(ownerId);
        return reply.send({ success: true, data: jobs });
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
