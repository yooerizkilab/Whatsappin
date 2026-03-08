import { prisma } from '../config/prisma';
import { hashPassword } from '../utils/hash';

export const userRepository = {
    async findByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } });
    },

    async findById(id: string) {
        return prisma.user.findUnique({ where: { id } });
    },

    async create(data: {
        email: string;
        password: string;
        name: string;
        role?: 'ADMIN' | 'USER';
        subscriptionPlanId?: string;
        subscriptionStatus?: 'ACTIVE' | 'EXPIRED' | 'CANCELED';
    }) {
        const hashed = await hashPassword(data.password);
        return prisma.user.create({
            data: { ...data, password: hashed },
        });
    },

    async update(id: string, data: { email?: string; name?: string; phone?: string | null }) {
        return prisma.user.update({
            where: { id },
            data,
        });
    },

    async updatePassword(id: string, password: string) {
        const hashed = await hashPassword(password);
        return prisma.user.update({
            where: { id },
            data: { password: hashed },
        });
    },
};
