import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildServer } from '../../src/server';
import { getAuthToken, cleanupTestUser } from '../helpers';

describe('Contact Integration', () => {
    let app: any;
    let token: string;
    const testEmail = 'contact-test@example.com';

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

    it('should create a new contact', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/v1/contacts',
            headers: { authorization: `Bearer ${token}` },
            payload: {
                name: 'John Doe',
                phone: '628123456789',
                email: 'john@example.com'
            }
        });

        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.payload);
        expect(body.success).toBe(true);
        expect(body.data.name).toBe('John Doe');
    });

    it('should list user contacts', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/v1/contacts',
            headers: { authorization: `Bearer ${token}` }
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.payload);
        expect(body.success).toBe(true);
        expect(body.data.length).toBeGreaterThan(0);
    });

    it('should search for contacts', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/v1/contacts?search=John',
            headers: { authorization: `Bearer ${token}` }
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.payload);
        expect(body.data.length).toBeGreaterThan(0);
        expect(body.data[0].name).toContain('John');
    });
});
