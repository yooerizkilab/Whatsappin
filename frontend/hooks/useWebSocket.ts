'use client';

import { useEffect, useRef } from 'react';
import { useDeviceStore } from '@/store/deviceStore';

export function useWebSocket(userId?: string) {
    const wsRef = useRef<WebSocket | null>(null);
    const { updateDeviceStatus, setQrCode, clearQrCode } = useDeviceStore();

    useEffect(() => {
        if (!userId) return;

        const baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
        const wsUrl = baseUrl.endsWith('/ws') ? baseUrl : `${baseUrl}/ws`;
        let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

        function connect() {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                ws.send(JSON.stringify({ type: 'subscribe', userId }));
            };

            ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);

                    switch (msg.type) {
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
    }, [userId]);
}
