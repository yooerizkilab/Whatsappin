import { env } from '../config/env';

interface MailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

export async function sendMail(options: MailOptions): Promise<void> {
    if (!env.SMTP_HOST) {
        console.warn('[Mailer] SMTP not configured — skip sending email to', options.to);
        console.warn('[Mailer] Would have sent:', options.subject);
        return;
    }

    const nodemailer = await import('nodemailer');

    const transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
        },
    });

    await transporter.sendMail({
        from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
    });
}
