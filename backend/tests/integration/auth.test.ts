import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildServer } from '../../src/server';
import { prisma } from '../../src/config/prisma';

describe('Auth Integration', () => {
    let app: any;

    beforeAll(async () => {
        app = await buildServer();
        await app.ready();

        // Cleanup test user if exists
        await prisma.user.deleteMany({
            where: { email: 'test@example.com' }
        });
    });

    afterAll(async () => {
        await prisma.user.deleteMany({
            where: { email: 'test@example.com' }
        });
        await app.close();
    });

    it('should register a new user', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/v1/auth/register',
            payload: {
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User'
            }
        });

        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.payload);
        expect(body.success).toBe(true);
        expect(body.data.user.email).toBe('test@example.com');
        expect(body.data.token).toBeDefined();
    });

    it('should login the registered user', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/v1/auth/login',
            payload: {
                email: 'test@example.com',
                password: 'password123'
            }
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.payload);
        expect(body.success).toBe(true);
        expect(body.data.token).toBeDefined();
    });

    it('should fail login with wrong password', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/v1/auth/login',
            payload: {
                email: 'test@example.com',
                password: 'wrongpassword'
            }
        });

        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.payload);
        expect(body.success).toBe(false);
    });
});
