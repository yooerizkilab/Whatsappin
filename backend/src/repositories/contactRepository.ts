import { prisma } from '../config/prisma';

export const contactRepository = {
    async findAll(userId: string, groupId?: string, tagId?: string) {
        return prisma.contact.findMany({
            where: {
                userId,
                ...(groupId && { groupId }),
                ...(tagId && { tags: { some: { id: tagId } } })
            },
            include: { group: true, tags: true },
            orderBy: { name: 'asc' },
        });
    },

    async findById(id: string) {
        return prisma.contact.findUnique({ where: { id }, include: { group: true, tags: true } });
    },

    async create(data: { userId: string; name: string; phone: string; email?: string; groupId?: string; tagIds?: string[]; metadata?: any }) {
        const { tagIds, ...contactData } = data;
        return prisma.contact.create({
            data: {
                ...contactData,
                tags: tagIds ? { connect: tagIds.map(id => ({ id })) } : undefined
            },
            include: { tags: true }
        });
    },

    async createMany(contacts: { userId: string; name: string; phone: string; email?: string; groupId?: string; metadata?: any }[]) {
        return prisma.contact.createMany({ data: contacts as any, skipDuplicates: true });
    },

    async update(id: string, data: Partial<{ name: string; phone: string; email: string; groupId: string; tagIds: string[] }>) {
        const { tagIds, ...contactData } = data;
        return prisma.contact.update({
            where: { id },
            data: {
                ...contactData,
                tags: tagIds ? { set: tagIds.map(id => ({ id })) } : undefined
            },
            include: { tags: true }
        });
    },

    async delete(id: string) {
        return prisma.contact.delete({ where: { id } });
    },

    async findGroups(userId: string) {
        return prisma.contactGroup.findMany({ where: { userId }, orderBy: { name: 'asc' } });
    },

    async findGroupById(id: string) {
        return prisma.contactGroup.findUnique({ where: { id } });
    },

    async findGroupByName(userId: string, name: string) {
        return prisma.contactGroup.findFirst({ where: { userId, name } });
    },

    async createGroup(userId: string, name: string) {
        return prisma.contactGroup.create({ data: { userId, name } });
    },

    async deleteGroup(id: string) {
        // Delete all contacts in this group first, then delete the group
        await prisma.contact.deleteMany({ where: { groupId: id } });
        return prisma.contactGroup.delete({ where: { id } });
    },

    async countByGroup(groupId: string) {
        return prisma.contact.count({ where: { groupId } });
    },

    async assignGroupToPhones(userId: string, phones: string[], groupId: string) {
        if (!groupId || phones.length === 0) return { count: 0 } as any;
        // Only assign group to contacts that don't already have a group
        return prisma.contact.updateMany({ where: { userId, phone: { in: phones }, groupId: null }, data: { groupId } });
    },
};
