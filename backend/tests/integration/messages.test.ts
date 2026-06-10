import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { buildServer } from '../../src/server';
import { getAuthToken, cleanupTestUser } from '../helpers';
import { prisma } from '../../src/config/prisma';

// Mock sessionManager to prevent real WhatsApp connection attempts
vi.mock('../../src/baileys/sessionManager', () => ({
    sessionManager: {
        sendTextMessage: vi.fn().mockResolvedValue(undefined),
        getSession: vi.fn().mockReturnValue({ socket: { user: { id: 'test' } } }),
    }
}));

describe('Message Integration', () => {
    let app: any;
    let token: string;
    let deviceId: string;
    const testEmail = 'message-test@example.com';

    beforeAll(async () => {
        app = await buildServer();
        await app.ready();
        const auth = await getAuthToken(app, testEmail);
        token = auth.token;

        // Create a test device
        const device = await prisma.device.create({
            data: {
                userId: auth.user.id,
                name: 'Test Send Device',
                status: 'CONNECTED'
            }
        });
        deviceId = device.id;
    });

    afterAll(async () => {
        await cleanupTestUser(testEmail);
        await app.close();
    });

    it('should send a text message successfully', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/v1/messages/send',
            headers: { authorization: `Bearer ${token}` },
            payload: {
                deviceId,
                to: '628123456789',
                content: 'Hello from test!'
            }
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.payload);
        expect(body.success).toBe(true);
        expect(body.data.status).toBe('SENT');
    });

    it('should return 403 if device belongs to another user (IDOR prevention)', async () => {
        // Create another user and their device
        const { hashPassword } = await import('../../src/utils/hash');
        const otherUser = await prisma.user.create({
            data: {
                email: 'other-owner@example.com',
                password: await hashPassword('password123'),
                name: 'Other Owner'
            }
        });

        const otherDevice = await prisma.device.create({
            data: {
                userId: otherUser.id,
                name: 'Other Device'
            }
        });

        // Try to send from first user's token using second user's device
        const response = await app.inject({
            method: 'POST',
            url: '/v1/messages/send',
            headers: { authorization: `Bearer ${token}` },
            payload: {
                deviceId: otherDevice.id,
                to: '628123456789',
                content: 'Stealing session test'
            }
        });

        expect(response.statusCode).toBe(403);
        const body = JSON.parse(response.payload);
        expect(body.success).toBe(false);
        expect(body.message).toContain('Forbidden');

        // Cleanup
        await prisma.user.delete({ where: { id: otherUser.id } });
    });
});
