import { FastifyInstance } from 'fastify';
import { messageController } from '../controllers/messageController';
import { blastController } from '../controllers/blastController';
import { authenticate, hasActiveSubscription } from '../middlewares/auth';
import { quotaMiddleware } from '../middlewares/quotaMiddleware';

export async function messageRoutes(fastify: FastifyInstance) {
    fastify.addHook('preHandler', authenticate);

    fastify.post('/send', {
        preHandler: [hasActiveSubscription, quotaMiddleware.checkMessageQuota],
        schema: {
            description: 'Send a single WhatsApp message',
            tags: ['Messages'],
            security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
            body: {
                type: 'object',
                required: ['deviceId', 'to', 'content'],
                properties: {
                    deviceId: { type: 'string', format: 'uuid' },
                    to: { type: 'string', description: 'Recipient phone number in international format' },
                    type: { type: 'string', enum: ['TEXT', 'IMAGE', 'DOCUMENT'], default: 'TEXT' },
                    content: { type: 'string', description: 'Message text or caption' },
                    mediaUrl: { type: 'string', format: 'uri', description: 'Required for IMAGE or DOCUMENT types' },
                    scheduledAt: { type: 'string', format: 'date-time', description: 'Optional ISO date-time for scheduling' }
                }
            }
        }
    }, messageController.send);

    fastify.get('/logs', {
        schema: {
            description: 'Get history of sent messages',
            tags: ['Messages'],
            security: [{ bearerAuth: [] }],
            querystring: {
                type: 'object',
                properties: {
                    deviceId: { type: 'string', format: 'uuid' },
                    status: { type: 'string' },
                    page: { type: 'integer', default: 1 },
                    pageSize: { type: 'integer', default: 50 }
                }
            }
        }
    }, messageController.getLogs);

    fastify.get('/logs/report', {
        schema: {
            description: 'Download message logs as CSV',
            tags: ['Messages'],
            security: [{ bearerAuth: [] }]
        }
    }, messageController.downloadReport);

    fastify.post('/blast', {
        preHandler: [hasActiveSubscription],
        schema: {
            description: 'Create a new blast campaign to multiple contacts',
            tags: ['Blast'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['deviceId', 'name', 'message'],
                properties: {
                    deviceId: { type: 'string', format: 'uuid' },
                    name: { type: 'string' },
                    message: { type: 'string' },
                    groupId: { type: 'string', format: 'uuid' },
                    scheduledAt: { type: 'string', format: 'date-time' },
                    type: { type: 'string', enum: ['TEXT', 'IMAGE', 'DOCUMENT'] },
                    mediaUrl: { type: 'string', format: 'uri' }
                }
            }
        }
    }, blastController.create);

    fastify.get('/blast', {
        schema: {
            description: 'List all blast campaigns',
            tags: ['Blast'],
            security: [{ bearerAuth: [] }]
        }
    }, blastController.list);

    fastify.get('/blast/:id', {
        schema: {
            description: 'Get details and stats of a specific blast campaign',
            tags: ['Blast'],
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' }
                }
            }
        }
    }, blastController.getJob);

    fastify.get('/blast/:id/report', {
        schema: {
            description: 'Download blast campaign report as CSV',
            tags: ['Blast'],
            security: [{ bearerAuth: [] }]
        }
    }, blastController.downloadReport);

    fastify.delete('/blast/:id', {
        schema: {
            description: 'Delete a blast campaign',
            tags: ['Blast'],
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' }
                }
            }
        }
    }, blastController.deleteJob);
}
