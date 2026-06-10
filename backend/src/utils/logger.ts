import * as fs from 'fs';
import * as path from 'path';

class Logger {
    private logDir = path.join(process.cwd(), 'logs');
    private logFile = path.join(this.logDir, 'app.log');

    constructor() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    private formatMessage(level: string, message: string, ...args: any[]): string {
        const timestamp = new Date().toISOString();
        const formattedArgs = args.length > 0 ? ' ' + args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
        ).join(' ') : '';
        return `[${timestamp}] [${level.toUpperCase()}] ${message}${formattedArgs}\n`;
    }

    private writeToFile(text: string) {
        fs.appendFileSync(this.logFile, text);
    }

    info(message: string, ...args: any[]) {
        const text = this.formatMessage('INFO', message, ...args);
        console.log(`\x1b[32m[INFO]\x1b[0m ${message}`, ...args); // Green INFO
        this.writeToFile(text);
    }

    error(message: string, ...args: any[]) {
        const text = this.formatMessage('ERROR', message, ...args);
        console.error(`\x1b[31m[ERROR]\x1b[0m ${message}`, ...args); // Red ERROR
        this.writeToFile(text);
    }

    debug(message: string, ...args: any[]) {
        const text = this.formatMessage('DEBUG', message, ...args);
        // Debug doesn't go to console anymore as per user request (skip console.log)
        this.writeToFile(text);
    }

    warn(message: string, ...args: any[]) {
        const text = this.formatMessage('WARN', message, ...args);
        console.warn(`\x1b[33m[WARN]\x1b[0m ${message}`, ...args); // Yellow WARN
        this.writeToFile(text);
    }

    maskPhone(phone: string): string {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length <= 4) return '****';
        return cleaned.substring(0, cleaned.length - 4).replace(/./g, '*') + cleaned.slice(-4);
    }
}

export const logger = new Logger();
