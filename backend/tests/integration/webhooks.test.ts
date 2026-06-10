import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildServer } from '../../src/server';
import { getAuthToken, cleanupTestUser } from '../helpers';
import { prisma } from '../../src/config/prisma';

describe('Webhook Integration', () => {
    let app: any;
    let token: string;
    let deviceId: string;
    const testEmail = 'webhook-test@example.com';

    beforeAll(async () => {
        app = await buildServer();
        await app.ready();
        const auth = await getAuthToken(app, testEmail);
        token = auth.token;

        const device = await prisma.device.create({
            data: {
                userId: auth.user.id,
                name: 'Webhook Device'
            }
        });
        deviceId = device.id;
    });

    afterAll(async () => {
        await cleanupTestUser(testEmail);
        await app.close();
    });

    it('should register a webhook for a device', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/v1/webhooks',
            headers: { authorization: `Bearer ${token}` },
            payload: {
                deviceId,
                url: 'https://example.com/whatsapp-webhook',
                isActive: true
            }
        });

        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.payload);
        expect(body.success).toBe(true);
    });

    it('should get webhook configuration', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/v1/webhooks',
            headers: { authorization: `Bearer ${token}` }
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.payload);
        expect(body.success).toBe(true);
        expect(body.data.length).toBeGreaterThan(0);
        expect(body.data[0].url).toContain('example.com');
    });
});
