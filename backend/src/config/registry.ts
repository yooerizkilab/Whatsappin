import { prisma } from './prisma';
import { redisConnection } from './redis';
import { sessionManager } from '../providers/whatsapp/sessionManager';
import { blastService } from '../services/blastService';
import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';
import { IWhatsappProvider } from '../providers/whatsapp/IWhatsappProvider';

export interface Registry {
    prisma: PrismaClient;
    redis: Redis;
    whatsappProvider: IWhatsappProvider;
    blastService: typeof blastService;
}

/**
 * Basic Service Registry for Dependency Injection.
 * In a larger project, this could be replaced by a DI container library like Awilix or Tsyringe.
 */
export const registry: Registry = {
    prisma,
    redis: redisConnection,
    whatsappProvider: sessionManager,
    blastService,
    // Add other services here...
};

