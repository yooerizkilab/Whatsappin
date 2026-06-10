import WebSocket from 'ws';
import { FastifyInstance } from 'fastify';
import { prisma } from '../config/prisma';

interface WsClient {
    ws: WebSocket;
    userId?: string;
    deviceId?: string;
}

class WsServer {
    private clients: Set<WsClient> = new Set();

    handleConnection(ws: WebSocket, fastify: FastifyInstance) {
        const client: WsClient = { ws };
        this.clients.add(client);

        ws.on('message', async (data) => {
            try {
                const msg = JSON.parse(data.toString());

                if (msg.type === 'authenticate') {
                    const token = msg.token;
                    try {
                        const payload = fastify.jwt.verify(token) as any;
                        client.userId = payload.id;
                        ws.send(JSON.stringify({ type: 'authenticated', userId: payload.id }));
                    } catch (err) {
                        ws.send(JSON.stringify({ type: 'error', message: 'Unauthorized' }));
                        ws.close();
                    }
                    return;
                }

                if (msg.type === 'subscribe') {
                    if (!client.userId) {
                        ws.send(JSON.stringify({ type: 'error', message: 'Authentication required' }));
                        return;
                    }

                    const deviceId = msg.deviceId;
                    // Verify ownership
                    const device = await prisma.device.findFirst({
                        where: { id: deviceId, userId: client.userId }
                    });

                    if (!device) {
                        ws.send(JSON.stringify({ type: 'error', message: 'Forbidden: Device not found or access denied' }));
                        return;
                    }

                    client.deviceId = deviceId;
                    ws.send(JSON.stringify({ type: 'subscribed', deviceId }));
                }
            } catch { }
        });

        ws.on('close', () => {
            this.clients.delete(client);
        });

        ws.on('error', () => {
            this.clients.delete(client);
        });

        ws.send(JSON.stringify({ type: 'connected' }));
    }

    broadcast(event: string, payload: object, deviceId?: string) {
        const message = JSON.stringify({ type: event, data: payload });
        this.clients.forEach((client) => {
            if (client.ws.readyState !== WebSocket.OPEN) return;
            if (deviceId && client.deviceId && client.deviceId !== deviceId) return;
            client.ws.send(message);
        });
    }

    sendToDevice(deviceId: string, event: string, payload: object) {
        this.broadcast(event, payload, deviceId);
    }
}

export const wsServer = new WsServer();
