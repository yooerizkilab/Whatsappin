import { FastifyRequest, FastifyReply } from 'fastify';
import { comparePassword } from '../utils/hash';
import { userRepository } from '../repositories/userRepository';

export const authController = {
    async login(request: FastifyRequest, reply: FastifyReply) {
        const { email, password } = request.body as { email: string; password: string };

        const user = await userRepository.findByEmail(email);
        if (!user) {
            return reply.status(401).send({ success: false, message: 'Invalid credentials' });
        }

        const valid = await comparePassword(password, user.password);
        if (!valid) {
            return reply.status(401).send({ success: false, message: 'Invalid credentials' });
        }

        const token = await reply.jwtSign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                parentId: (user as any).parentId,
                permissions: (user as any).permissions
            },
            { expiresIn: '7d' }
        );

        return reply.send({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    parentId: (user as any).parentId,
                    permissions: (user as any).permissions
                },
            },
        });
    },

    async register(request: FastifyRequest, reply: FastifyReply) {
        const { email, password, name } = request.body as {
            email: string;
            password: string;
            name: string;
        };

        const existing = await userRepository.findByEmail(email);
        if (existing) {
            return reply.status(400).send({ success: false, message: 'Email already registered' });
        }

        const user = await userRepository.create({
            email,
            password,
            name,
            role: 'USER',
            subscriptionPlanId: 'free',
            subscriptionStatus: 'ACTIVE',
        });

        const token = await reply.jwtSign(
            { id: user.id, email: user.email, role: user.role },
            { expiresIn: '7d' }
        );

        return reply.status(201).send({
            success: true,
            data: {
                token,
                user: { id: user.id, email: user.email, name: user.name, role: user.role },
            },
        });
    },

    async me(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.user as { id: string };
        const user = await userRepository.findById(id);
        if (!user) return reply.status(404).send({ success: false, message: 'User not found' });
        const { password: _, ...safe } = user;
        return reply.send({ success: true, data: safe });
    },

    async updateProfile(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.user as { id: string };
        const { name, email, phone } = request.body as { name?: string; email?: string; phone?: string };

        // Check if email is already taken by another user
        if (email) {
            const existing = await userRepository.findByEmail(email);
            if (existing && existing.id !== id) {
                return reply.status(400).send({ success: false, message: 'Email already in use' });
            }
        }

        const user = await userRepository.update(id, { name, email, phone });
        const { password: _, ...safe } = user;
        return reply.send({ success: true, message: 'Profile updated', data: safe });
    },

    async changePassword(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.user as { id: string };
        const { currentPassword, newPassword } = request.body as {
            currentPassword: string;
            newPassword: string;
        };

        const user = await userRepository.findById(id);
        if (!user) return reply.status(404).send({ success: false, message: 'User not found' });

        const valid = await comparePassword(currentPassword, user.password);
        if (!valid) {
            return reply.status(400).send({ success: false, message: 'Invalid current password' });
        }

        await userRepository.updatePassword(id, newPassword);
        return reply.send({ success: true, message: 'Password changed successfully' });
    },
};
