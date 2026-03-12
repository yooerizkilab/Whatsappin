import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations directly to avoid bundling issues in small projects
// or use backend plugin for larger ones.
const resources = {
    en: {
        common: {
            dashboard: 'Dashboard',
            devices: 'Devices',
            messages: 'Messages',
            contacts: 'Contacts',
            autoResponder: 'Auto Responder',
            aiAgent: 'AI Agent (Knowledge Base)',
            webhooks: 'Webhooks',
            billing: 'Billing',
            settings: 'Settings',
            logout: 'Logout',
            send_message: 'Send Message',
            blast: 'Blast Campaign',
            logs: 'Message Logs',
            media: 'Media Library',
            team: 'Team & Agents',
            analytics: 'Analytics',
            connect_device: 'Connect New Device',
            your_devices: 'Your Devices',
            status: 'Status',
            actions: 'Actions',
        }
    },
    id: {
        common: {
            dashboard: 'Beranda',
            devices: 'Perangkat',
            messages: 'Pesan',
            contacts: 'Kontak',
            autoResponder: 'Balas Otomatis',
            aiAgent: 'Agen AI (Pengetahuan)',
            webhooks: 'Webhook',
            billing: 'Tagihan',
            settings: 'Pengaturan',
            logout: 'Keluar',
            send_message: 'Kirim Pesan',
            blast: 'Kampanye Blast',
            logs: 'Log Pesan',
            media: 'Galeri Media',
            team: 'Tim & Agen',
            analytics: 'Analitik',
            connect_device: 'Hubungkan Perangkat Baru',
            your_devices: 'Perangkat Anda',
            status: 'Status',
            actions: 'Aksi',
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        ns: ['common'],
        defaultNS: 'common',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
