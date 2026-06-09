import { FastifyRequest, FastifyReply } from 'fastify';
import { messageRepository } from '../repositories/messageRepository';
import { sessionManager } from '../baileys/sessionManager';
import { prisma } from '../config/prisma';
import { addMessageJob } from '../queues/messageQueue';
import { calculateDelay } from '../utils/workingHours';
import { isValidPhone, normalizePhone } from '../utils/phone';

export const messageController = {
    async send(request: FastifyRequest, reply: FastifyReply) {
        const { deviceId, to, type = 'TEXT', content, mediaUrl, scheduledAt } = request.body as {
            deviceId: string;
            to: string;
            type?: 'TEXT' | 'IMAGE' | 'DOCUMENT';
            content: string;
            mediaUrl?: string;
            scheduledAt?: string;
        };

        const { ownerId, role } = request.user;

        // Fetch owner settings (Working Hours)
        const owner = await prisma.user.findUnique({
            where: { id: ownerId }
        });

        if (!owner) return reply.status(404).send({ success: false, message: 'Owner not found' });

        if (!isValidPhone(to)) {
            return reply.status(400).send({ success: false, message: 'Invalid phone number format' });
        }

        const normalizedTo = normalizePhone(to);

        const message = await messageRepository.create({
            deviceId,
            to: normalizedTo,
            type,
            content,
            mediaUrl,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : null
        });

        const delay = calculateDelay(message.scheduledAt, owner);

        try {
            if (delay > 0) {
                // Queue the message
                await addMessageJob(message.id, delay);
                await messageRepository.addLog(message.id, 'queued', { delay, scheduledAt: (message as any).scheduledAt });
                return reply.send({ success: true, message: 'Message queued/scheduled', data: { ...message, status: 'PENDING' } });
            }

            // Send immediately
            if (type === 'TEXT') {
                await sessionManager.sendTextMessage(deviceId, normalizedTo, content);
            } else if (type === 'IMAGE' && mediaUrl) {
                await sessionManager.sendImageMessage(deviceId, normalizedTo, mediaUrl, content);
            } else if (type === 'DOCUMENT' && mediaUrl) {
                await sessionManager.sendDocumentMessage(deviceId, normalizedTo, mediaUrl, content);
            }

            await messageRepository.updateStatus(message.id, 'SENT', new Date());
            await messageRepository.addLog(message.id, 'sent');

            // Increment kuota message user (Skip if ADMIN)
            if (role !== 'ADMIN') {
                await prisma.user.update({
                    where: { id: ownerId },
                    data: { messagesSentThisMonth: { increment: 1 } }
                });
            }

            return reply.send({ success: true, data: { ...message, status: 'SENT' } });
        } catch (err: any) {
            await messageRepository.updateStatus(message.id, 'FAILED');
            await messageRepository.addLog(message.id, 'failed', { error: err.message });
            return reply.status(500).send({ success: false, message: err.message || 'Failed to send message' });
        }
    },

    async downloadReport(request: FastifyRequest, reply: FastifyReply) {
        const { deviceId, status } = request.query as {
            deviceId?: string;
            status?: string;
        };

        const { ownerId } = request.user;
        const messages = await messageRepository.findAll({
            userId: ownerId,
            deviceId,
            status,
            limit: 999999,
            offset: 0,
        });

        const csvRows: string[] = [];
        const BOM = '﻿';
        csvRows.push(BOM + 'No,Phone,Type,Message,Device,Status,Sent At,Created At');

        const stripJid = (phone: string) => phone.replace(/:.*@s\.whatsapp\.net$/, '');

        messages.data.forEach((m: any, i: number) => {
            const row = [
                i + 1,
                stripJid(m.to),
                m.type,
                `"${(m.content || '').replace(/"/g, '""')}"`,
                m.device?.name || '',
                m.status,
                m.sentAt ? new Date(m.sentAt).toISOString() : '',
                new Date(m.createdAt).toISOString(),
            ].join(',');
            csvRows.push(row);
        });

        const csvContent = csvRows.join('\r\n');

        reply.header('Content-Type', 'text/csv; charset=utf-8');
        reply.header('Content-Disposition', 'attachment; filename="message-report.csv"');
        return reply.send(csvContent);
    },

    async getLogs(request: FastifyRequest, reply: FastifyReply) {
        const { deviceId, status, page: pageStr, pageSize: pageSizeStr } = request.query as {
            deviceId?: string;
            status?: string;
            page?: string;
            pageSize?: string;
        };

        const { ownerId } = request.user;
        const page = Math.max(1, parseInt(pageStr || '1', 10) || 1);
        const pageSize = Math.min(100, Math.max(1, parseInt(pageSizeStr || '50', 10) || 50));
        const offset = (page - 1) * pageSize;
        const result = await messageRepository.findAll({
            userId: ownerId,
            deviceId,
            status,
            limit: pageSize,
            offset,
        });

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
};
