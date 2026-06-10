import { blastRepository } from '../repositories/blastRepository';
import { sessionManager } from '../baileys/sessionManager';
import { wsServer } from '../websocket/wsServer';
import { logger } from '../utils/logger';
import { env } from '../config/env';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isTransientError(error: any) {
    const message = String(error?.message || '').toLowerCase();
    return ['is not connected', 'connection closed', 'stream errored', 'timed out', 'not open', 'connection was lost']
        .some((pattern) => message.includes(pattern));
}

async function ensureDeviceSession(deviceId: string) {
    const hasReadySession = () => Boolean(sessionManager.getSession(deviceId)?.socket.user);
    if (!hasReadySession()) {
        logger.info(`[BlastSender] Restoring session for device ${deviceId}...`);
        if (!sessionManager.getSession(deviceId)) {
            await sessionManager.createSession(deviceId);
        }
    }
    const deadline = Date.now() + 15000;
    while (!hasReadySession() && Date.now() < deadline) {
        await wait(500);
    }
    if (!hasReadySession()) {
        throw new Error(`Device ${deviceId} is not connected`);
    }
}

async function completeJobIfDone(blastJobId: string) {
    const counts = await blastRepository.countRecipients(blastJobId);
    if (counts.pending === 0) {
        const finalStatus = counts.sent > 0 ? 'COMPLETED' : 'FAILED';
        await blastRepository.updateJobStatus(blastJobId, finalStatus, { completedAt: new Date() });
        wsServer.broadcast('blast_completed', { blastJobId, status: finalStatus, stats: counts });
        logger.info(`[BlastSender] Job ${blastJobId} ${finalStatus}`);
    }
}

async function sendOne(recipientId: string) {
    const recipient = await blastRepository.findRecipientById(recipientId);
    if (!recipient) return logger.error(`[BlastSender] Recipient ${recipientId} not found`);

    const blastJob = recipient.blastJob as any;
    const device = blastJob?.device;
    if (recipient.status !== 'PENDING') return;
    if (!device) {
        await blastRepository.updateRecipientStatus(recipient.id, 'FAILED', 'Device not found');
        return completeJobIfDone(recipient.blastJobId);
    }

    const claim = await blastRepository.markRecipientProcessing(recipient.id);
    if (claim.count === 0) return;

    if (blastJob.status === 'PENDING' || blastJob.status === 'SCHEDULED') {
        await blastRepository.updateJobStatus(blastJob.id, 'PROCESSING', { startedAt: new Date() });
    }

    try {
        logger.info(`[BlastSender] Sending to ${recipient.phone} via device ${device.id}`);

        await ensureDeviceSession(device.id);
        await sessionManager.assertWhatsAppRecipient(device.id, recipient.phone);

        if (blastJob.type === 'IMAGE') {
            await sessionManager.sendImageMessage(device.id, recipient.phone, blastJob.mediaUrl, recipient.message);
        } else if (blastJob.type === 'DOCUMENT') {
            const filename = blastJob.mediaUrl.split('/').pop() || 'document.pdf';
            await sessionManager.sendDocumentMessage(device.id, recipient.phone, blastJob.mediaUrl, filename);
            if (recipient.message) {
                await sessionManager.sendTextMessage(device.id, recipient.phone, recipient.message);
            }
        } else {
            await sessionManager.sendTextMessage(device.id, recipient.phone, recipient.message);
        }

        await blastRepository.updateRecipientStatus(recipient.id, 'SENT', undefined, new Date());
        wsServer.sendToDevice(device.id, 'blast_progress', {
            blastJobId: recipient.blastJobId, phone: recipient.phone, status: 'SENT',
        });
        logger.info(`[BlastSender] OK ${recipient.phone}`);
    } catch (err: any) {
        logger.error(`[BlastSender] Failed ${recipient.phone}:`, err.message);
        if (isTransientError(err)) {
            await blastRepository.resetRecipientPending(recipient.id, err.message);
            try { await sessionManager.createSession(device.id); } catch {}
            throw err;
        }
        await blastRepository.updateRecipientStatus(recipient.id, 'FAILED', err.message);
        wsServer.sendToDevice(device.id, 'blast_progress', {
            blastJobId: recipient.blastJobId, phone: recipient.phone, status: 'FAILED', error: err.message,
        });
    }

    await completeJobIfDone(recipient.blastJobId);
}

/**
 * Process blast recipients sequentially in background with jitter delays.
 * No Redis/BullMQ needed — runs directly in-process via setTimeout.
 */
export async function processBlastNow(
    recipients: { id: string; phone: string; blastJobId: string }[],
) {
    const staggeredInterval = env.MESSAGE_DELAY_MS;
    const minSamePhoneGap = staggeredInterval * 6;
    const phoneLastDelay = new Map<string, number>();
    let cumulativeDelay = 0;

    for (let i = 0; i < recipients.length; i++) {
        const phone = recipients[i].phone;
        const lastForPhone = phoneLastDelay.get(phone) || 0;
        const delay = Math.max(cumulativeDelay, lastForPhone);

        // Schedule each send sequentially with setTimeout
        setTimeout(async () => {
            try {
                await sendOne(recipients[i].id);
            } catch (err: any) {
                logger.error(`[BlastSender] Final failure for ${phone}:`, err.message);
                await blastRepository.updateRecipientStatus(recipients[i].id, 'FAILED', err.message);
                await completeJobIfDone(recipients[i].blastJobId);
            }
        }, delay);

        const jitter = Math.round(staggeredInterval * (0.6 + Math.random() * 0.8));
        cumulativeDelay += jitter;
        phoneLastDelay.set(phone, delay + minSamePhoneGap);
    }
}
