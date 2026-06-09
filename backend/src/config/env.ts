import 'dotenv/config';

export const env = {
    PORT: parseInt(process.env.PORT || '3001', 10),
    HOST: process.env.HOST || '0.0.0.0',
    NODE_ENV: process.env.NODE_ENV || 'development',

    DATABASE_URL: process.env.DATABASE_URL || '',

    JWT_SECRET: process.env.JWT_SECRET || 'changeme',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

    SESSION_DIR: process.env.SESSION_DIR || './sessions',

    WORKER_INTERVAL_MS: parseInt(process.env.WORKER_INTERVAL_MS || '5000', 10),

    MESSAGE_DELAY_MS: parseInt(process.env.MESSAGE_DELAY_MS || '3000', 10),

    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

    // Midtrans
    MIDTRANS_SERVER_KEY: process.env.MIDTRANS_SERVER_KEY || '',
    MIDTRANS_CLIENT_KEY: process.env.MIDTRANS_CLIENT_KEY || '',
    MIDTRANS_IS_PRODUCTION: process.env.MIDTRANS_IS_PRODUCTION === 'true',

    // Redis
    REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
    REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || undefined,

    // AWS
    AWS_REGION: process.env.AWS_REGION || 'ap-southeast-1',
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || '',

    // SMTP
    SMTP_HOST: process.env.SMTP_HOST || '',
    SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
    SMTP_SECURE: process.env.SMTP_SECURE === 'true',
    SMTP_USER: process.env.SMTP_USER || '',
    SMTP_PASS: process.env.SMTP_PASS || '',
    SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL || 'noreply@whatsappin.com',
    SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || 'Whatsappin',
};
