'use client';

import { useState } from 'react';
import Link from 'next/link';

/* ── Code Block Component ── */
function Code({ code, lang = 'json' }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <div className="relative group bg-[#050505] border border-white/10 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{lang}</span>
        <button onClick={copy} className="text-[10px] text-gray-500 hover:text-white transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
      </div>
      <pre className="p-4 text-sm leading-relaxed text-gray-300 overflow-x-auto"><code>{code}</code></pre>
    </div>
  );
}

/* ── Method Badge ── */
function Method({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'text-emerald-400 bg-emerald-500/10',
    POST: 'text-blue-400 bg-blue-500/10',
    PUT: 'text-amber-400 bg-amber-500/10',
    DELETE: 'text-red-400 bg-red-500/10',
  };
  return <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-full ${colors[method] || 'text-gray-400 bg-white/5'}`}>{method}</span>;
}

/* ── Sidebar Sections ── */
const sections = [
  { title: 'Introduction', items: [
    { id: 'overview', label: 'Overview' },
    { id: 'base-url', label: 'Base URL' },
    { id: 'auth', label: 'Authentication' },
    { id: 'headers', label: 'Headers' },
    { id: 'errors', label: 'Errors' },
  ]},
  { title: 'Auth', items: [
    { id: 'login', label: 'Login' },
    { id: 'register', label: 'Register' },
  ]},
  { title: 'Devices', items: [
    { id: 'list-devices', label: 'List Devices' },
    { id: 'create-device', label: 'Create Device' },
    { id: 'get-device-status', label: 'Get Status' },
    { id: 'delete-device', label: 'Delete Device' },
  ]},
  { title: 'Messages', items: [
    { id: 'send-message', label: 'Send Message' },
    { id: 'message-logs', label: 'Message Logs' },
  ]},
  { title: 'Blast', items: [
    { id: 'create-blast', label: 'Create Blast' },
    { id: 'list-blast-jobs', label: 'List Jobs' },
    { id: 'get-blast-job', label: 'Get Job' },
    { id: 'delete-blast-job', label: 'Delete Job' },
  ]},
  { title: 'Contacts', items: [
    { id: 'list-contacts', label: 'List Contacts' },
    { id: 'create-contact', label: 'Create Contact' },
    { id: 'update-contact', label: 'Update Contact' },
    { id: 'delete-contact', label: 'Delete Contact' },
    { id: 'import-csv', label: 'Import CSV' },
    { id: 'list-groups', label: 'List Groups' },
    { id: 'create-group', label: 'Create Group' },
    { id: 'delete-group', label: 'Delete Group' },
  ]},
  { title: 'Templates', items: [
    { id: 'list-templates', label: 'List Templates' },
    { id: 'create-template', label: 'Create Template' },
    { id: 'update-template', label: 'Update Template' },
    { id: 'delete-template', label: 'Delete Template' },
  ]},
  { title: 'Auto Responder', items: [
    { id: 'list-auto-responders', label: 'List Responders' },
    { id: 'create-auto-responder', label: 'Create Responder' },
    { id: 'add-rule', label: 'Add Rule' },
    { id: 'update-rule', label: 'Update Rule' },
    { id: 'delete-rule', label: 'Delete Rule' },
    { id: 'delete-auto-responder', label: 'Delete Responder' },
  ]},
  { title: 'Webhooks', items: [
    { id: 'list-webhooks', label: 'List Webhooks' },
    { id: 'create-webhook', label: 'Create Webhook' },
  ]},
  { title: 'API Keys', items: [
    { id: 'list-api-keys', label: 'List API Keys' },
    { id: 'create-api-key', label: 'Create API Key' },
  ]},
  { title: 'Analytics', items: [
    { id: 'blast-stats', label: 'Blast Stats' },
  ]},
];

/* ── Endpoint Definition ── */
function Endpoint({ method, path, title, desc, auth, body, example, id }: {
  method: string; path: string; title: string; desc: string; auth: string;
  body?: string; example?: string; id?: string;
}) {
  return (
    <section id={id || title.toLowerCase().replace(/\s+/g, '-')} className="space-y-4 scroll-mt-24 py-6 border-t border-white/5 first:border-0">
      <div className="flex items-center gap-3 flex-wrap">
        <Method method={method} />
        <code className="text-sm font-mono text-gray-300 bg-white/5 px-3 py-1 rounded-lg">{path}</code>
        <span className="text-[10px] text-gray-600 font-mono bg-white/5 px-2 py-0.5 rounded-full">{auth}</span>
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
      {body && (
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-2">Request Body</div>
          <Code code={body} lang="json" />
        </div>
      )}
      {example && (
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-2">Example Response</div>
          <Code code={example} lang="json" />
        </div>
      )}
    </section>
  );
}

/* ── Page ── */
export default function ApiReferencePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-brand-500/30">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tighter">
              <div className="w-7 h-7 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
                <span className="text-white text-sm">W</span>
              </div>
              Whatsappin
            </Link>
            <span className="text-xs text-gray-600 font-mono border border-white/10 rounded-full px-3 py-0.5">API v1</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/docs" className="hidden sm:inline text-sm font-medium text-gray-400 hover:text-white transition-colors">Docs</Link>
            <Link href="/register" className="px-4 py-2 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-500/20">Get Started</Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 pt-24 pb-20">
        <div className="flex gap-12 relative">

          {/* Sidebar */}
          <aside className="hidden lg:block w-[240px] shrink-0">
            <div className="sticky top-24 space-y-6 overflow-y-auto max-h-[calc(100vh-120px)] pr-2">
              {sections.map(s => (
                <div key={s.title}>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">{s.title}</h4>
                  <ul className="space-y-1">
                    {s.items.map(i => (
                      <li key={i.id}>
                        <a href={`#${i.id}`}
                          className="block px-3 py-1.5 text-sm text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                          {i.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="pt-4 border-t border-white/5">
                <Link href="/docs" className="text-sm font-bold text-brand-400 hover:text-brand-300 transition-colors">📖 Dev Guide →</Link>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 max-w-4xl min-w-0">

            {/* ── TITLE ── */}
            <section className="space-y-4 pt-4 pb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[10px] font-bold uppercase tracking-widest">API Reference</div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Whatsappin API</h1>
              <p className="text-lg text-gray-400 leading-relaxed max-w-3xl">
                REST API untuk mengintegrasikan WhatsApp ke aplikasi Anda. Kirim pesan, kelola device, atur auto-responder, dan banyak lagi.
                Semua endpoint mengembalikan data dalam format JSON.
              </p>
            </section>

            {/* ── OVERVIEW ── */}
            <section id="overview" className="space-y-4 scroll-mt-24 py-6 border-t border-white/5">
              <h2 className="text-2xl font-bold">Overview</h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Whatsappin API dirancang dengan prinsip RESTful. Setiap resource memiliki endpoint yang konsisten.
                Semua request harus menyertakan <strong className="text-white">Content-Type: application/json</strong>.
                Response selalu mengembalikan struktur standar:
              </p>
              <Code code={`// Success
{
  "success": true,
  "data": { ... }     // atau array [...]
}

// Error
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}`} lang="json" />
            </section>

            {/* ── BASE URL ── */}
            <section id="base-url" className="space-y-4 scroll-mt-24 py-6 border-t border-white/5">
              <h2 className="text-2xl font-bold">Base URL</h2>
              <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
                <p className="text-sm font-mono text-brand-400">https://yourdomain.com/v1</p>
                <p className="text-xs text-gray-500 mt-2">Ganti <code className="text-brand-400">yourdomain.com</code> dengan domain VPS atau <code className="text-brand-400">localhost:3001</code> untuk development lokal.</p>
              </div>
            </section>

            {/* ── AUTH ── */}
            <section id="auth" className="space-y-4 scroll-mt-24 py-6 border-t border-white/5">
              <h2 className="text-2xl font-bold">Authentication</h2>
              <p className="text-sm text-gray-400 leading-relaxed">Whatsappin mendukung dua metode autentikasi:</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="font-bold text-sm mb-2">🔐 JWT Token</h4>
                  <p className="text-xs text-gray-500 mb-2">Untuk akses dari frontend dashboard.</p>
                  <Code code={`Authorization: Bearer eyJhbGciOiJIUzI1NiIs...`} lang="http" />
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="font-bold text-sm mb-2">🔑 API Key</h4>
                  <p className="text-xs text-gray-500 mb-2">Untuk integrasi server-to-server.</p>
                  <Code code={`x-api-key: your-api-key-here`} lang="http" />
                </div>
              </div>
            </section>

            {/* ── HEADERS ── */}
            <section id="headers" className="space-y-4 scroll-mt-24 py-6 border-t border-white/5">
              <h2 className="text-2xl font-bold">Headers</h2>
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-sm">
                  <thead><tr className="bg-white/5 text-left text-gray-500 text-[10px] uppercase tracking-wider">
                    <th className="p-3 font-bold">Header</th><th className="p-3 font-bold">Required</th><th className="p-3 font-bold">Description</th>
                  </tr></thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      ['Content-Type', '✅', 'application/json (kecuali import CSV)'],
                      ['Authorization', 'optional', 'Bearer &lt;JWT&gt; untuk user'],
                      ['x-api-key', 'optional', 'API Key untuk server'],
                    ].map(([h, req, desc]) => (
                      <tr key={h} className="hover:bg-white/5">
                        <td className="p-3 font-mono text-xs text-brand-400">{h}</td>
                        <td className="p-3"><span className={`text-[10px] px-2 py-0.5 rounded-full ${req === '✅' ? 'bg-red-500/10 text-red-400' : 'bg-gray-500/10 text-gray-500'}`}>{req}</span></td>
                        <td className="p-3 text-xs text-gray-400">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── ERRORS ── */}
            <section id="errors" className="space-y-4 scroll-mt-24 py-6 border-t border-white/5">
              <h2 className="text-2xl font-bold">Errors</h2>
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-sm">
                  <thead><tr className="bg-white/5 text-left text-gray-500 text-[10px] uppercase tracking-wider">
                    <th className="p-3 font-bold">Code</th><th className="p-3 font-bold">Status</th><th className="p-3 font-bold">Description</th>
                  </tr></thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      ['P6001', '500', 'Database connection error'],
                      ['UNAUTHORIZED', '401', 'Invalid JWT or API Key'],
                      ['FORBIDDEN', '403', 'Insufficient permissions'],
                      ['NOT_FOUND', '404', 'Resource not found'],
                      ['RATE_LIMIT', '429', 'Too many requests'],
                      ['DEVICE_OFFLINE', '400', 'Device is not connected'],
                      ['INVALID_PHONE', '400', 'Invalid phone number format'],
                      ['QUOTA_EXCEEDED', '400', 'Monthly limit reached'],
                      ['BLAST_EMPTY', '400', 'No contacts found'],
                    ].map(([c, s, d]) => (
                      <tr key={c} className="hover:bg-white/5"><td className="p-3 font-mono text-xs text-red-400">{c}</td><td className="p-3"><span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-400">{s}</span></td><td className="p-3 text-xs text-gray-400">{d}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── AUTH ENDPOINTS ── */}
            <div className="pt-8">
              <h2 className="text-2xl font-bold mb-6 border-b border-white/5 pb-4">🔐 Auth</h2>

              <Endpoint method="POST" path="/v1/auth/login" title="Login" auth="Public" desc="Login user dan dapatkan JWT token." body={`{
  "email": "user@example.com",
  "password": "your-password"
}`} example={`{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    }
  }
}`} />

              <Endpoint method="POST" path="/v1/auth/register" title="Register" auth="Public" desc="Daftar akun baru." body={`{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "your-password",
  "phone": "628123456789"
}`} example={`{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": "uuid", "email": "user@example.com", "role": "USER" }
  }
}`} />
            </div>

            {/* ── DEVICES ── */}
            <div className="pt-8">
              <h2 className="text-2xl font-bold mb-6 border-b border-white/5 pb-4">📱 Devices</h2>

              <Endpoint method="GET" path="/v1/devices" title="List Devices" auth="JWT / API Key" desc="Mendapatkan daftar semua device user." example={`{
  "success": true,
  "data": [
    {
      "id": "uuid-device",
      "name": "Marketing Phone",
      "phoneNumber": "628123456789",
      "status": "CONNECTED",
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}`} />

              <Endpoint method="POST" path="/v1/devices/connect" title="Create Device" auth="JWT / API Key" desc="Buat device baru dan mulai sesi WhatsApp. Response akan mengembalikan QR code." body={`{
  "name": "Marketing Phone"
}`} example={`{
  "success": true,
  "data": {
    "id": "uuid-device",
    "name": "Marketing Phone",
    "status": "CONNECTING"
  },
  "message": "Device created. Scan the QR code shortly."
}`} />

              <Endpoint method="GET" path="/v1/devices/:id/status" title="Get Device Status" auth="JWT / API Key" desc="Cek status koneksi device tertentu." example={`{
  "success": true,
  "data": {
    "status": "CONNECTED",
    "phoneNumber": "628123456789"
  }
}`} />

              <Endpoint method="DELETE" path="/v1/devices/:id" title="Delete Device" auth="JWT / API Key" desc="Putuskan koneksi dan hapus device." example={`{
  "success": true,
  "message": "Device disconnected and removed"
}`} />
            </div>

            {/* ── MESSAGES ── */}
            <div className="pt-8">
              <h2 className="text-2xl font-bold mb-6 border-b border-white/5 pb-4">💬 Messages</h2>

              <Endpoint method="POST" path="/v1/messages/send" title="Send Message" auth="JWT / API Key" desc="Kirim pesan teks, gambar, atau dokumen ke nomor WhatsApp." body={`{
  "deviceId": "uuid-device",
  "to": "628123456789",
  "type": "TEXT",
  "content": "Halo! Ini pesan dari API."
}`} example={`{
  "success": true,
  "data": {
    "id": "msg-uuid",
    "status": "SENT",
    "sentAt": "2025-01-01T12:00:00Z"
  }
}`} />

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 space-y-2">
                <p><strong className="text-white">📷 Send Image:</strong> tambah <code className="text-brand-400">"type": "IMAGE"</code> + <code className="text-brand-400">"mediaUrl": "https://..."</code></p>
                <p><strong className="text-white">📄 Send Document:</strong> tambah <code className="text-brand-400">"type": "DOCUMENT"</code> + <code className="text-brand-400">"mediaUrl": "https://..."</code></p>
                <p><strong className="text-white">📞 Phone Format:</strong> gunakan format internasional tanpa +, contoh <code className="text-brand-400">628123456789</code></p>
              </div>

              <Endpoint method="GET" path="/v1/messages/logs?deviceId=&status=&limit=&offset=" title="Message Logs" auth="JWT / API Key" desc="Riwayat pengiriman pesan." example={`{
  "success": true,
  "data": [
    {
      "id": "msg-uuid",
      "to": "628123456789",
      "content": "Halo!",
      "status": "SENT",
      "type": "TEXT",
      "createdAt": "2025-01-01T12:00:00Z"
    }
  ]
}`} />
            </div>

            {/* ── BLAST ── */}
            <div className="pt-8">
              <h2 className="text-2xl font-bold mb-6 border-b border-white/5 pb-4">📢 Blast Campaign</h2>

              <Endpoint method="POST" path="/v1/messages/blast" title="Create Blast" auth="JWT / API Key" desc="Buat kampanye blast ke grup kontak. Pesan dikirim otomatis dengan delay." body={`{
  "deviceId": "uuid-device",
  "name": "Promo Ramadan",
  "message": "Halo {{name}}! Dapatkan promo kami: {{link}}",
  "groupId": "uuid-group",
  "templateId": "uuid-template",
  "type": "TEXT",
  "scheduledAt": "2025-03-01T09:00:00Z"
}`} example={`{
  "success": true,
  "data": {
    "jobId": "uuid-job",
    "sent": 145,
    "failed": 2
  }
}`} />

              <Endpoint method="GET" path="/v1/messages/blast" title="List Blast Jobs" auth="JWT / API Key" desc="Daftar semua kampanye blast." example={`{
  "success": true,
  "data": [
    {
      "id": "uuid-job",
      "name": "Promo Ramadan",
      "status": "COMPLETED",
      "device": { "name": "Marketing" },
      "_count": { "recipients": 150 },
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}`} />

              <Endpoint method="GET" path="/v1/messages/blast/:id" title="Get Blast Job" auth="JWT / API Key" desc="Detail kampanye blast termasuk statistik." example={`{
  "success": true,
  "data": {
    "id": "uuid-job",
    "name": "Promo Ramadan",
    "status": "COMPLETED",
    "stats": { "total": 150, "sent": 145, "failed": 5, "pending": 0 }
  }
}`} />

              <Endpoint method="DELETE" path="/v1/messages/blast/:id" title="Delete Blast Job" auth="JWT / API Key" desc="Hapus kampanye blast dari riwayat." />
            </div>

            {/* ── CONTACTS ── */}
            <div className="pt-8">
              <h2 className="text-2xl font-bold mb-6 border-b border-white/5 pb-4">👥 Contacts</h2>

              <Endpoint method="GET" path="/v1/contacts?groupId=&tagId=" title="List Contacts" auth="JWT / API Key" desc="Daftar kontak dengan filter grup dan tag." example={`{
  "success": true,
  "data": [
    {
      "id": "uuid-contact",
      "name": "John Doe",
      "phone": "628123456789",
      "email": "john@email.com",
      "group": { "name": "Invitation" },
      "tags": []
    }
  ]
}`} />

              <Endpoint method="POST" path="/v1/contacts" title="Create Contact" auth="JWT / API Key" desc="Tambah kontak baru." body={`{
  "name": "John Doe",
  "phone": "628123456789",
  "email": "john@email.com",
  "groupId": "uuid-group",
  "tagIds": ["uuid-tag"]
}`} />

              <Endpoint method="PUT" path="/v1/contacts/:id" title="Update Contact" auth="JWT / API Key" desc="Update data kontak." body={`{
  "name": "John Updated",
  "phone": "628123456789",
  "email": "john@email.com",
  "groupId": "uuid-group"
}`} />

              <Endpoint method="DELETE" path="/v1/contacts/:id" title="Delete Contact" auth="JWT / API Key" desc="Hapus kontak." />

              <Endpoint method="POST" path="/v1/contacts/import" title="Import CSV" auth="JWT / API Key" desc="Import kontak dari file CSV. Format: name, phone, email, link, group." body={`Content-Type: multipart/form-data
File: contacts.csv

name,phone,email,link,group
John Doe,628123456789,john@email.com,https://link.com/john,Invitation
Jane,628987654321,jane@email.com,,Customers`} example={`{
  "success": true,
  "message": "Imported 50 contacts",
  "data": { "count": 50 }
}`} />

              <Endpoint method="GET" path="/v1/contacts/groups" title="List Groups" auth="JWT / API Key" desc="Daftar semua grup kontak." />

              <Endpoint method="POST" path="/v1/contacts/groups" title="Create Group" auth="JWT / API Key" desc="Buat grup kontak baru." body={`{ "name": "VIP Customers" }`} />

              <Endpoint method="DELETE" path="/v1/contacts/groups/:id" title="Delete Group" auth="JWT / API Key" desc="Hapus grup. Kontak di dalamnya tetap aman (groupId menjadi null)." />
            </div>

            {/* ── TEMPLATES ── */}
            <div className="pt-8">
              <h2 className="text-2xl font-bold mb-6 border-b border-white/5 pb-4">📝 Templates</h2>

              <Endpoint method="GET" path="/v1/templates" title="List Templates" auth="JWT / API Key" desc="Daftar template pesan." />

              <Endpoint method="POST" path="/v1/templates" title="Create Template" auth="JWT / API Key" desc="Buat template pesan dengan variabel dinamis." body={`{
  "name": "Welcome Message",
  "content": "Halo {{name}}! Terima kasih telah mendaftar. Kunjungi {{link}}",
  "variables": ["name", "link"]
}`} />

              <Endpoint method="PUT" path="/v1/templates/:id" title="Update Template" auth="JWT / API Key" desc="Update template." body={`{
  "name": "Welcome Updated",
  "content": "Halo {{name}}! Isi baru..."
}`} />

              <Endpoint method="DELETE" path="/v1/templates/:id" title="Delete Template" auth="JWT / API Key" desc="Hapus template." />
            </div>

            {/* ── AUTO RESPONDER ── */}
            <div className="pt-8">
              <h2 className="text-2xl font-bold mb-6 border-b border-white/5 pb-4">🤖 Auto Responder</h2>

              <Endpoint method="GET" path="/v1/auto-responder" title="List Auto Responders" auth="JWT / API Key" desc="Daftar auto-responder." />

              <Endpoint method="POST" path="/v1/auto-responder" title="Create Auto Responder" auth="JWT / API Key" desc="Buat auto-responder dengan keyword rules + AI." body={`{
  "deviceId": "uuid-device",
  "name": "Customer Support",
  "aiProvider": "gemini",
  "aiModel": "gemini-2.0-flash",
  "apiKey": "ai-api-key",
  "systemPrompt": "Kamu adalah CS yang ramah. Jawab dengan singkat dan jelas.",
  "isActive": true,
  "rules": [
    {
      "keywords": "harga,price,cost",
      "matchType": "CONTAINS",
      "response": "Silakan cek halaman pricing kami."
    },
    {
      "keywords": "halo,hi,pagi",
      "matchType": "STARTSWITH",
      "response": "Halo! Ada yang bisa kami bantu?"
    }
  ]
}`} />

              <Endpoint method="POST" path="/v1/auto-responder/:id/rules" title="Add Rule" auth="JWT / API Key" desc="Tambah rule ke auto-responder." body={`{
  "keywords": "order,pesanan",
  "matchType": "CONTAINS",
  "response": "Untuk cek status pesanan, silakan kirim nomor invoice Anda."
}`} />

              <Endpoint method="PUT" path="/v1/auto-responder/:id/rules/:ruleId" title="Update Rule" auth="JWT / API Key" desc="Update rule." />
              <Endpoint method="DELETE" path="/v1/auto-responder/:id/rules/:ruleId" title="Delete Rule" auth="JWT / API Key" desc="Hapus rule." />
              <Endpoint method="DELETE" path="/v1/auto-responder/:id" title="Delete Auto Responder" auth="JWT / API Key" desc="Hapus auto-responder." />
            </div>

            {/* ── WEBHOOKS ── */}
            <div className="pt-8">
              <h2 className="text-2xl font-bold mb-6 border-b border-white/5 pb-4">🔔 Webhooks</h2>

              <Endpoint method="GET" path="/v1/webhooks" title="List Webhooks" auth="JWT / API Key" desc="Daftar webhook." />

              <Endpoint method="POST" path="/v1/webhooks" title="Create Webhook" auth="JWT / API Key" desc="Konfigurasi webhook untuk menerima callback real-time." body={`{
  "deviceId": "uuid-device",
  "url": "https://your-server.com/webhook",
  "secret": "your-webhook-secret"
}`} example={`{
  "success": true,
  "data": {
    "id": "uuid-wh",
    "deviceId": "uuid-device",
    "url": "https://your-server.com/webhook",
    "isActive": true
  }
}`} />

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400">
                <p className="font-bold text-white mb-2">📨 Payload yang dikirim ke webhook Anda:</p>
                <Code code={`{
  "event": "messages.upsert",
  "device": "device-uuid",
  "message": {
    "from": "628123456789@s.whatsapp.net",
    "text": "Halo, ada promo?",
    "timestamp": 1704067200000
  }
}`} lang="json" />
                <p className="text-xs text-gray-600 mt-3">Signature header: <code className="text-brand-400">x-webhook-signature</code> (HMAC-SHA256 dari body)</p>
              </div>
            </div>

            {/* ── API KEYS ── */}
            <div className="pt-8">
              <h2 className="text-2xl font-bold mb-6 border-b border-white/5 pb-4">🔑 API Keys</h2>

              <Endpoint method="GET" path="/v1/api-keys" title="List API Keys" auth="JWT" desc="Daftar API key (hanya user login)." />
              <Endpoint method="POST" path="/v1/api-keys" title="Create API Key" auth="JWT" desc="Generate API key baru." body={`{ "name": "Production Server" }`} />
            </div>

            {/* ── ANALYTICS ── */}
            <div className="pt-8">
              <h2 className="text-2xl font-bold mb-6 border-b border-white/5 pb-4">📊 Analytics</h2>

              <Endpoint method="GET" path="/v1/analytics/blasts" title="Blast Stats" auth="JWT / API Key" desc="Statistik pengiriman blast." example={`{
  "success": true,
  "data": {
    "totalBlasts": 25,
    "totalSent": 1234,
    "totalFailed": 23
  }
}`} />
            </div>

            {/* ── PUBLIC ── */}
            <div className="pt-8">
              <h2 className="text-2xl font-bold mb-6 border-b border-white/5 pb-4">🔓 Public Endpoints</h2>

              <Endpoint method="GET" path="/health" title="Health Check" auth="Public" desc="Cek status server." example={`{
  "status": "ok",
  "timestamp": "2025-01-01T12:00:00.000Z"
}`} />

              <Endpoint method="GET" path="/metrics" title="Prometheus Metrics" auth="Public" desc="Endpoint metrik dalam format Prometheus." />
            </div>

            {/* ── FOOTER NOTE ── */}
            <div className="pt-12 border-t border-white/5 mt-12">
              <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-500/10 to-emerald-500/10 border border-brand-500/20 text-center space-y-4">
                <h3 className="text-xl font-bold">Siap mencoba API?</h3>
                <p className="text-sm text-gray-400 max-w-lg mx-auto">Daftar gratis, dapatkan API Key, dan mulai kirim pesan WhatsApp dalam hitungan menit.</p>
                <div className="flex justify-center gap-4">
                  <Link href="/register" className="px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full text-sm font-bold text-white hover:scale-105 transition-all shadow-lg shadow-brand-500/20">Get Started Free</Link>
                  <Link href="/docs" className="px-6 py-3 bg-white/5 border border-white/20 rounded-full text-sm font-bold text-white hover:bg-white/10 transition-all">📖 Read Dev Guide</Link>
                </div>
              </div>
            </div>

          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/30 backdrop-blur-md">
        <div className="container mx-auto px-6 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-600">
          <div>© {new Date().getFullYear()} Whatsappin. All rights reserved.</div>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
