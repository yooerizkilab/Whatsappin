import { FastifyInstance } from 'fastify';
import { authController } from '../controllers/authController';

export async function authRoutes(fastify: FastifyInstance) {
    fastify.post('/login', {
        schema: {
            description: 'Login to the application',
            tags: ['Auth'],
            body: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: {
                            type: 'object',
                            properties: {
                                token: { type: 'string' },
                                user: { type: 'object', additionalProperties: true }
                            }
                        }
                    }
                }
            }
        }
    }, authController.login);

    fastify.post('/register', {
        schema: {
            description: 'Register a new user',
            tags: ['Auth'],
            body: {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 },
                    name: { type: 'string' }
                }
            }
        }
    }, authController.register);

    fastify.get('/me', {
        preHandler: [fastify.authenticate],
        schema: {
            description: 'Get current user profile',
            tags: ['Auth'],
            security: [{ bearerAuth: [] }]
        }
    }, authController.me);

    fastify.put('/profile', { preHandler: [fastify.authenticate] }, authController.updateProfile);
    fastify.put('/profile/password', { preHandler: [fastify.authenticate] }, authController.changePassword);
    fastify.post('/forgot-password', authController.forgotPassword);
    fastify.post('/reset-password', authController.resetPassword);
}
