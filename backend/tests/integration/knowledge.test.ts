import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildServer } from '../../src/server';
import { getAuthToken, cleanupTestUser } from '../helpers';
import { prisma } from '../../src/config/prisma';

describe('Knowledge Base Integration', () => {
    let app: any;
    let token: string;
    let deviceId: string;
    const testEmail = 'knowledge-test@example.com';

    beforeAll(async () => {
        app = await buildServer();
        await app.ready();
        const auth = await getAuthToken(app, testEmail);
        token = auth.token;

        const device = await prisma.device.create({
            data: {
                userId: auth.user.id,
                name: 'Knowledge Device'
            }
        });
        deviceId = device.id;
    });

    afterAll(async () => {
        await cleanupTestUser(testEmail);
        await app.close();
    });

    it('should create a knowledge base for a device', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/v1/knowledge',
            headers: { authorization: `Bearer ${token}` },
            payload: {
                deviceId,
                name: 'Business Support',
                isActive: true
            }
        });

        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.payload);
        expect(body.success).toBe(true);
    });

    it('should add a text source to knowledge base', async () => {
        const response = await app.inject({
            method: 'POST',
            url: `/v1/knowledge/sources`,
            headers: { authorization: `Bearer ${token}` },
            payload: {
                deviceId,
                type: 'TEXT',
                content: 'Our working hours are from 9 AM to 5 PM Monday to Friday.'
            }
        });

        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.payload);
        expect(body.success).toBe(true);
        expect(body.data.status).toBe('PENDING');
    });

    it('should list knowledge bases', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/v1/knowledge',
            headers: { authorization: `Bearer ${token}` }
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.payload);
        expect(body.data.length).toBeGreaterThan(0);
    });
});
