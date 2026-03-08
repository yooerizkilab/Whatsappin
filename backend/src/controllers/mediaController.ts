import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../config/prisma';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';
const pump = promisify(pipeline);

export const mediaController = {
    async list(request: FastifyRequest, reply: FastifyReply) {
        const { ownerId } = request.user;
        const media = await prisma.media.findMany({
            where: { userId: ownerId },
            orderBy: { createdAt: 'desc' }
        });
        return reply.send({ success: true, data: media });
    },

    async upload(request: FastifyRequest, reply: FastifyReply) {
        const { ownerId } = request.user;
        const data = await request.file();

        if (!data) {
            return reply.status(400).send({ success: false, message: 'No file uploaded' });
        }

        const filename = `${Date.now()}-${data.filename}`;
        const uploadDir = path.join(__dirname, '../../uploads');

        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, filename);
        await pump(data.file, fs.createWriteStream(filePath));

        // Create DB record
        const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
        const media = await prisma.media.create({
            data: {
                name: data.filename,
                url: `${baseUrl}/uploads/${filename}`,
                type: data.mimetype,
                size: (data as any).file.bytesRead || 0, // approximation if not available in multipart
                userId: ownerId
            }
        });

        return reply.send({ success: true, data: media });
    },

    async delete(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const { ownerId } = request.user;

        const media = await prisma.media.findUnique({
            where: { id }
        });

        if (!media || media.userId !== ownerId) {
            return reply.status(404).send({ success: false, message: 'Media not found' });
        }

        // Delete file
        const filename = media.url.split('/').pop();
        if (filename) {
            const filePath = path.join(__dirname, '../../uploads', filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Delete from DB
        await prisma.media.delete({
            where: { id }
        });

        return reply.send({ success: true, message: 'Media deleted successfully' });
    }
};
