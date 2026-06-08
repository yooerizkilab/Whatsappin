import { FastifyRequest, FastifyReply } from 'fastify';
import { blastRepository } from '../repositories/blastRepository';
import { contactRepository } from '../repositories/contactRepository';
import { resolveTemplateFromContact } from '../utils/csvParser';
import { prisma } from '../config/prisma';
import { normalizePhone } from '../utils/phone';
import { sessionManager } from '../baileys/sessionManager';

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
            templateId: templateId || undefined,
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
        const uniqueContactsByPhone = new Map<string, any>();
        for (const contact of contacts) {
            const normalizedPhone = normalizePhone(contact.phone);
            if (!normalizedPhone || uniqueContactsByPhone.has(normalizedPhone)) continue;
            uniqueContactsByPhone.set(normalizedPhone, { ...contact, phone: normalizedPhone });
        }

        const recipients = Array.from(uniqueContactsByPhone.values()).map((c: any) => ({
            blastJobId: job.id,
            contactId: c.id,
            phone: c.phone,
            message: resolveTemplateFromContact(message, c),
        }));

        await blastRepository.createRecipients(recipients);

        // Update totalRecipients count in BlastJob
        await prisma.blastJob.update({
            where: { id: job.id },
            data: { totalRecipients: recipients.length }
        });

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

        // ── Kirim langsung via sessionManager ────────────────────────
        // Tanpa Redis queue — langsung kirim satu per satu via sessionManager
        // dengan delay 3 detik antar pesan (WA rate limiting)
        const staggeredInterval = parseInt(process.env.MESSAGE_DELAY_MS || '3000', 10);
        const sendResults: { phone: string; status: string; error?: string }[] = [];

        for (let i = 0; i < createdRecipients.length; i++) {
            const r = createdRecipients[i];
            try {
                const claim = await blastRepository.markRecipientProcessing(r.id);
                if (claim.count === 0) continue; // sudah diproses worker lain

                if (type === 'IMAGE') {
                    await sessionManager.sendImageMessage(deviceId, r.phone, mediaUrl!, r.message);
                } else if (type === 'DOCUMENT') {
                    const filename = mediaUrl!.split('/').pop() || 'document.pdf';
                    await sessionManager.sendDocumentMessage(deviceId, r.phone, mediaUrl!, filename);
                    if (r.message) {
                        await sessionManager.sendTextMessage(deviceId, r.phone, r.message);
                    }
                } else {
                    await sessionManager.sendTextMessage(deviceId, r.phone, r.message);
                }

                await blastRepository.updateRecipientStatus(r.id, 'SENT', undefined, new Date());
                sendResults.push({ phone: r.phone, status: 'SENT' });
            } catch (err: any) {
                await blastRepository.updateRecipientStatus(r.id, 'FAILED', err.message);
                sendResults.push({ phone: r.phone, status: 'FAILED', error: err.message });
            }

            // Delay antar pengiriman
            if (i < createdRecipients.length - 1) {
                await new Promise(resolve => setTimeout(resolve, staggeredInterval));
            }
        }

        // Mark job COMPLETED
        const sentCount = sendResults.filter(r => r.status === 'SENT').length;
        const failedCount = sendResults.filter(r => r.status === 'FAILED').length;
        await blastRepository.updateJobStatus(job.id, 'COMPLETED', { completedAt: new Date() });
        await prisma.blastJob.update({
            where: { id: job.id },
            data: { sentCount, failedCount }
        });

        return reply.status(201).send({
            success: true,
            data: { jobId: job.id, sent: sentCount, failed: failedCount },
            message: `Blast completed: ${sentCount} sent, ${failedCount} failed`,
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

    async deleteJob(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const { ownerId } = request.user;

        const job = await blastRepository.findJobById(id);
        if (!job) return reply.status(404).send({ success: false, message: 'Blast job not found' });
        if (job.userId !== ownerId) return reply.status(403).send({ success: false, message: 'Forbidden' });

        await blastRepository.deleteJob(id);
        return reply.send({ success: true, message: 'Blast job deleted' });
    },
};
