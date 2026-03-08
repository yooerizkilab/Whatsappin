import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../config/prisma';

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    const apiKeyHeader = request.headers['x-api-key'] as string;

    if (apiKeyHeader) {
        const apiKey = await prisma.apiKey.findUnique({
            where: { key: apiKeyHeader },
            include: { user: true }
        });

        if (apiKey) {
            // Populate request.user similar to JWT
            request.user = {
                id: apiKey.user.id,
                email: apiKey.user.email,
                role: apiKey.user.role,
                name: apiKey.user.name,
                ownerId: apiKey.user.id // API Keys are always primary user
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
            permissions: payload.permissions
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
