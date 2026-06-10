import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildServer } from '../../src/server';
import { getAuthToken, cleanupTestUser } from '../helpers';
import { prisma } from '../../src/config/prisma';

describe('API Key Integration', () => {
    let app: any;
    let token: string;
    const testEmail = 'apikey-test@example.com';

    beforeAll(async () => {
        app = await buildServer();
        await app.ready();
        const auth = await getAuthToken(app, testEmail);
        token = auth.token;
    });

    afterAll(async () => {
        await cleanupTestUser(testEmail);
        await app.close();
    });

    it('should create a new API key', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/v1/api-keys',
            headers: { authorization: `Bearer ${token}` },
            payload: { name: 'Production Key' }
        });

        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.payload);
        expect(body.success).toBe(true);
        expect(body.data.key).toBeDefined();
        expect(body.data.name).toBe('Production Key');
    });

    it('should authenticate using API key header', async () => {
        // Get the key we just created
        const keys = await prisma.apiKey.findMany({
            where: { user: { email: testEmail } }
        });
        const apiKey = keys[0].key;

        const response = await app.inject({
            method: 'GET',
            url: '/v1/auth/me',
            headers: { 'x-api-key': apiKey }
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.payload);
        expect(body.success).toBe(true);
        expect(body.data.email).toBe(testEmail);
        // Ensure sensitive fields like password are NOT present
        expect(body.data.password).toBeUndefined();
    });

    it('should fail with invalid API key', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/v1/auth/me',
            headers: { 'x-api-key': 'invalid-key' }
        });

        expect(response.statusCode).toBe(401);
    });
});
