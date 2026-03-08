import { FastifyRequest, FastifyReply } from 'fastify';
import { blastRepository } from '../repositories/blastRepository';
import { contactRepository } from '../repositories/contactRepository';
import { resolveTemplate } from '../utils/csvParser';
import { prisma } from '../config/prisma';
import { addRecipientJob } from '../queues/blastQueue';

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

        // Create blast job
        const job = await blastRepository.createJob({
            userId: ownerId,
            deviceId,
            templateId,
            name,
            message,
            type,
            mediaUrl,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        });

        // Get contacts
        const contacts = await contactRepository.findAll(ownerId, groupId);
        if (contacts.length === 0) {
            return reply.status(400).send({ success: false, message: 'No contacts found for blast' });
        }

        // Create recipient queue rows
        const recipients = contacts.map((c: any) => ({
            blastJobId: job.id,
            contactId: c.id,
            phone: c.phone,
            message: resolveTemplate(message, { name: c.name, phone: c.phone, email: c.email || '' }),
        }));

        await blastRepository.createRecipients(recipients);

        // Limit Quota Increment (Skip if ADMIN)
        const { ownerId: currentOwnerId, role } = request.user;
        if (role !== 'ADMIN') {
            await prisma.user.update({
                where: { id: currentOwnerId },
                data: { messagesSentThisMonth: { increment: recipients.length } }
            });
        }

        const createdRecipients = await prisma.blastRecipient.findMany({
            where: { blastJobId: job.id }
        });

        // Add to Redis Queue with staggered delay
        const baseDelay = scheduledAt ? Math.max(0, new Date(scheduledAt).getTime() - Date.now()) : 0;
        const staggeredInterval = parseInt(process.env.MESSAGE_DELAY_MS || '3000', 10);

        for (let i = 0; i < createdRecipients.length; i++) {
            await addRecipientJob(
                createdRecipients[i].id,
                baseDelay + (i * staggeredInterval)
            );
        }

        return reply.status(201).send({
            success: true,
            data: { jobId: job.id, recipientCount: recipients.length },
            message: scheduledAt
                ? `Blast job scheduled for ${scheduledAt}`
                : 'Blast job created and queued for processing.',
        });
    },

    async list(request: FastifyRequest, reply: FastifyReply) {
        const { ownerId } = request.user;
        const jobs = await blastRepository.findJobsByUser(ownerId);
        return reply.send({ success: true, data: jobs });
    },

    async getJob(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const job = await blastRepository.findJobById(id);
        if (!job) return reply.status(404).send({ success: false, message: 'Blast job not found' });
        const counts = await blastRepository.countRecipients(id);
        return reply.send({ success: true, data: { ...job, stats: counts } });
    },
};
