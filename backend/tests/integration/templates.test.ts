import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildServer } from '../../src/server';
import { getAuthToken, cleanupTestUser } from '../helpers';

describe('Template Integration', () => {
    let app: any;
    let token: string;
    const testEmail = 'template-test@example.com';

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

    it('should create a new template', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/v1/templates',
            headers: { authorization: `Bearer ${token}` },
            payload: {
                name: 'Welcome Template',
                content: 'Hello {{name}}, welcome to our service!'
            }
        });

        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.payload);
        expect(body.success).toBe(true);
        expect(body.data.name).toBe('Welcome Template');
    });

    it('should list user templates', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/v1/templates',
            headers: { authorization: `Bearer ${token}` }
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.payload);
        expect(body.data.length).toBeGreaterThan(0);
    });
});
