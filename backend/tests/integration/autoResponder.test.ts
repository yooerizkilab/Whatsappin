import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { buildServer } from '../../src/server';
import { getAuthToken, cleanupTestUser } from '../helpers';
import { prisma } from '../../src/config/prisma';

describe('AutoResponder Integration', () => {
    let app: any;
    let token: string;
    let deviceId: string;
    const testEmail = 'ar-test@example.com';

    beforeAll(async () => {
        app = await buildServer();
        await app.ready();
        const auth = await getAuthToken(app, testEmail);
        token = auth.token;

        const device = await prisma.device.create({
            data: {
                userId: auth.user.id,
                name: 'AR Device'
            }
        });
        deviceId = device.id;
    });

    afterAll(async () => {
        await cleanupTestUser(testEmail);
        await app.close();
    });

    it('should configure an auto responder', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/v1/auto-responder',
            headers: { authorization: `Bearer ${token}` },
            payload: {
                deviceId,
                name: 'Global AR',
                isActive: true,
                aiProvider: 'openai',
                systemPrompt: 'Be a polite assistant'
            }
        });

        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.payload);
        expect(body.success).toBe(true);
    });

    it('should add a keyword rule', async () => {
        // Get AR ID
        const ar = await prisma.autoResponder.findFirst({ where: { deviceId } });

        const response = await app.inject({
            method: 'POST',
            url: `/v1/auto-responder/${ar?.id}/rules`,
            headers: { authorization: `Bearer ${token}` },
            payload: {
                keywords: 'hello,hi',
                matchType: 'CONTAINS',
                response: 'Hello there!',
                isActive: true
            }
        });

        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.payload);
        expect(body.success).toBe(true);
        expect(body.data.response).toBe('Hello there!');
    });
});
