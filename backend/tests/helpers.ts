import { buildServer } from '../src/server';
import { prisma } from '../src/config/prisma';

export async function getAuthToken(app: any, email = 'test-auth@example.com') {
    // Ensure user exists
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        const { hashPassword } = await import('../src/utils/hash');
        const hashedPassword = await hashPassword('password123');
        user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: 'Test Auth User',
                role: 'USER',
                subscriptionStatus: 'ACTIVE'
            }
        });
    }

    const response = await app.inject({
        method: 'POST',
        url: '/v1/auth/login',
        payload: {
            email,
            password: 'password123'
        }
    });

    const body = JSON.parse(response.payload);
    return { token: body.data.token, user };
}

export async function cleanupTestUser(email = 'test-auth@example.com') {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
        // Cascading deletes should handle devices, contacts, etc. if prisma schema is correct
        await prisma.user.delete({ where: { id: user.id } });
    }
}
