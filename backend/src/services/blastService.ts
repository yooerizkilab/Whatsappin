import { blastRepository } from '../repositories/blastRepository';
import { contactRepository } from '../repositories/contactRepository';
import { resolveTemplateFromContact } from '../utils/csvParser';
import { prisma } from '../config/prisma';
import { normalizePhone } from '../utils/phone';
import { addRecipientJob } from '../queues/blastQueue';
import { env } from '../config/env';

export interface CreateBlastData {
    ownerId: string;
    role: string;
    deviceId: string;
    templateId?: string;
    name: string;
    message: string;
    groupId?: string;
    scheduledAt?: string;
    type?: 'TEXT' | 'IMAGE' | 'DOCUMENT';
    mediaUrl?: string;
}

const DEFAULT_FREE_PLAN = {
    maxMessagesPerMonth: 100,
};

export const blastService = {
    async createBlast(data: CreateBlastData) {
        const {
            ownerId,
            role,
            deviceId,
            templateId,
            name,
            message,
            groupId,
            scheduledAt,
            type,
            mediaUrl,
        } = data;

        const blastType = type || 'TEXT';
        const scheduledDate = scheduledAt ? new Date(scheduledAt) : undefined;

        // 1. Fetch owner and device
        const [owner, device] = await Promise.all([
            prisma.user.findUnique({
                where: { id: ownerId },
                include: { subscriptionPlan: true },
            }),
            prisma.device.findFirst({
                where: { id: deviceId, userId: ownerId },
            }),
        ]);

        if (!owner) throw new Error('Owner not found');
        if (!device) throw new Error('Device not found or access denied');

        // 2. Fetch contacts
        const contacts = await contactRepository.findAll(ownerId, groupId);
        if (contacts.data.length === 0) {
            throw new Error('No contacts found for blast');
        }

        // 3. Resolve recipients
        const resolvedRecipients = contacts.data.map((contact: any) => {
            const normalizedPhone = normalizePhone(contact.phone);
            if (!normalizedPhone) return null;
            return {
                contactId: contact.id,
                phone: normalizedPhone,
                message: resolveTemplateFromContact(message, contact),
            };
        }).filter(Boolean) as { contactId?: string; phone: string; message: string }[];

        if (resolvedRecipients.length === 0) {
            throw new Error('No valid contacts found for blast');
        }

        // 4. Quota check
        if (role !== 'ADMIN') {
            const maxMessages = owner.subscriptionStatus === 'ACTIVE' && owner.subscriptionPlan
                ? owner.subscriptionPlan.maxMessagesPerMonth
                : DEFAULT_FREE_PLAN.maxMessagesPerMonth;

            if (owner.messagesSentThisMonth + resolvedRecipients.length > maxMessages) {
                throw new Error(`Quota Exceeded: Message limit reached. You can only send ${maxMessages - owner.messagesSentThisMonth} more messages this month.`);
            }
        }

        // 5. Create Job
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

        // 6. Create Recipients
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

        // 7. Queue Jobs with Staggering
        const createdRecipients = await prisma.blastRecipient.findMany({
            where: { blastJobId: job.id },
            orderBy: { createdAt: 'asc' },
        });

        const staggeredInterval = env.MESSAGE_DELAY_MS || 3000;
        const minSamePhoneGap = staggeredInterval * 6;
        const baseDelay = scheduledDate ? Math.max(0, scheduledDate.getTime() - Date.now()) : 0;

        const phoneLastDelay = new Map<string, number>();
        let cumulativeDelay = 0;

        for (let i = 0; i < createdRecipients.length; i++) {
            const phone = createdRecipients[i].phone;
            const lastDelayForPhone = phoneLastDelay.get(phone) || 0;

            const delay = Math.max(cumulativeDelay, lastDelayForPhone);
            await addRecipientJob(createdRecipients[i].id, baseDelay + delay);

            const jitter = Math.round(staggeredInterval * (0.6 + Math.random() * 0.8));
            cumulativeDelay += jitter;
            phoneLastDelay.set(phone, delay + minSamePhoneGap);
        }

        // 8. Update User Sent Count
        if (role !== 'ADMIN') {
            await prisma.user.update({
                where: { id: ownerId },
                data: { messagesSentThisMonth: { increment: recipients.length } },
            });
        }

        return {
            jobId: job.id,
            totalRecipients: recipients.length,
            status: job.status,
            scheduled: !!scheduledDate
        };
    }
};
