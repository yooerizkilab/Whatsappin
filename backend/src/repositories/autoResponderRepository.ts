import { prisma } from '../config/prisma';

export const autoResponderRepository = {
    // ── AutoResponder CRUD ────────────────────────────────────

    async findByUserId(userId: string) {
        return prisma.autoResponder.findMany({
            where: { userId },
            include: {
                device: { select: { id: true, name: true, phoneNumber: true, status: true } },
                rules: { orderBy: { order: 'asc' } },
            },
            orderBy: { createdAt: 'desc' },
        });
    },

    async findById(id: string, userId: string) {
        return prisma.autoResponder.findFirst({
            where: { id, userId },
            include: {
                device: { select: { id: true, name: true, phoneNumber: true, status: true } },
                rules: { orderBy: { order: 'asc' } },
            },
        });
    },

    async findActiveByDeviceId(deviceId: string) {
        return prisma.autoResponder.findFirst({
            where: { deviceId, isActive: true },
            include: {
                device: {
                    select: {
                        id: true,
                        knowledgeBase: {
                            select: { id: true, isActive: true }
                        }
                    }
                },
                rules: { where: { isActive: true }, orderBy: { order: 'asc' } },
                user: { select: { id: true, messagesSentThisMonth: true, subscriptionStatus: true, subscriptionPlan: true } }
            },
        });
    },

    async create(data: {
        userId: string;
        deviceId: string;
        name: string;
        isActive?: boolean;
        aiProvider?: string | null;
        aiModel?: string | null;
        apiKey?: string | null;
        systemPrompt?: string | null;
    }) {
        return prisma.autoResponder.create({ data });
    },

    async update(
        id: string,
        userId: string,
        data: Partial<{
            name: string;
            isActive: boolean;
            aiProvider: string | null;
            aiModel: string | null;
            apiKey: string | null;
            systemPrompt: string | null;
        }>
    ) {
        return prisma.autoResponder.updateMany({ where: { id, userId }, data });
    },

    async delete(id: string, userId: string) {
        return prisma.autoResponder.deleteMany({ where: { id, userId } });
    },

    // ── Rules CRUD ───────────────────────────────────────────

    async findRuleById(ruleId: string, autoResponderId: string) {
        return prisma.autoResponderRule.findFirst({ where: { id: ruleId, autoResponderId } });
    },

    async createRule(data: {
        autoResponderId: string;
        keywords: string;
        matchType?: string;
        response: string;
        order?: number;
        isActive?: boolean;
    }) {
        return prisma.autoResponderRule.create({ data });
    },

    async updateRule(
        ruleId: string,
        autoResponderId: string,
        data: Partial<{
            keywords: string;
            matchType: string;
            response: string;
            order: number;
            isActive: boolean;
        }>
    ) {
        return prisma.autoResponderRule.updateMany({ where: { id: ruleId, autoResponderId }, data });
    },

    async deleteRule(ruleId: string, autoResponderId: string) {
        return prisma.autoResponderRule.deleteMany({ where: { id: ruleId, autoResponderId } });
    },
};
