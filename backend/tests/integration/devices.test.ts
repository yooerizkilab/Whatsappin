import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { buildServer } from '../../src/server';
import { getAuthToken, cleanupTestUser } from '../helpers';
import { prisma } from '../../src/config/prisma';

// Mock sessionManager to prevent real WhatsApp connection attempts
vi.mock('../../src/baileys/sessionManager', () => ({
    sessionManager: {
        createSession: vi.fn().mockResolvedValue(undefined),
        destroySession: vi.fn().mockResolvedValue(undefined),
        getSession: vi.fn().mockReturnValue(undefined),
    }
}));

describe('Device Integration', () => {
    let app: any;
    let token: string;
    const testEmail = 'device-test@example.com';

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

    it('should create a new device connection', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/v1/devices/connect',
            headers: { authorization: `Bearer ${token}` },
            payload: { name: 'Test Device' }
        });

        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.payload);
        expect(body.success).toBe(true);
        expect(body.data.name).toBe('Test Device');
        expect(body.data.status).toBe('CONNECTING');
    });

    it('should list user devices', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/v1/devices',
            headers: { authorization: `Bearer ${token}` }
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.payload);
        expect(body.success).toBe(true);
        expect(body.data.length).toBeGreaterThan(0);
        expect(body.data[0].name).toBe('Test Device');
    });

    it('should get device status', async () => {
        // Get device ID from first test
        const listResponse = await app.inject({
            method: 'GET',
            url: '/v1/devices',
            headers: { authorization: `Bearer ${token}` }
        });
        const deviceId = JSON.parse(listResponse.payload).data[0].id;

        const response = await app.inject({
            method: 'GET',
            url: `/v1/devices/${deviceId}/status`,
            headers: { authorization: `Bearer ${token}` }
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.payload);
        expect(body.success).toBe(true);
        expect(body.data.status).toBeDefined();
    });
});
