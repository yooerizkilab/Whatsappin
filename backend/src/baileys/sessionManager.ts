import makeWASocket, {
    DisconnectReason,
    fetchLatestBaileysVersion,
    useMultiFileAuthState,
    WASocket,
    proto,
    AnyMessageContent,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import * as fs from 'fs';
import * as path from 'path';
import pino from 'pino';
import { env } from '../config/env';
import { wsServer } from '../websocket/wsServer';
import { prisma } from '../config/prisma';
import { autoResponderRepository } from '../repositories/autoResponderRepository';
import { callAI } from '../services/aiService';
import { webhookRepository } from '../repositories/webhookRepository';
import { webhookService } from '../services/webhookService';
import { messageRepository } from '../repositories/messageRepository';
import { logger } from '../utils/logger';
import { useS3AuthState, deleteS3Session } from './s3AuthState';

export interface DeviceSession {
    socket: WASocket;
    deviceId: string;
}

class SessionManager {
    private sessions = new Map<string, DeviceSession>();

    getSession(deviceId: string): DeviceSession | undefined {
        return this.sessions.get(deviceId);
    }

    getAllSessions(): Map<string, DeviceSession> {
        return this.sessions;
    }

    async createSession(deviceId: string): Promise<void> {
        // Prevent duplicate session creation
        const existingSession = this.sessions.get(deviceId);
        if (existingSession) {
            logger.info(`[SessionManager] Session already exists for device ${deviceId}. Ending old connection.`);
            existingSession.socket.end(undefined);
            this.sessions.delete(deviceId);
        }

        const sessionPath = path.join(env.SESSION_DIR, deviceId);

        let state, saveCreds;
        if (env.AWS_S3_BUCKET) {
            const s3Auth = await useS3AuthState(deviceId);
            state = s3Auth.state;
            saveCreds = s3Auth.saveCreds;
        } else {
            const sessionPath = path.join(env.SESSION_DIR, deviceId);
            if (!fs.existsSync(sessionPath)) {
                fs.mkdirSync(sessionPath, { recursive: true });
            }
            const localAuth = await useMultiFileAuthState(sessionPath);
            state = localAuth.state;
            saveCreds = localAuth.saveCreds;
        }
        const { version } = await fetchLatestBaileysVersion();

        const socket = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: false,
            browser: ['WhatsApp Gateway', 'Chrome', '1.0.0'],
            logger: pino({ level: 'silent' }) as any,
        });

        this.sessions.set(deviceId, { socket, deviceId });

        await this.registerEvents(socket, deviceId, saveCreds);
    }

    private async registerEvents(
        socket: WASocket,
        deviceId: string,
        saveCreds: () => Promise<void>
    ) {
        socket.ev.on('creds.update', saveCreds);

        socket.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                // Send QR to frontend via WebSocket
                wsServer.sendToDevice(deviceId, 'qr_update', { deviceId, qr });
                try {
                    // Use updateMany to avoid "Record not found" error if device was deleted
                    await prisma.device.updateMany({
                        where: { id: deviceId },
                        data: { status: 'QR_REQUIRED' },
                    });
                } catch (err) {
                    logger.error(`[Baileys] Error updating QR status for device ${deviceId}:`, err);
                }
            }

            if (connection === 'open') {
                const phoneNumber = socket.user?.id?.split(':')[0] || null;
                try {
                    await prisma.device.updateMany({
                        where: { id: deviceId },
                        data: { status: 'CONNECTED', phoneNumber },
                    });
                } catch (err) {
                    logger.error(`[Baileys] Error updating connection status for device ${deviceId}:`, err);
                }
                wsServer.sendToDevice(deviceId, 'device_status', {
                    deviceId,
                    status: 'CONNECTED',
                    phoneNumber,
                });
            }

            if (connection === 'close') {
                const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

                logger.info(`[Baileys] Connection closed for device ${deviceId}. Status: ${statusCode}, Reconnecting: ${shouldReconnect}`);

                try {
                    await prisma.device.updateMany({
                        where: { id: deviceId },
                        data: { status: 'DISCONNECTED' },
                    });
                } catch (err) {
                    logger.error(`[Baileys] Error updating disconnect status for device ${deviceId}:`, err);
                }

                wsServer.sendToDevice(deviceId, 'device_status', {
                    deviceId,
                    status: 'DISCONNECTED',
                });

                if (shouldReconnect) {
                    setTimeout(() => this.createSession(deviceId), 5000);
                } else {
                    this.sessions.delete(deviceId);
                    // clear session files on logout
                    if (env.AWS_S3_BUCKET) {
                        await deleteS3Session(deviceId);
                    } else {
                        const sessionPath = path.join(env.SESSION_DIR, deviceId);
                        if (fs.existsSync(sessionPath)) {
                            fs.rmSync(sessionPath, { recursive: true, force: true });
                        }
                    }
                }
            }
        });

        socket.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return; // Hanya proses pesan baru

            for (const msg of messages) {
                if (!msg.key.fromMe && msg.message) {
                    const from = msg.key.remoteJid || '';

                    // Ekstrak teks dari berbagai kemungkinan payload WhatsApp
                    const text =
                        msg.message.conversation ||
                        msg.message.extendedTextMessage?.text ||
                        msg.message.imageMessage?.caption ||
                        msg.message.videoMessage?.caption ||
                        '';

                    logger.info(`[WhatsApp] Incoming message to ${deviceId} from ${from}: "${text}"`);

                    // Persist to Database
                    try {
                        await messageRepository.upsertIncoming({
                            deviceId,
                            from,
                            to: socket.user?.id || '', // Our own number/ID if known
                            externalId: msg.key.id || '',
                            type: 'TEXT',
                            content: text,
                            status: 'READ',
                        });
                    } catch (err: any) {
                        logger.error(`[Inbox] Error saving incoming message:`, err.message);
                    }

                    // Broadcast incoming message to frontend (Legacy + Sync)
                    wsServer.sendToDevice(deviceId, 'incoming_message', {
                        deviceId,
                        from,
                        text,
                    });
                    wsServer.sendToDevice(deviceId, 'new_message', {
                        deviceId,
                        from,
                        text,
                        direction: 'INCOMING'
                    });

                    // Tangani Webhook
                    try {
                        const webhook = await webhookRepository.findActiveByDeviceId(deviceId);
                        if (webhook) {
                            webhookService.triggerWebhook(webhook.url, webhook.secret, {
                                event: 'messages.upsert',
                                device: deviceId,
                                message: { from, text },
                                timestamp: Date.now(),
                            });
                        }
                    } catch (err: any) {
                        logger.error(`[Webhook] Error finding webhook for device ${deviceId}:`, err.message);
                    }

                    // Auto-responder
                    if (text) {
                        await this.handleAutoRespond(deviceId, from, text, msg);
                    }
                }
            }
        });

        socket.ev.on('messages.update', async (updates) => {
            for (const update of updates) {
                if (update.update.status) {
                    wsServer.broadcast('message_status', {
                        key: update.key,
                        status: update.update.status,
                    });
                }
            }
        });
    }

    async sendTextMessage(deviceId: string, to: string, text: string): Promise<void> {
        const session = this.sessions.get(deviceId);
        if (!session) throw new Error(`Device ${deviceId} is not connected`);
        const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
        await session.socket.sendMessage(jid, { text });
    }

    async sendImageMessage(
        deviceId: string,
        to: string,
        imageUrl: string,
        caption?: string
    ): Promise<void> {
        const session = this.sessions.get(deviceId);
        if (!session) throw new Error(`Device ${deviceId} is not connected`);
        const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
        await session.socket.sendMessage(jid, {
            image: { url: imageUrl },
            caption,
        });
    }

    async sendDocumentMessage(
        deviceId: string,
        to: string,
        docUrl: string,
        filename: string,
        mimetype = 'application/octet-stream'
    ): Promise<void> {
        const session = this.sessions.get(deviceId);
        if (!session) throw new Error(`Device ${deviceId} is not connected`);
        const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
        await session.socket.sendMessage(jid, {
            document: { url: docUrl },
            fileName: filename,
            mimetype,
        });
    }

    async destroySession(deviceId: string): Promise<void> {
        const session = this.sessions.get(deviceId);
        if (session) {
            try {
                await session.socket.logout();
            } catch (err) {
                logger.error(`[SessionManager] Error during logout for ${deviceId}:`, err);
                session.socket.end(undefined);
            }
            this.sessions.delete(deviceId);
        }
        
        if (env.AWS_S3_BUCKET) {
            await deleteS3Session(deviceId);
        } else {
            const sessionPath = path.join(env.SESSION_DIR, deviceId);
            if (fs.existsSync(sessionPath)) {
                fs.rmSync(sessionPath, { recursive: true, force: true });
            }
        }
    }

    async restoreAllSessions(): Promise<void> {
        const devices = await prisma.device.findMany({
            where: { status: { in: ['CONNECTED', 'QR_REQUIRED', 'CONNECTING'] } },
        });
        for (const device of devices) {
            try {
                await this.createSession(device.id);
            } catch (err) {
                logger.error(`Failed to restore session for device ${device.id}:`, err);
            }
        }
    }

    /**
     * Handle auto-respond logic for incoming messages.
     * 1. Match keyword rules (sorted by order).
     * 2. If no match and AI is configured → call AI and reply.
     */
    async handleAutoRespond(deviceId: string, from: string, text: string, msg: proto.IWebMessageInfo): Promise<void> {
        try {
            const autoResponder = await autoResponderRepository.findActiveByDeviceId(deviceId);
            if (!autoResponder) {
                // Silently skip if no responder configured
                return;
            }
            // logger.debug(`[AutoResponder] Found active responder: ${autoResponder.name} for device ${deviceId}`);

            // ── Quota Check ─────────────────────────────────────
            const user: any = autoResponder.user;
            const isAdmin = user.role === 'ADMIN';

            if (!isAdmin) {
                const maxMessages = user.subscriptionStatus === 'ACTIVE' && user.subscriptionPlan
                    ? user.subscriptionPlan.maxMessagesPerMonth
                    : 100; // Default Free Tier

                // logger.debug(`[AutoResponder] Quota check for ${user.id}: ${user.messagesSentThisMonth}/${maxMessages}`);
                if (user.messagesSentThisMonth >= maxMessages) {
                    logger.info(`[AutoResponder] Quota exceeded for user ${user.id}. Skipping reply.`);
                    return;
                }
            }

            // ── Read Receipt & Typing ─────────────────────────────
            const session = this.sessions.get(deviceId);
            if (session) {
                // If it's a group, only respond if mentioned
                const isGroup = from.endsWith('@g.us');
                if (isGroup) {
                    const myId = session.socket.user?.id.split(':')[0] + '@s.whatsapp.net';
                    const mentionedJids = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                    const isMentioned = mentionedJids.includes(myId);

                    if (!isMentioned) {
                        // logger.debug(`[AutoResponder] Skipping group message from ${from} (not mentioned)`);
                        return;
                    }
                }

                await session.socket.readMessages([msg.key]);
                await session.socket.sendPresenceUpdate('composing', from);
            }


            const normalizedText = text.trim().toLowerCase();
            let replied = false;

            // ── 1. Keyword rules ───────────────────────────────────
            for (const rule of autoResponder.rules) {
                if (!rule.isActive) continue;

                let keywords = rule.keywords.split(',').map((k: string) => k.trim().toLowerCase()).filter(Boolean);
                const matchType = rule.matchType.toUpperCase();

                // Spesial untuk REGEX, kita tidak pisahkan berdasarkan koma agar regex utuh
                if (matchType === 'REGEX') {
                    keywords = [rule.keywords.trim()];
                }

                const matched = keywords.some((kw: string) => {
                    switch (matchType) {
                        case 'EXACT': return normalizedText === kw;
                        case 'STARTSWITH': return normalizedText.startsWith(kw);
                        case 'REGEX': try { return new RegExp(kw, 'i').test(text); } catch { return false; }
                        case 'CONTAINS':
                        default: return normalizedText.includes(kw);
                    }
                });

                // logger.debug(`[AutoResponder] Rule ${rule.id} (${matchType}) match: ${matched}`);
                if (matched) {
                    await this.sendTextMessage(deviceId, from, rule.response);
                    logger.info(`[AutoResponder] Keyword match (${matchType}): "${text}" → rule ${rule.id}`);
                    replied = true;

                    // Increment Quota (Skip if ADMIN)
                    if (!isAdmin) {
                        await prisma.user.update({
                            where: { id: user.id },
                            data: { messagesSentThisMonth: { increment: 1 } }
                        });
                    }
                    break;
                }
            }

            // ── 2. AI fallback ─────────────────────────────────────
            if (!replied && autoResponder.aiProvider) {
                // logger.debug(`[AutoResponder] No keyword matched. Falling back to AI (${autoResponder.aiProvider})...`);
                
                // Get Knowledge Base ID if active
                const device: any = autoResponder.device;
                const kbId = device?.knowledgeBase?.isActive ? device.knowledgeBase.id : null;

                const aiReply = await callAI(
                    autoResponder.aiProvider,
                    autoResponder.aiModel || '',
                    autoResponder.systemPrompt || 'You are a helpful WhatsApp assistant. Reply concisely.',
                    text,
                    autoResponder.apiKey,
                    kbId
                );
                await this.sendTextMessage(deviceId, from, aiReply);
                logger.info(`[AutoResponder] AI (${autoResponder.aiProvider}) replied to: "${text}"`);

                // Increment Quota (Skip if ADMIN)
                if (!isAdmin) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { messagesSentThisMonth: { increment: 1 } }
                    });
                }
            }
        } catch (err: any) {
            logger.error(`[AutoResponder] Error handling auto-respond for device ${deviceId}:`, err.message);
        } finally {
            // ── Clear Typing Indicator ──────────────────────────
            const session = this.sessions.get(deviceId);
            if (session) {
                await session.socket.sendPresenceUpdate('paused', from);
            }
        }
    }
}

export const sessionManager = new SessionManager();
