import { prisma } from './prisma';
import { redisConnection } from './redis';
import { sessionManager } from '../providers/whatsapp/sessionManager';
import { blastService } from '../services/blastService';

/**
 * Basic Service Registry for Dependency Injection.
 * In a larger project, this could be replaced by a DI container library like Awilix or Tsyringe.
 */
export const registry = {
    prisma,
    redis: redisConnection,
    whatsappProvider: sessionManager,
    blastService,
    // Add other services here...
};

export type Registry = typeof registry;
