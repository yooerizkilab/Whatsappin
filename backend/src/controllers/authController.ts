import { FastifyRequest, FastifyReply } from 'fastify';
import { comparePassword, hashPassword } from '../utils/hash';
import { userRepository } from '../repositories/userRepository';
import { sendMail } from '../services/mailer';
import { env } from '../config/env';

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
        const { id } = request.user;
        const { name, email, phone, workingHoursEnabled, workingHoursStart, workingHoursEnd, timezone } = request.body as {
            name?: string;
            email?: string;
            phone?: string;
            workingHoursEnabled?: boolean;
            workingHoursStart?: string;
            workingHoursEnd?: string;
            timezone?: string;
        };

        // Check if email is already taken by another user
        if (email) {
            const existing = await userRepository.findByEmail(email);
            if (existing && existing.id !== id) {
                return reply.status(400).send({ success: false, message: 'Email already in use' });
            }
        }

        const user = await userRepository.update(id, {
            name, email, phone, workingHoursEnabled, workingHoursStart, workingHoursEnd, timezone
        });
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

    async forgotPassword(request: FastifyRequest, reply: FastifyReply) {
        const { email } = request.body as { email: string };
        if (!email) return reply.status(400).send({ success: false, message: 'Email is required' });

        const user = await userRepository.findByEmail(email);
        if (!user) {
            return reply.send({ success: true, message: 'If the email is registered, a reset link has been sent.' });
        }

        const resetToken = await reply.jwtSign(
            { id: user.id, purpose: 'password_reset' },
            { expiresIn: '1h' }
        );

        const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#141414;border-radius:16px;border:1px solid #2a2a2a;overflow:hidden">
        <tr><td style="padding:40px 32px 32px;text-align:center">
          <div style="width:48px;height:48px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:24px;font-size:24px;color:#fff;font-weight:900">W</div>
          <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 8px">Reset your password</h1>
          <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 28px">Kami menerima permintaan reset password untuk akun Whatsappin Anda. Klik tombol di bawah untuk melanjutkan.</p>
          <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border-radius:12px;text-decoration:none;font-size:14px;font-weight:700;margin-bottom:28px">Reset Password</a>
          <p style="color:#6b7280;font-size:12px;line-height:1.5;margin:0">Link ini berlaku selama 1 jam. Jika Anda tidak meminta reset password, abaikan email ini.</p>
        </td></tr>
        <tr><td style="padding:20px 32px;background:#0f0f0f;border-top:1px solid #2a2a2a;text-align:center">
          <p style="color:#4b5563;font-size:11px;margin:0">© ${new Date().getFullYear()} Whatsappin. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

        await sendMail({ to: user.email, subject: 'Reset your Whatsappin password', html });

        return reply.send({ success: true, message: 'If the email is registered, a reset link has been sent.' });
    },

    async resetPassword(request: FastifyRequest, reply: FastifyReply) {
        const { token, password } = request.body as { token: string; password: string };
        if (!token || !password) {
            return reply.status(400).send({ success: false, message: 'Token and password are required' });
        }

        try {
            const payload = request.server.jwt.verify<{ id: string; purpose: string }>(token);

            if (payload.purpose !== 'password_reset') {
                return reply.status(400).send({ success: false, message: 'Invalid token' });
            }

            const user = await userRepository.findById(payload.id);
            if (!user) {
                return reply.status(400).send({ success: false, message: 'User not found' });
            }

            const hashed = await hashPassword(password);
            await userRepository.updatePassword(payload.id, hashed);

            return reply.send({ success: true, message: 'Password reset successfully' });
        } catch (err: any) {
            if (err.code === 'FAST_JWT_EXPIRED') {
                return reply.status(400).send({ success: false, message: 'Reset token has expired. Please request a new one.' });
            }
            return reply.status(400).send({ success: false, message: 'Invalid or expired reset token' });
        }
    },
};
