import '@fastify/jwt';

declare module '@fastify/jwt' {
    interface FastifyJWT {
        user: {
            id: string;
            email: string;
            role: 'ADMIN' | 'USER' | 'AGENT';
            name: string;
            parentId?: string | null;
            ownerId: string;
            permissions?: any;
        };
    }
}
