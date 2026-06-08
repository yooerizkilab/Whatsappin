import { FastifyRequest, FastifyReply } from 'fastify';
import { contactRepository } from '../repositories/contactRepository';
import { parseCsvContacts } from '../utils/csvParser';
import { MultipartFile } from '@fastify/multipart';
import { isValidPhone, normalizePhone } from '../utils/phone';

export const contactController = {
    async list(request: FastifyRequest, reply: FastifyReply) {
        const { ownerId } = request.user;
        const { groupId, tagId } = request.query as { groupId?: string; tagId?: string };
        const contacts = await contactRepository.findAll(ownerId, groupId, tagId);
        return reply.send({ success: true, data: contacts });
    },

    async create(request: FastifyRequest, reply: FastifyReply) {
        const { ownerId } = request.user;
        const { name, phone, email, groupId, tagIds } = request.body as {
            name: string;
            phone: string;
            email?: string;
            groupId?: string;
            tagIds?: string[];
        };

        if (!isValidPhone(phone)) {
            return reply.status(400).send({ success: false, message: 'Invalid phone number format' });
        }

        const normalizedPhone = normalizePhone(phone);
        const contact = await contactRepository.create({
            userId: ownerId,
            name,
            phone: normalizedPhone,
            email,
            groupId,
            tagIds
        });
        return reply.status(201).send({ success: true, data: contact });
    },

    async update(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const data = request.body as Partial<{ name: string; phone: string; email: string; groupId: string; tagIds: string[] }>;

        if (data.phone) {
            if (!isValidPhone(data.phone)) {
                return reply.status(400).send({ success: false, message: 'Invalid phone number format' });
            }
            data.phone = normalizePhone(data.phone);
        }

        const contact = await contactRepository.update(id, data);
        return reply.send({ success: true, data: contact });
    },

    async delete(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        await contactRepository.delete(id);
        return reply.send({ success: true, message: 'Contact deleted' });
    },

    async importCsv(request: FastifyRequest, reply: FastifyReply) {
        const { ownerId } = request.user;

        const data = await request.file();
        if (!data) return reply.status(400).send({ success: false, message: 'No file uploaded' });

        const groupIdOverride = (request.query as any).groupId;
        const buffer = await data.toBuffer();
        const parsed = parseCsvContacts(buffer);

        if (parsed.length === 0) {
            return reply.status(400).send({ success: false, message: 'No valid contacts found in CSV' });
        }

        // Normalize and filter valid ones
        type CsvImportRow = ReturnType<typeof parseCsvContacts>[number] & { phone: string; userId: string; groupId?: string };
        const validContacts: CsvImportRow[] = parsed
            .filter(c => isValidPhone(c.phone))
            .map(c => ({
                ...c,
                phone: normalizePhone(c.phone),
                userId: ownerId,
            }));

        if (validContacts.length === 0) {
            return reply.status(400).send({ success: false, message: 'No valid international phone numbers found in CSV' });
        }

        // Auto-resolve groups from CSV column if present and no query param override
        const groupMap = new Map<string, string>();
        if (groupIdOverride) {
            // Query param groupId takes precedence — apply to all contacts
            validContacts.forEach(c => c.groupId = groupIdOverride);
        } else if (validContacts.some(c => c.group)) {
            // Resolve unique group names from CSV and find-or-create
            const uniqueGroups = [...new Set(validContacts.map(c => c.group).filter(Boolean))] as string[];
            for (const groupName of uniqueGroups) {
                let group = await contactRepository.findGroupByName(ownerId, groupName);
                if (!group) {
                    group = await contactRepository.createGroup(ownerId, groupName);
                }
                groupMap.set(groupName, group.id);
            }
            validContacts.forEach(c => {
                if (c.group && groupMap.has(c.group)) {
                    c.groupId = groupMap.get(c.group);
                }
            });
        }

        // Strip extra CSV fields (group, link) — only pass what Prisma expects
        const dbContacts = validContacts.map(c => ({
            userId: c.userId,
            name: c.name,
            phone: c.phone,
            email: c.email,
            groupId: c.groupId,
            metadata: c.metadata,
        }));
        const result = await contactRepository.createMany(dbContacts);

        // If groupId(s) assigned, ensure all imported phones (including skipped duplicates)
        // are assigned to the group. createMany uses skipDuplicates, so existing
        // contacts won't be updated by it — update them explicitly.
        const phonesWithGroup = validContacts.filter(c => c.groupId);
        if (phonesWithGroup.length > 0) {
            // Group by groupId and update each batch
            const groups = new Map<string, string[]>();
            for (const c of phonesWithGroup) {
                const list = groups.get(c.groupId!) || [];
                list.push(c.phone);
                groups.set(c.groupId!, list);
            }
            for (const [gId, phones] of groups) {
                await contactRepository.assignGroupToPhones(ownerId, phones, gId);
            }
        }

        return reply.send({
            success: true,
            message: `Imported ${result.count} contacts`,
            data: { count: result.count },
        });
    },

    async listGroups(request: FastifyRequest, reply: FastifyReply) {
        const { ownerId } = request.user;
        const groups = await contactRepository.findGroups(ownerId);
        return reply.send({ success: true, data: groups });
    },

    async createGroup(request: FastifyRequest, reply: FastifyReply) {
        const { ownerId } = request.user;
        const { name } = request.body as { name: string };
        const group = await contactRepository.createGroup(ownerId, name);
        return reply.status(201).send({ success: true, data: group });
    },
};
