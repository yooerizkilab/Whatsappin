import { FastifyInstance } from 'fastify';
import { contactController } from '../controllers/contactController';
import { authenticate } from '../middlewares/auth';

export async function contactRoutes(fastify: FastifyInstance) {
    fastify.addHook('preHandler', authenticate);

    fastify.get('/', {
        schema: {
            description: 'List all contacts with optional search and group filter',
            tags: ['Contacts'],
            security: [{ bearerAuth: [] }],
            querystring: {
                type: 'object',
                properties: {
                    search: { type: 'string' },
                    groupId: { type: 'string' },
                    page: { type: 'integer', default: 1 },
                    pageSize: { type: 'integer', default: 50 }
                }
            }
        }
    }, contactController.list);

    fastify.post('/', {
        schema: {
            description: 'Create a single contact',
            tags: ['Contacts'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['name', 'phone'],
                properties: {
                    name: { type: 'string' },
                    phone: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    groupId: { type: 'string' }
                }
            }
        }
    }, contactController.create);

    fastify.put('/:id', {
        schema: {
            description: 'Update a contact',
            tags: ['Contacts'],
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: { id: { type: 'string', format: 'uuid' } }
            },
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    phone: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    groupId: { type: 'string' }
                }
            }
        }
    }, contactController.update);

    fastify.delete('/:id', {
        schema: {
            description: 'Delete a contact',
            tags: ['Contacts'],
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: { id: { type: 'string', format: 'uuid' } }
            }
        }
    }, contactController.delete);

    fastify.post('/import', {
        schema: {
            description: 'Import contacts from CSV file',
            tags: ['Contacts'],
            security: [{ bearerAuth: [] }],
            consumes: ['multipart/form-data']
        }
    }, contactController.importCsv);

    fastify.get('/groups', {
        schema: {
            description: 'List all contact groups',
            tags: ['Contacts'],
            security: [{ bearerAuth: [] }]
        }
    }, contactController.listGroups);

    fastify.post('/groups', {
        schema: {
            description: 'Create a new contact group',
            tags: ['Contacts'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['name'],
                properties: { name: { type: 'string' } }
            }
        }
    }, contactController.createGroup);

    fastify.delete('/groups/:id', {
        schema: {
            description: 'Delete a contact group',
            tags: ['Contacts'],
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: { id: { type: 'string', format: 'uuid' } }
            }
        }
    }, contactController.deleteGroup);
}
