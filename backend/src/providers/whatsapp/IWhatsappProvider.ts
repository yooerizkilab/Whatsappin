export interface IWhatsappProvider {
    createSession(deviceId: string): Promise<void>;
    destroySession(deviceId: string): Promise<void>;
    sendTextMessage(deviceId: string, to: string, text: string): Promise<void>;
    sendImageMessage(deviceId: string, to: string, imageUrl: string, caption?: string): Promise<void>;
    sendDocumentMessage(deviceId: string, to: string, docUrl: string, filename: string, mimetype?: string): Promise<void>;
    getSession(deviceId: string): any;
    getAllSessions(): Map<string, any>;
}
