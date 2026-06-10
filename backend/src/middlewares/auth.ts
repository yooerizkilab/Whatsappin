import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../config/prisma';

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    const apiKeyHeader = request.headers['x-api-key'] as string;

    if (apiKeyHeader) {
        const apiKey = await prisma.apiKey.findUnique({
            where: { key: apiKeyHeader },
            select: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        name: true,
                        subscriptionStatus: true,
                        subscriptionPlanId: true,
                        workingHoursEnabled: true,
                        workingHoursStart: true,
                        workingHoursEnd: true,
                        timezone: true
                    }
                }
            }
        });

        if (apiKey) {
            // Populate request.user similar to JWT
            request.user = {
                id: apiKey.user.id,
                email: apiKey.user.email,
                role: apiKey.user.role,
                name: apiKey.user.name,
                ownerId: apiKey.user.id, // API Keys are always primary user
                workingHoursEnabled: apiKey.user.workingHoursEnabled,
                workingHoursStart: apiKey.user.workingHoursStart,
                workingHoursEnd: apiKey.user.workingHoursEnd,
                timezone: apiKey.user.timezone || 'UTC',
                subscriptionStatus: apiKey.user.subscriptionStatus,
                subscriptionPlanId: apiKey.user.subscriptionPlanId
            };
            return;
        }
    }

    try {
        const payload = await request.jwtVerify() as any;
        request.user = {
            id: payload.id,
            email: payload.email,
            role: payload.role,
            name: payload.name || '',
            parentId: payload.parentId,
            ownerId: payload.parentId || payload.id,
            permissions: payload.permissions,
            workingHoursEnabled: payload.workingHoursEnabled || false,
            workingHoursStart: payload.workingHoursStart || '09:00',
            workingHoursEnd: payload.workingHoursEnd || '17:00',
            timezone: payload.timezone || 'UTC',
            subscriptionStatus: payload.subscriptionStatus,
            subscriptionPlanId: payload.subscriptionPlanId
        };
    } catch (err) {
        reply.status(401).send({ success: false, message: 'Unauthorized' });
    }
}

export async function isAdmin(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user as { role: string };
    if (user.role !== 'ADMIN') {
        return reply.status(403).send({ success: false, message: 'Forbidden: Admin access required' });
    }
}

export async function hasActiveSubscription(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user as { subscriptionStatus: string, role: string };

    // Admins are exempt from subscription checks
    if (user.role === 'ADMIN') return;

    if (user.subscriptionStatus !== 'ACTIVE') {
        return reply.status(403).send({
            success: false,
            message: 'Forbidden: Active subscription required. Please check your billing status.'
        });
    }
}
