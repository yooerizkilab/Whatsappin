'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null!);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    obs.observe(el); return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [ref, inView] = useInView(0.1);
  return (
    <div ref={ref} className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function CodeBlock({ code, lang = 'bash' }: { code: string; lang?: string }) {
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

const sidebarSections = [
  { title: 'Overview', items: [
    { id: 'what-is', label: 'What is Whatsappin?' },
    { id: 'features', label: 'Platform Features' },
  ]},
  { title: 'Getting Started', items: [
    { id: 'quickstart', label: 'Quickstart Guide' },
    { id: 'authentication', label: 'Authentication' },
    { id: 'devices', label: 'Device Management' },
  ]},
  { title: 'Core Features', items: [
    { id: 'send-message', label: 'Send Message' },
    { id: 'blast-campaign', label: 'Blast Campaign' },
    { id: 'auto-responder', label: 'AI Auto-Responder' },
    { id: 'webhooks', label: 'Webhooks' },
    { id: 'templates', label: 'Templates' },
    { id: 'contacts', label: 'Contacts & Groups' },
  ]},
  { title: 'API Reference', items: [
    { id: 'endpoints', label: 'All Endpoints' },
    { id: 'errors', label: 'Error Codes' },
    { id: 'rate-limits', label: 'Rate Limits' },
  ]},
  { title: 'Deployment', items: [
    { id: 'docker', label: 'Docker Deployment' },
    { id: 'env', label: 'Environment Variables' },
    { id: 'monitoring', label: 'Monitoring' },
  ]},
];

export default function DocsPage() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-brand-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tighter">
              <div className="w-7 h-7 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
                <span className="text-white text-sm">W</span>
              </div>
              Whatsappin
            </Link>
            <span className="text-xs text-gray-600 font-mono border border-white/10 rounded-full px-3 py-0.5">v1.0</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/api" className="hidden sm:inline text-sm font-medium text-gray-400 hover:text-white transition-colors">API Reference</Link>
            <Link href="/login" className="hidden sm:inline text-sm font-medium text-gray-400 hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="px-4 py-2 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-500/20">Get Started</Link>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="lg:hidden p-2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenu ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} /></svg>
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 pt-24 pb-20">
        <div className="flex gap-12 relative">

          {/* Sidebar */}
          <aside className={`${mobileMenu ? 'block' : 'hidden'} lg:block w-[260px] shrink-0`}>
            <div className="sticky top-24 space-y-8 overflow-y-auto max-h-[calc(100vh-120px)] pr-2">
              {sidebarSections.map(s => (
                <div key={s.title}>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-3">{s.title}</h4>
                  <ul className="space-y-1.5">
                    {s.items.map(i => (
                      <li key={i.id}>
                        <a href={`#${i.id}`} onClick={() => setMobileMenu(false)}
                          className="block px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                          {i.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="pt-4 border-t border-white/5 space-y-3">
                <Link href="/api" className="block text-sm font-bold text-brand-400 hover:text-brand-300 transition-colors">📘 API Reference →</Link>
                <a href="mailto:support@whatsappin.com" className="block text-sm text-gray-500 hover:text-white transition-colors">✉️ Contact Support</a>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 max-w-4xl min-w-0 space-y-24">

            {/* ── TITLE ── */}
            <FadeIn>
              <section className="space-y-4 pt-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[10px] font-bold uppercase tracking-widest">Documentation</div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Welcome to Whatsappin</h1>
                <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
                  Platform WhatsApp Gateway API yang memungkinkan Anda mengirim dan menerima pesan WhatsApp secara terprogram.
                  Dilengkapi AI Auto-Responder, Mass Blast Campaign, Webhooks, dan fitur enterprise lainnya.
                </p>
              </section>
            </FadeIn>

            {/* ── WHAT IS ── */}
            <section id="what-is" className="space-y-6 scroll-mt-24">
              <FadeIn>
                <h2 className="text-3xl font-bold tracking-tight">What is Whatsappin?</h2>
                <p className="text-gray-400 leading-relaxed">
                  Whatsappin adalah platform SaaS (Software as a Service) yang menyediakan gateway untuk mengintegrasikan
                  WhatsApp dengan aplikasi bisnis Anda. Dengan API yang sederhana namun powerful, Anda dapat:
                </p>
                <div className="grid sm:grid-cols-2 gap-4 mt-6">
                  {[
                    { icon: '💬', title: 'Send & Receive Messages', desc: 'Kirim dan terima pesan WhatsApp secara terprogram via REST API.' },
                    { icon: '👥', title: 'Bulk Broadcast', desc: 'Kirim pesan massal ke ribuan kontak dengan antrean cerdas.' },
                    { icon: '🤖', title: 'AI Automation', desc: 'Otomatiskan balasan dengan AI dari Gemini, OpenAI, atau Claude.' },
                    { icon: '🔔', title: 'Real-time Webhooks', desc: 'Dapatkan notifikasi instan untuk setiap pesan masuk dan event.' },
                    { icon: '📱', title: 'Multi-Device', desc: 'Hubungkan banyak nomor WhatsApp dalam satu dashboard.' },
                    { icon: '📊', title: 'Analytics', desc: 'Pantau kinerja pengiriman dan aktivitas secara real-time.' },
                  ].map(f => (
                    <div key={f.title} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                      <div className="text-2xl mb-2">{f.icon}</div>
                      <h4 className="font-bold text-sm mb-1">{f.title}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </section>

            {/* ── FEATURES ── */}
            <section id="features" className="space-y-6 scroll-mt-24">
              <FadeIn>
                <h2 className="text-3xl font-bold tracking-tight">✨ Platform Features</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { icon: '🔌', title: 'RESTful API', desc: 'API lengkap untuk mengirim pesan, mengelola device, kontak, dan template. Dokumentasi interaktif dengan example di berbagai bahasa.' },
                    { icon: '🤖', title: 'AI Auto-Responder', desc: 'Konfigurasikan aturan keyword atau gunakan AI (Gemini, OpenAI, Claude) untuk membalas pesan secara otomatis 24/7.' },
                    { icon: '📢', title: 'Mass Blast Campaign', desc: 'Kirim pesan ke ribuan kontak dengan template dinamis. Dukung penjadwalan dan pengelompokan kontak berdasarkan grup atau tag.' },
                    { icon: '📱', title: 'Multi-Device', desc: 'Hubungkan hingga 10+ nomor WhatsApp dalam satu akun. Setiap device memiliki session terpisah dan bisa dikelola independen.' },
                    { icon: '🔔', title: 'Webhooks', desc: 'Terima callback HTTP untuk event pesan masuk, status terkirim, dan lainnya. Integrasi mudah dengan sistem existing Anda.' },
                    { icon: '🗂️', title: 'Contact Management', desc: 'Import CSV, grup kontak, tagging, dan metadata custom. Kelola ribuan kontak dengan organisasi yang rapi.' },
                    { icon: '📝', title: 'Message Templates', desc: 'Buat template pesan dengan variabel dinamis {{name}}, {{link}}, dll. Kolaborasi tim dengan template library.' },
                    { icon: '⏰', title: 'Schedule & Working Hours', desc: 'Atur jam operasional dan jadwal pengiriman. Kirim pesan otomatis hanya di jam kerja yang ditentukan.' },
                    { icon: '📊', title: 'Analytics Dashboard', desc: 'Pantau sent count, failed rate, aktivitas device, dan tren pengiriman dalam grafik real-time.' },
                    { icon: '🔑', title: 'API Key Management', desc: 'Buat multiple API keys dengan scope berbeda. Rotasi key tanpa downtime untuk keamanan maksimal.' },
                    { icon: '👥', title: 'Team Management', desc: 'Multi-level user: Admin, Agent, dan custom roles. Cocok untuk tim customer service dan marketing.' },
                    { icon: '💳', title: 'Subscription Billing', desc: 'Terintegrasi dengan Midtrans. Multiple plan dengan limit device dan kuota pesan yang berbeda.' },
                  ].map(f => (
                    <div key={f.title} className="p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-all">
                      <div className="text-2xl mb-3">{f.icon}</div>
                      <h4 className="font-bold text-sm mb-1.5">{f.title}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </section>

            {/* ── QUICKSTART ── */}
            <section id="quickstart" className="space-y-6 scroll-mt-24">
              <FadeIn>
                <h2 className="text-3xl font-bold tracking-tight">⚡ Quickstart Guide</h2>
                <p className="text-gray-400 leading-relaxed">Mulai kirim pesan WhatsApp dalam 5 menit:</p>

                <div className="space-y-8">
                  {[
                    { num: '1', title: 'Buat Akun', desc: 'Daftar di /register, verifikasi email, dan login ke dashboard.', code: '→ Kunjungi https://yourdomain.com/register' },
                    { num: '2', title: 'Hubungkan Device', desc: 'Buat device baru, scan QR code dengan WhatsApp di HP Anda.', code: 'POST /v1/devices\nBody: { "name": "Marketing Phone" }\n→ Scan QR dari dashboard → device CONNECTED' },
                    { num: '3', title: 'Dapatkan API Key', desc: 'Buat API Key dari menu Settings → API Keys.', code: 'GET /v1/api-keys\nHeaders: Authorization: Bearer <your-jwt-token>\n→ Simpan API Key yang di-generate.' },
                    { num: '4', title: 'Kirim Pesan Pertama', desc: 'Gunakan API Key untuk mengirim pesan WhatsApp.', code: `curl -X POST https://yourdomain.com/v1/messages/send \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: your-api-key" \\
  -d '{
    "deviceId": "device-uuid",
    "to": "628123456789",
    "content": "Halo! Ini pesan pertama saya dari Whatsappin 🎉"
  }'` },
                  ].map(s => (
                    <div key={s.num} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-sm font-bold text-brand-400 shrink-0 mt-1">{s.num}</div>
                      <div className="space-y-2 flex-1">
                        <h4 className="font-bold">{s.title}</h4>
                        <p className="text-sm text-gray-400">{s.desc}</p>
                        <CodeBlock code={s.code} lang="bash" />
                      </div>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </section>

            {/* ── AUTHENTICATION ── */}
            <section id="authentication" className="space-y-6 scroll-mt-24">
              <FadeIn>
                <h2 className="text-3xl font-bold tracking-tight">🔑 Authentication</h2>
                <p className="text-gray-400 leading-relaxed">Whatsappin mendukung dua metode autentikasi:</p>

                <div className="space-y-8">
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center text-lg">🔐</div>
                      <div><h4 className="font-bold">JWT Token (Dashboard)</h4><p className="text-xs text-gray-500">Digunakan oleh frontend dashboard untuk login user.</p></div>
                    </div>
                    <CodeBlock code={`// Login
POST /v1/auth/login
Body: { "email": "user@example.com", "password": "..." }
→ Response: { "data": { "token": "eyJhbGciOiJIUzI1NiIs..." } }

// Gunakan di header
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...`} lang="http" />
                  </div>

                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-lg">🔑</div>
                      <div><h4 className="font-bold">API Key (Server-to-Server)</h4><p className="text-xs text-gray-500">Rekomendasi untuk integrasi backend.</p></div>
                    </div>
                    <CodeBlock code={`// Set API Key di header
x-api-key: your-secret-api-key

// Contoh dengan axios
const api = axios.create({
  baseURL: "https://yourdomain.com/v1",
  headers: { "x-api-key": "sk_abc123..." }
});

// Semua endpoint bisa diakses tanpa JWT
const res = await api.post("/messages/send", { ... });`} lang="javascript" />
                    <p className="text-xs text-gray-600 mt-4">💡 API Key bisa dibuat dan di-revoke kapan saja dari halaman Settings → API Keys.</p>
                  </div>
                </div>
              </FadeIn>
            </section>

            {/* ── DEVICE ── */}
            <section id="devices" className="space-y-6 scroll-mt-24">
              <FadeIn>
                <h2 className="text-3xl font-bold tracking-tight">📱 Device Management</h2>
                <p className="text-gray-400 leading-relaxed">Setiap nomor WhatsApp yang terhubung disebut "Device". Berikut cara mengelolanya:</p>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold mb-3">Device States</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { state: 'QR_REQUIRED', desc: 'Menunggu scan QR' },
                        { state: 'CONNECTING', desc: 'Sedang menghubungkan' },
                        { state: 'CONNECTED', desc: 'Siap digunakan ✅' },
                        { state: 'DISCONNECTED', desc: 'Koneksi terputus' },
                      ].map(d => (
                        <div key={d.state} className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                          <div className="text-[10px] font-mono text-gray-500 mb-1">{d.state}</div>
                          <div className="text-xs text-gray-400">{d.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold mb-3">Device API</h4>
                    <CodeBlock code={`// List all devices
GET /v1/devices

// Create & connect new device
POST /v1/devices
Body: { "name": "Marketing Phone" }

// Get device status
GET /v1/devices/:id/status

// Remove device
DELETE /v1/devices/:id`} lang="http" />
                  </div>
                </div>
              </FadeIn>
            </section>

            {/* ── SEND MESSAGE ── */}
            <section id="send-message" className="space-y-6 scroll-mt-24">
              <FadeIn>
                <h2 className="text-3xl font-bold tracking-tight">💬 Send Message</h2>
                <p className="text-gray-400 leading-relaxed">Kirim pesan teks, gambar, atau dokumen ke nomor WhatsApp.</p>

                <div className="space-y-8">
                  <div>
                    <h4 className="font-bold text-sm mb-3">Send Text Message</h4>
                    <CodeBlock code={`POST /v1/messages/send
Headers: Content-Type: application/json
        x-api-key: your-api-key

Body:
{
  "deviceId": "uuid-device-id",
  "to": "628123456789",
  "type": "TEXT",
  "content": "Halo {{name}}! Ini pesan otomatis."
}

Response:
{
  "success": true,
  "data": {
    "id": "msg-uuid",
    "status": "SENT",
    "sentAt": "2025-01-01T12:00:00Z"
  }
}`} lang="http" />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-sm mb-3">Send Image</h4>
                      <CodeBlock code={`POST /v1/messages/send
{
  "deviceId": "uuid",
  "to": "628123456789",
  "type": "IMAGE",
  "content": "Optional caption",
  "mediaUrl": "https://example.com/image.jpg"
}`} lang="json" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm mb-3">Send Document</h4>
                      <CodeBlock code={`POST /v1/messages/send
{
  "deviceId": "uuid",
  "to": "628123456789",
  "type": "DOCUMENT",
  "content": "Document description",
  "mediaUrl": "https://example.com/file.pdf"
}`} lang="json" />
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-brand-500/5 border border-brand-500/20">
                    <h4 className="font-bold text-sm text-brand-400 mb-2">📌 Phone Number Format</h4>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• Gunakan format internasional tanpa tanda +</li>
                      <li>• Contoh: <code className="text-brand-400">628123456789</code> (Indonesia)</li>
                      <li>• Sistem akan otomatis menambahkan <code className="text-gray-500">@s.whatsapp.net</code></li>
                    </ul>
                  </div>
                </div>
              </FadeIn>
            </section>

            {/* ── BLAST ── */}
            <section id="blast-campaign" className="space-y-6 scroll-mt-24">
              <FadeIn>
                <h2 className="text-3xl font-bold tracking-tight">📢 Blast Campaign</h2>
                <p className="text-gray-400 leading-relaxed">Kirim pesan massal ke ribuan kontak dengan template dinamis.</p>

                <div className="space-y-6">
                  <CodeBlock code={`POST /v1/messages/blast
Headers: Content-Type: application/json
        x-api-key: your-api-key

Body:
{
  "deviceId": "uuid-device",
  "name": "Promo Ramadan 2025",
  "message": "Halo {{name}}! Dapatkan promo spesial kami: {{link}}",
  "groupId": "uuid-group",       // atau kosongkan untuk semua kontak
  "templateId": "uuid-template", // optional
  "type": "TEXT",
  "scheduledAt": "2025-03-01T09:00:00Z" // optional
}

Response:
{
  "success": true,
  "data": {
    "jobId": "uuid-job",
    "sent": 145,
    "failed": 2
  }
}`} lang="http" />

                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <h4 className="font-bold text-sm mb-3">Available Template Variables</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { var: '{{name}}', desc: 'Contact name' },
                        { var: '{{phone}}', desc: 'Phone number' },
                        { var: '{{email}}', desc: 'Email address' },
                        { var: '{{link}}', desc: 'Custom link (CSV)' },
                      ].map(v => (
                        <div key={v.var} className="p-2 rounded-lg bg-black/50 border border-white/5 text-center">
                          <code className="text-brand-400 text-xs">{v.var}</code>
                          <div className="text-[10px] text-gray-600 mt-0.5">{v.desc}</div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-4">💡 Kolom tambahan dari CSV (seperti <code className="text-brand-400">link</code>, <code className="text-brand-400">address</code>) otomatis tersedia sebagai variabel.</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                    <h4 className="font-bold text-sm text-amber-400 mb-2">⚠️ Blast Best Practices</h4>
                    <ul className="text-sm text-gray-400 space-y-1.5">
                      <li>• Selalu gunakan <strong>delay 3-6 detik</strong> antar pesan (WA rate limit)</li>
                      <li>• Batasi maksimal <strong>200 pesan per session</strong> untuk keamanan akun</li>
                      <li>• Gunakan <strong>kontak yang sudah melakukan opt-in</strong></li>
                      <li>• Jadwalkan blast di <strong>jam kerja</strong> untuk delivery ratio optimal</li>
                    </ul>
                  </div>
                </div>
              </FadeIn>
            </section>

            {/* ── AUTO RESPONDER ── */}
            <section id="auto-responder" className="space-y-6 scroll-mt-24">
              <FadeIn>
                <h2 className="text-3xl font-bold tracking-tight">🤖 AI Auto-Responder</h2>
                <p className="text-gray-400 leading-relaxed">Otomatiskan balasan pesan dengan keyword rules atau AI cerdas.</p>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-sm mb-3">Match Types</h4>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {[
                        { type: 'EXACT', desc: 'Cocok persis' },
                        { type: 'CONTAINS', desc: 'Mengandung kata' },
                        { type: 'STARTSWITH', desc: 'Diawali dengan' },
                        { type: 'REGEX', desc: 'Regular expression' },
                      ].map(t => (
                        <div key={t.type} className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                          <div className="text-[10px] font-mono text-brand-400 mb-1">{t.type}</div>
                          <div className="text-xs text-gray-500">{t.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm mb-3">Configuration API</h4>
                    <CodeBlock code={`// List auto-responders
GET /v1/auto-responder

// Create auto-responder
POST /v1/auto-responder
Body: {
  "deviceId": "uuid",
  "name": "Customer Support",
  "aiProvider": "gemini",        // gemini | openai | anthropic
  "aiModel": "gemini-2.0-flash",
  "apiKey": "ai-api-key",
  "systemPrompt": "Kamu adalah CS yang ramah...",
  "rules": [
    {
      "keywords": "harga,price,cost",
      "matchType": "CONTAINS",
      "response": "Untuk info harga silakan kunjungi halaman pricing kami."
    }
  ]
}`} lang="http" />
                  </div>

                  <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-brand-500/10 border border-emerald-500/20">
                    <h4 className="font-bold text-sm text-emerald-400 mb-2">🤖 AI Provider Support</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      {[
                        { name: 'Gemini', prov: 'Google' },
                        { name: 'OpenAI', prov: 'ChatGPT' },
                        { name: 'Claude', prov: 'Anthropic' },
                      ].map(p => (
                        <div key={p.name} className="p-3 rounded-xl bg-white/5">
                          <div className="font-bold text-sm">{p.name}</div>
                          <div className="text-[10px] text-gray-600">{p.prov}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <h4 className="font-bold text-sm mb-2">🌐 Knowledge Base Integration</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">AI Auto-Responder bisa dilengkapi dengan Knowledge Base — sistem RAG (Retrieval-Augmented Generation) yang memungkinkan AI menjawab berdasarkan dokumen, URL, atau teks yang Anda unggah. Cocok untuk FAQ otomatis berdasarkan konten website atau dokumen internal.</p>
                  </div>
                </div>
              </FadeIn>
            </section>

            {/* ── WEBHOOKS ── */}
            <section id="webhooks" className="space-y-6 scroll-mt-24">
              <FadeIn>
                <h2 className="text-3xl font-bold tracking-tight">🔔 Webhooks</h2>
                <p className="text-gray-400 leading-relaxed">Dapatkan notifikasi real-time untuk setiap event di akun Anda.</p>

                <CodeBlock code={`// Configure webhook
POST /v1/webhooks
Body: {
  "deviceId": "uuid",
  "url": "https://your-server.com/webhook",
  "secret": "your-webhook-secret"  // optional, untuk signature
}

// Your server receives:
POST /webhook
Headers: x-webhook-signature: <hmac-sha256>

{
  "event": "messages.upsert",
  "device": "device-uuid",
  "message": {
    "from": "628123456789@s.whatsapp.net",
    "text": "Halo, ada promo?",
    "timestamp": 1704067200000
  }
}`} lang="http" />

                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { event: 'messages.upsert', desc: 'Pesan baru masuk' },
                    { event: 'message.status', desc: 'Status pesan berubah' },
                    { event: 'device.status', desc: 'Device connect/disconnect' },
                  ].map(e => (
                    <div key={e.event} className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                      <div className="text-[10px] font-mono text-brand-400 mb-1">{e.event}</div>
                      <div className="text-xs text-gray-500">{e.desc}</div>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </section>

            {/* ── TEMPLATES ── */}
            <section id="templates" className="space-y-6 scroll-mt-24">
              <FadeIn>
                <h2 className="text-3xl font-bold tracking-tight">📝 Templates</h2>
                <p className="text-gray-400 leading-relaxed">Buat dan kelola template pesan dengan variabel dinamis.</p>

                <CodeBlock code={`// Create template
POST /v1/templates
Body: {
  "name": "Welcome Message",
  "content": "Halo {{name}}! Terima kasih telah mendaftar. Kunjungi website kami: {{link}}",
  "variables": ["name", "link"]
}

// List templates
GET /v1/templates

// Update template
PUT /v1/templates/:id

// Delete template
DELETE /v1/templates/:id`} lang="http" />
              </FadeIn>
            </section>

            {/* ── CONTACTS ── */}
            <section id="contacts" className="space-y-6 scroll-mt-24">
              <FadeIn>
                <h2 className="text-3xl font-bold tracking-tight">👥 Contacts & Groups</h2>
                <p className="text-gray-400 leading-relaxed">Kelola ribuan kontak dengan grup, tag, dan metadata custom.</p>

                <CodeBlock code={`// List contacts (with filter)
GET /v1/contacts?groupId=uuid&tagId=uuid

// Create contact
POST /v1/contacts
Body: {
  "name": "John Doe",
  "phone": "628123456789",
  "email": "john@example.com",
  "groupId": "uuid-group",
  "tagIds": ["uuid-tag-1", "uuid-tag-2"]
}

// Import from CSV
POST /v1/contacts/import
Content-Type: multipart/form-data
File: contacts.csv (name, phone, email, link, group)

// Groups
GET /v1/contacts/groups
POST /v1/contacts/groups  { "name": "VIP Customers" }
DELETE /v1/contacts/groups/:id`} lang="http" />

                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <h4 className="font-bold text-sm mb-2">📄 CSV Format</h4>
                  <CodeBlock code={`name,phone,email,link,group
John Doe,628123456789,john@email.com,https://invite.example.com/john,Invitation
Jane Smith,628987654321,jane@email.com,,Customers`} lang="csv" />
                  <p className="text-xs text-gray-600 mt-3">💡 Kolom <code className="text-brand-400">link</code>, <code className="text-brand-400">group</code>, dan kolom lain otomatis menjadi <code className="text-brand-400">{'{{var}}'}</code> di template blast.</p>
                </div>
              </FadeIn>
            </section>

            {/* ── ENDPOINTS ── */}
            <section id="endpoints" className="space-y-6 scroll-mt-24">
              <FadeIn>
                <h2 className="text-3xl font-bold tracking-tight">📋 All API Endpoints</h2>
                <p className="text-gray-400 leading-relaxed">Ringkasan seluruh endpoint yang tersedia di platform Whatsappin.</p>

                <div className="overflow-x-auto rounded-2xl border border-white/10">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white/5 text-left text-gray-500 text-[10px] uppercase tracking-wider">
                        <th className="p-4 font-bold">Method</th>
                        <th className="p-4 font-bold">Endpoint</th>
                        <th className="p-4 font-bold">Description</th>
                        <th className="p-4 font-bold hidden md:table-cell">Auth</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {[
                        ['POST', '/v1/auth/login', 'User login', 'Public'],
                        ['POST', '/v1/auth/register', 'User register', 'Public'],
                        ['GET', '/v1/devices', 'List devices', 'JWT / API Key'],
                        ['POST', '/v1/devices', 'Create device', 'JWT / API Key'],
                        ['DELETE', '/v1/devices/:id', 'Remove device', 'JWT / API Key'],
                        ['POST', '/v1/messages/send', 'Send message', 'JWT / API Key'],
                        ['GET', '/v1/messages/logs', 'Message logs', 'JWT / API Key'],
                        ['POST', '/v1/messages/blast', 'Create blast', 'JWT / API Key'],
                        ['GET', '/v1/messages/blast', 'List blast jobs', 'JWT / API Key'],
                        ['DELETE', '/v1/messages/blast/:id', 'Delete blast job', 'JWT / API Key'],
                        ['GET', '/v1/contacts', 'List contacts', 'JWT / API Key'],
                        ['POST', '/v1/contacts', 'Create contact', 'JWT / API Key'],
                        ['POST', '/v1/contacts/import', 'Import CSV', 'JWT / API Key'],
                        ['GET', '/v1/contacts/groups', 'List groups', 'JWT / API Key'],
                        ['POST', '/v1/contacts/groups', 'Create group', 'JWT / API Key'],
                        ['DELETE', '/v1/contacts/groups/:id', 'Delete group', 'JWT / API Key'],
                        ['GET', '/v1/templates', 'List templates', 'JWT / API Key'],
                        ['POST', '/v1/templates', 'Create template', 'JWT / API Key'],
                        ['GET', '/v1/auto-responder', 'List auto-responders', 'JWT / API Key'],
                        ['POST', '/v1/auto-responder', 'Create auto-responder', 'JWT / API Key'],
                        ['GET', '/v1/webhooks', 'List webhooks', 'JWT / API Key'],
                        ['POST', '/v1/webhooks', 'Configure webhook', 'JWT / API Key'],
                        ['GET', '/v1/analytics/blasts', 'Blast analytics', 'JWT / API Key'],
                        ['GET', '/v1/api-keys', 'List API keys', 'JWT'],
                        ['POST', '/v1/api-keys', 'Create API key', 'JWT'],
                        ['GET', '/v1/chats', 'Chat history', 'JWT / API Key'],
                        ['GET', '/v1/agents', 'Team agents', 'JWT'],
                        ['GET', '/v1/knowledge', 'Knowledge bases', 'JWT / API Key'],
                        ['GET', '/health', 'Server health', 'Public'],
                        ['GET', '/metrics', 'Prometheus metrics', 'Public'],
                      ].map(([method, path, desc, auth]) => (
                        <tr key={path as string} className="hover:bg-white/5 transition-colors">
                          <td className="p-4"><span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            method === 'GET' ? 'text-emerald-400 bg-emerald-500/10' :
                            method === 'POST' ? 'text-blue-400 bg-blue-500/10' :
                            method === 'DELETE' ? 'text-red-400 bg-red-500/10' :
                            method === 'PUT' ? 'text-amber-400 bg-amber-500/10' : ''
                          }`}>{method}</span></td>
                          <td className="p-4 font-mono text-xs text-gray-300">{path}</td>
                          <td className="p-4 text-gray-400">{desc}</td>
                          <td className="p-4 hidden md:table-cell"><span className="text-[10px] text-gray-600">{auth}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-5 rounded-2xl bg-brand-500/5 border border-brand-500/20 text-center">
                  <p className="text-sm text-gray-400 mb-3">Dokumentasi API interaktif dengan request builder.</p>
                  <Link href="/api" className="inline-block px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full text-sm font-bold text-white hover:scale-105 transition-all shadow-lg shadow-brand-500/20">
                    📘 Open API Reference →
                  </Link>
                </div>
              </FadeIn>
            </section>

            {/* ── ERRORS ── */}
            <section id="errors" className="space-y-6 scroll-mt-24">
              <FadeIn>
                <h2 className="text-3xl font-bold tracking-tight">❌ Error Codes</h2>
                <p className="text-gray-400 leading-relaxed">Semua API mengembalikan format error standar.</p>

                <div className="overflow-x-auto rounded-2xl border border-white/10">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white/5 text-left text-gray-500 text-[10px] uppercase tracking-wider">
                        <th className="p-4 font-bold">Code</th>
                        <th className="p-4 font-bold">HTTP Status</th>
                        <th className="p-4 font-bold">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {[
                        ['P6001', '500', 'Database connection error'],
                        ['UNAUTHORIZED', '401', 'Invalid JWT or API Key'],
                        ['FORBIDDEN', '403', 'Insufficient permissions'],
                        ['NOT_FOUND', '404', 'Resource not found'],
                        ['RATE_LIMIT', '429', 'Too many requests'],
                        ['DEVICE_OFFLINE', '400', 'Device is not connected'],
                        ['INVALID_PHONE', '400', 'Invalid phone number format'],
                        ['QUOTA_EXCEEDED', '400', 'Monthly message limit reached'],
                        ['BLAST_EMPTY', '400', 'No contacts found for blast'],
                      ].map(([code, status, desc]) => (
                        <tr key={code} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-mono text-xs text-red-400">{code}</td>
                          <td className="p-4"><span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-400">{status}</span></td>
                          <td className="p-4 text-gray-400">{desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-sm text-gray-500">Response format:</p>
                <CodeBlock code={`{
  "success": false,
  "message": "Device abc-123 is not connected",
  "error": "DEVICE_OFFLINE"
}`} lang="json" />
              </FadeIn>
            </section>

            {/* ── RATE LIMITS ── */}
            <section id="rate-limits" className="space-y-6 scroll-mt-24">
              <FadeIn>
                <h2 className="text-3xl font-bold tracking-tight">⏱️ Rate Limits</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-3xl font-black text-brand-400 mb-2">100</div>
                    <div className="text-sm font-medium mb-1">Requests per minute</div>
                    <p className="text-xs text-gray-500">Default limit per API Key. Bisa ditingkatkan untuk enterprise plan.</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-3xl font-black text-emerald-400 mb-2">3-6s</div>
                    <div className="text-sm font-medium mb-1">Message delay</div>
                    <p className="text-xs text-gray-500">Interval antar pesan blast untuk mencegah rate limiting dari WhatsApp.</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">Rate limit headers disertakan di setiap response:</p>
                <CodeBlock code={`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1704067500`} lang="http" />
              </FadeIn>
            </section>

            {/* ── DOCKER ── */}
            <section id="docker" className="space-y-6 scroll-mt-24">
              <FadeIn>
                <h2 className="text-3xl font-bold tracking-tight">🐳 Docker Deployment</h2>
                <p className="text-gray-400 leading-relaxed">Deploy Whatsappin di VPS Anda dengan Docker Compose.</p>

                <CodeBlock code={`# Clone repository
git clone https://github.com/your-repo/whatsapp-gateway.git
cd whatsapp-gateway/Infrastruktur

# Setup environment
cp env/.env.backend .env
nano .env  # isi DB_ROOT_PASSWORD, JWT_SECRET, REDIS_PASSWORD, dll

# Start all services (with Nginx reverse proxy)
docker compose -f docker-compose.prod.yml up -d --build

# Check status
docker compose ps

# View logs
docker compose logs -f backend`} lang="bash" />

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <h4 className="font-bold text-sm mb-2">Services</h4>
                    <ul className="text-xs text-gray-500 space-y-1.5">
                      <li>• <strong className="text-gray-300">Nginx</strong> — Reverse proxy (port 80/443)</li>
                      <li>• <strong className="text-gray-300">Backend</strong> — API server (Fastify)</li>
                      <li>• <strong className="text-gray-300">Frontend</strong> — Next.js app</li>
                      <li>• <strong className="text-gray-300">MySQL</strong> — Database</li>
                      <li>• <strong className="text-gray-300">Redis</strong> — Queue & cache</li>
                      <li>• <strong className="text-gray-300">Prometheus</strong> — Metrics</li>
                      <li>• <strong className="text-gray-300">Grafana</strong> — Dashboard</li>
                    </ul>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <h4 className="font-bold text-sm mb-2">Requirements</h4>
                    <ul className="text-xs text-gray-500 space-y-1.5">
                      <li>• Docker & Docker Compose</li>
                      <li>• VPS 2GB+ RAM, 20GB+ storage</li>
                      <li>• Domain (optional, untuk SSL)</li>
                      <li>• Port 80/443 terbuka</li>
                    </ul>
                  </div>
                </div>
              </FadeIn>
            </section>

            {/* ── ENV ── */}
            <section id="env" className="space-y-6 scroll-mt-24">
              <FadeIn>
                <h2 className="text-3xl font-bold tracking-tight">🔧 Environment Variables</h2>
                <p className="text-gray-400 leading-relaxed">Konfigurasi utama yang perlu di-set sebelum menjalankan aplikasi.</p>

                <div className="overflow-x-auto rounded-2xl border border-white/10">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white/5 text-left text-gray-500 text-[10px] uppercase tracking-wider">
                        <th className="p-4 font-bold">Variable</th>
                        <th className="p-4 font-bold">Required</th>
                        <th className="p-4 font-bold">Default</th>
                        <th className="p-4 font-bold hidden md:table-cell">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {[
                        ['DATABASE_URL', '✅', '-', 'MySQL connection string'],
                        ['JWT_SECRET', '✅', '-', 'Secret for JWT signing'],
                        ['REDIS_HOST', '✅', '127.0.0.1', 'Redis server host'],
                        ['REDIS_PASSWORD', 'optional', '-', 'Redis password'],
                        ['FRONTEND_URL', '✅', 'http://localhost:3000', 'Frontend URL for CORS'],
                        ['PORT', '', '3001', 'Backend port'],
                        ['MESSAGE_DELAY_MS', '', '3000', 'Delay between messages'],
                        ['MIDTRANS_SERVER_KEY', 'optional', '-', 'Midtrans payment key'],
                        ['OPENAI_API_KEY', 'optional', '-', 'OpenAI API key'],
                        ['GEMINI_API_KEY', 'optional', '-', 'Gemini API key'],
                        ['ANTHROPIC_API_KEY', 'optional', '-', 'Anthropic API key'],
                        ['AWS_S3_BUCKET', 'optional', '-', 'S3 sessions storage'],
                      ].map(([varName, required, def, desc]) => (
                        <tr key={varName} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-mono text-xs text-brand-400">{varName}</td>
                          <td className="p-4"><span className={`text-[10px] px-2 py-0.5 rounded-full ${required === '✅' ? 'bg-red-500/10 text-red-400' : 'bg-gray-500/10 text-gray-500'}`}>{required}</span></td>
                          <td className="p-4 text-xs text-gray-600">{def || '—'}</td>
                          <td className="p-4 text-gray-400 text-xs hidden md:table-cell">{desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </FadeIn>
            </section>

            {/* ── MONITORING ── */}
            <section id="monitoring" className="space-y-6 scroll-mt-24">
              <FadeIn>
                <h2 className="text-3xl font-bold tracking-tight">📊 Monitoring</h2>
                <p className="text-gray-400 leading-relaxed">Whatsappin dilengkapi dengan stack monitoring Prometheus + Grafana untuk memantau performa sistem.</p>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-2xl mb-3">📈</div>
                    <h4 className="font-bold mb-2">Prometheus Metrics</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">Backend mengekspos endpoint <code className="text-brand-400">/metrics</code> dengan metrik Fastify request count, duration, dan custom metrics untuk pengiriman pesan.</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-2xl mb-3">📉</div>
                    <h4 className="font-bold mb-2">Grafana Dashboard</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">Visualisasi metrik dengan dashboard yang sudah diprekonfigurasi. Akses di port <code className="text-brand-400">3002</code> (default: admin/admin).</p>
                  </div>
                </div>
              </FadeIn>
            </section>

          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/30 backdrop-blur-md">
        <div className="container mx-auto px-6 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-600">
          <div>© {new Date().getFullYear()} Whatsappin. All rights reserved.</div>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/api" className="hover:text-white transition-colors">API</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <a href="mailto:support@whatsappin.com" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
