import { prisma } from '../config/prisma';

export const templateRepository = {
    async findAll(userId: string, skip = 0, take = 20) {
        const where = { userId };
        const [data, total] = await prisma.$transaction([
            prisma.template.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
            prisma.template.count({ where }),
        ]);
        return { data, total };
    },

    async findById(id: string) {
        return prisma.template.findUnique({ where: { id } });
    },

    async create(data: { userId: string; name: string; content: string; variables?: string[] }) {
        return prisma.template.create({ data: { ...data, variables: data.variables as any } });
    },

    async update(id: string, data: Partial<{ name: string; content: string; variables: string[] }>) {
        return prisma.template.update({ where: { id }, data: { ...data, variables: data.variables as any } });
    },

    async delete(id: string) {
        return prisma.template.delete({ where: { id } });
    },
};
