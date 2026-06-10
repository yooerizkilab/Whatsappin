'use client';

import { useEffect, useRef } from 'react';
import { useDeviceStore } from '@/store/deviceStore';

export function useWebSocket(userId?: string, token?: string) {
    const wsRef = useRef<WebSocket | null>(null);
    const { updateDeviceStatus, setQrCode, clearQrCode } = useDeviceStore();

    useEffect(() => {
        if (!userId || !token) return;

        const baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
        const wsUrl = baseUrl.endsWith('/ws') ? baseUrl : `${baseUrl}/ws`;
        let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
        let authenticated = false;

        function connect() {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;
            authenticated = false;

            ws.onopen = () => {
                // First, authenticate with JWT token
                ws.send(JSON.stringify({ type: 'authenticate', token }));
            };

            ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);

                    switch (msg.type) {
                        case 'authenticated':
                            authenticated = true;
                            // Now we can subscribe to devices
                            ws.send(JSON.stringify({ type: 'subscribe', userId }));
                            break;

                        case 'subscribed':
                            // Ready to receive device events
                            break;

                        case 'error':
                            // Handle auth errors
                            if (!authenticated) {
                                ws.close();
                            }
                            break;

                        case 'qr_update':
                            setQrCode(msg.data.deviceId, msg.data.qr);
                            break;

                        case 'device_status':
                            updateDeviceStatus(
                                msg.data.deviceId,
                                msg.data.status,
                                msg.data.phoneNumber
                            );
                            if (msg.data.status === 'CONNECTED') {
                                clearQrCode(msg.data.deviceId);
                            }
                            break;

                        case 'blast_progress':
                            window.dispatchEvent(
                                new CustomEvent('blast_progress', { detail: msg.data })
                            );
                            break;

                        case 'new_message':
                            window.dispatchEvent(
                                new CustomEvent('new_message', { detail: msg.data })
                            );
                            break;
                    }
                } catch { }
            };

            ws.onclose = () => {
                wsRef.current = null;
                authenticated = false;
                reconnectTimer = setTimeout(connect, 3000);
            };

            ws.onerror = () => {
                ws.close();
            };
        }

        connect();

        return () => {
            if (reconnectTimer) clearTimeout(reconnectTimer);
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [userId, token]);
}
