import { FastifyInstance } from 'fastify';
import { deviceController } from '../controllers/deviceController';
import { authenticate, hasActiveSubscription } from '../middlewares/auth';
import { quotaMiddleware } from '../middlewares/quotaMiddleware';

export async function deviceRoutes(fastify: FastifyInstance) {
    fastify.addHook('preHandler', authenticate);

    fastify.get('/', {
        schema: {
            description: 'List all WhatsApp devices for the authenticated user',
            tags: ['Devices'],
            security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    name: { type: 'string' },
                                    phoneNumber: { type: 'string', nullable: true },
                                    status: { type: 'string' },
                                    createdAt: { type: 'string', format: 'date-time' }
                                }
                            }
                        }
                    }
                }
            }
        }
    }, deviceController.list);

    fastify.post('/connect', {
        preHandler: [hasActiveSubscription, quotaMiddleware.checkDeviceQuota],
        schema: {
            description: 'Create a new device connection and get QR code',
            tags: ['Devices'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: { type: 'string', minLength: 1 }
                }
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: { type: 'object', additionalProperties: true }
                    }
                }
            }
        }
    }, deviceController.connect);

    fastify.get('/:id/status', {
        schema: {
            description: 'Get connection status and phone number of a device',
            tags: ['Devices'],
            security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' }
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
                                status: { type: 'string' },
                                phoneNumber: { type: 'string', nullable: true }
                            }
                        }
                    }
                }
            }
        }
    }, deviceController.getStatus);

    fastify.delete('/:id', {
        schema: {
            description: 'Disconnect and remove a device',
            tags: ['Devices'],
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' }
                }
            }
        }
    }, deviceController.disconnect);
}
