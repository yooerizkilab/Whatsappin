import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildServer } from '../../src/server';
import { getAuthToken, cleanupTestUser } from '../helpers';
import { prisma } from '../../src/config/prisma';

describe('Billing Integration', () => {
    let app: any;
    let token: string;
    const testEmail = 'billing-test@example.com';

    beforeAll(async () => {
        app = await buildServer();
        await app.ready();
        const auth = await getAuthToken(app, testEmail);
        token = auth.token;

        // Ensure at least one plan exists
        const plan = await prisma.subscriptionPlan.findFirst({ where: { name: 'PRO' } });
        if (!plan) {
            await prisma.subscriptionPlan.create({
                data: {
                    id: 'pro-test',
                    name: 'PRO',
                    price: 150000,
                    maxDevices: 5,
                    maxMessagesPerMonth: 10000
                }
            });
        }
    });

    afterAll(async () => {
        await cleanupTestUser(testEmail);
        await app.close();
    });

    it('should list available subscription plans', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/v1/billing/plans',
            headers: { authorization: `Bearer ${token}` }
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.payload);
        expect(body.success).toBe(true);
        expect(body.data.length).toBeGreaterThan(0);
    });

    it('should create a checkout transaction', async () => {
        const plan = await prisma.subscriptionPlan.findFirst();

        const response = await app.inject({
            method: 'POST',
            url: '/v1/billing/checkout',
            headers: { authorization: `Bearer ${token}` },
            payload: { planId: plan?.id }
        });

        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.payload);
        expect(body.success).toBe(true);
        expect(body.data.paymentToken).toBeDefined();
    });
});
