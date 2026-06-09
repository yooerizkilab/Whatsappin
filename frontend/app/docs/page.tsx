'use client';

import { useState } from 'react';
import Link from 'next/link';

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
  { title: 'Pendahuluan', items: [
    { id: 'tentang', label: 'Tentang Whatsappin' },
    { id: 'fitur', label: 'Fitur Platform' },
    { id: 'arsitektur', label: 'Arsitektur Sistem' },
  ]},
  { title: 'Panduan Setup', items: [
    { id: 'prasyarat', label: 'Prasyarat' },
    { id: 'instalasi', label: 'Instalasi Lokal' },
    { id: 'docker', label: 'Deploy dengan Docker' },
    { id: 'env', label: 'Konfigurasi Environment' },
  ]},
  { title: 'Panduan Fitur', items: [
    { id: 'device', label: 'Device WhatsApp' },
    { id: 'pesan', label: 'Kirim Pesan' },
    { id: 'blast', label: 'Blast Campaign' },
    { id: 'autoresponder', label: 'AI Auto-Responder' },
    { id: 'webhook', label: 'Webhook' },
    { id: 'kontak', label: 'Kontak & Grup' },
    { id: 'template', label: 'Template Pesan' },
  ]},
  { title: 'Operasional', items: [
    { id: 'monitoring', label: 'Monitoring' },
    { id: 'backup', label: 'Backup & Restore' },
    { id: 'troubleshooting', label: 'Troubleshooting' },
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
              <div className="w-7 h-7 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20"><span className="text-white text-sm">W</span></div>
              Whatsappin
            </Link>
            <span className="text-xs text-gray-600 font-mono border border-white/10 rounded-full px-3 py-0.5">Dev Guide</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/api" className="hidden sm:inline text-sm font-medium text-gray-400 hover:text-white transition-colors">📘 API Reference</Link>
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
                          className="block px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">{i.label}</a>
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
          <main className="flex-1 max-w-4xl min-w-0 space-y-20">

            {/* ── TITLE ── */}
            <section className="space-y-4 pt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[10px] font-bold uppercase tracking-widest">Development Guide</div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Developer Guide</h1>
              <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
                Panduan lengkap untuk mengembangkan, menjalankan, dan mendeploy Whatsappin —
                platform WhatsApp Gateway SaaS dengan AI Auto-Responder, Blast Campaign, dan REST API.
              </p>
            </section>

            {/* ── TENTANG ── */}
            <section id="tentang" className="space-y-6 scroll-mt-24">
              <h2 className="text-3xl font-bold tracking-tight">Tentang Whatsappin</h2>
              <p className="text-gray-400 leading-relaxed">
                Whatsappin adalah platform SaaS yang menyediakan gateway untuk mengintegrasikan WhatsApp dengan aplikasi bisnis Anda.
                Dengan arsitektur microservices berbasis Node.js (Fastify) dan Next.js, platform ini dirancang untuk skalabilitas
                dan kemudahan pengembangan.
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { icon: '⚡', title: 'Backend', desc: 'Fastify + Prisma + MySQL + Redis + Baileys' },
                  { icon: '🎨', title: 'Frontend', desc: 'Next.js 14 + Zustand + Tailwind CSS' },
                  { icon: '🐳', title: 'Infrastructure', desc: 'Docker + Nginx + Prometheus + Grafana' },
                ].map(t => (
                  <div key={t.title} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-2xl mb-2">{t.icon}</div>
                    <h4 className="font-bold text-sm">{t.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{t.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── FITUR ── */}
            <section id="fitur" className="space-y-6 scroll-mt-24">
              <h2 className="text-3xl font-bold tracking-tight">Fitur Platform</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: '🤖', title: 'AI Auto-Responder', desc: 'Balas pesan otomatis dengan keyword rules atau AI (Gemini, OpenAI, Claude). Bisa dilengkapi Knowledge Base untuk RAG.' },
                  { icon: '📢', title: 'Mass Blast Campaign', desc: 'Kirim pesan massal ke ribuan kontak sekaligus. Dukung template variabel {{name}}, {{link}}, dan penjadwalan.' },
                  { icon: '📱', title: 'Multi-Device', desc: 'Hubungkan hingga 10+ nomor WhatsApp. Setiap device punya session independen.' },
                  { icon: '🔌', title: 'REST API', desc: 'API lengkap untuk kirim pesan, kelola device, kontak, template, dan auto-responder.' },
                  { icon: '🔔', title: 'Webhook Real-time', desc: 'Dapatkan callback HTTP untuk setiap event: pesan masuk, status delivery, perubahan device.' },
                  { icon: '👥', title: 'Team Management', desc: 'Multi-level user: Admin, Agent. Cocok untuk tim CS dan marketing.' },
                  { icon: '📊', title: 'Dashboard & Analytics', desc: 'Pantau sent count, aktivitas device, dan performa campaign secara real-time.' },
                  { icon: '💳', title: 'Subscription Billing', desc: 'Terintegrasi Midtrans. Multiple plan dengan limit device & kuota pesan berbeda.' },
                ].map(f => (
                  <div key={f.title} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-xl mb-2">{f.icon}</div>
                    <h4 className="font-bold text-sm mb-1">{f.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── ARSITEKTUR ── */}
            <section id="arsitektur" className="space-y-6 scroll-mt-24">
              <h2 className="text-3xl font-bold tracking-tight">Arsitektur Sistem</h2>
              <p className="text-gray-400 leading-relaxed">
                Platform terdiri dari beberapa komponen yang berjalan dalam container Docker:
              </p>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="grid sm:grid-cols-2 gap-6">
                  {[
                    { name: 'Nginx', role: 'Reverse proxy', port: '80 / 443' },
                    { name: 'Backend (Fastify)', role: 'API server', port: '3001' },
                    { name: 'Frontend (Next.js)', role: 'Web app', port: '3000' },
                    { name: 'MySQL', role: 'Database', port: '3306' },
                    { name: 'Redis', role: 'Queue & Cache', port: '6379' },
                    { name: 'Prometheus', role: 'Metrics collector', port: '9090' },
                    { name: 'Grafana', role: 'Monitoring dashboard', port: '3002' },
                  ].map(s => (
                    <div key={s.name} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-brand-500" />
                      <div><span className="font-bold text-sm">{s.name}</span><span className="text-xs text-gray-500 ml-2">{s.role}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── PRASYARAT ── */}
            <section id="prasyarat" className="space-y-6 scroll-mt-24">
              <h2 className="text-3xl font-bold tracking-tight">Prasyarat Setup Lokal</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { req: 'Node.js v20+', icon: '🟢' },
                  { req: 'MySQL 8.0+', icon: '🐬' },
                  { req: 'Redis 6+', icon: '🔴' },
                ].map(p => (
                  <div key={p.req} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                    <span className="text-xl">{p.icon}</span>
                    <span className="text-sm font-medium">{p.req}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* ── INSTALASI ── */}
            <section id="instalasi" className="space-y-6 scroll-mt-24">
              <h2 className="text-3xl font-bold tracking-tight">Instalasi Lokal</h2>

              <div className="space-y-6">
                <div>
                  <h4 className="font-bold mb-3">1. Clone & Setup Backend</h4>
                  <CodeBlock code={`git clone https://github.com/your-repo/whatsapp-gateway.git
cd whatsapp-gateway/backend
cp .env.example .env   # lalu isi konfigurasi database
npm install
npx prisma migrate dev
npm run dev`} lang="bash" />
                </div>
                <div>
                  <h4 className="font-bold mb-3">2. Setup Frontend</h4>
                  <CodeBlock code={`cd whatsapp-gateway/frontend
npm install
npm run dev`} lang="bash" />
                  <p className="text-xs text-gray-500 mt-2">Frontend akan berjalan di <code className="text-brand-400">http://localhost:3000</code></p>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <p className="text-sm text-amber-400 font-bold mb-1">⚠️ Catatan</p>
                  <p className="text-xs text-gray-400">Pastikan MySQL dan Redis sudah berjalan sebelum menjalankan backend. Untuk development cepat, gunakan Docker (lihat bagian Deployment).</p>
                </div>
              </div>
            </section>

            {/* ── DOCKER ── */}
            <section id="docker" className="space-y-6 scroll-mt-24">
              <h2 className="text-3xl font-bold tracking-tight">Deploy dengan Docker</h2>
              <p className="text-gray-400 leading-relaxed">Cara paling mudah untuk menjalankan seluruh stack di VPS.</p>
              <CodeBlock code={`# Di VPS
git clone https://github.com/your-repo/whatsapp-gateway.git
cd whatsapp-gateway/Infrastruktur

# Copy & edit environment
cp env/.env.backend .env
nano .env  # isi DB_ROOT_PASSWORD, JWT_SECRET, dll

# Jalankan semua service
docker compose -f docker-compose.prod.yml up -d --build

# Cek status
docker compose ps`} lang="bash" />

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <h4 className="font-bold text-sm mb-3">📁 Struktur Infrastruktur</h4>
                  <CodeBlock code={`Infrastruktur/
├── docker-compose.prod.yml
├── nginx/default.conf
├── docker/        # Dockerfile + monitoring
├── env/           # Template env
├── scripts/       # deploy, backup
└── runbooks/      # Ops guide`} lang="text" />
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <h4 className="font-bold text-sm mb-3">🐳 Services</h4>
                  <ul className="text-xs text-gray-500 space-y-2">
                    <li className="flex justify-between"><span>Nginx</span><span className="text-gray-400">Reverse proxy (80/443)</span></li>
                    <li className="flex justify-between"><span>Backend</span><span className="text-gray-400">Fastify API (3001)</span></li>
                    <li className="flex justify-between"><span>Frontend</span><span className="text-gray-400">Next.js (3000)</span></li>
                    <li className="flex justify-between"><span>MySQL</span><span className="text-gray-400">Database</span></li>
                    <li className="flex justify-between"><span>Redis</span><span className="text-gray-400">Queue & cache</span></li>
                    <li className="flex justify-between"><span>Prometheus</span><span className="text-gray-400">Metrics</span></li>
                    <li className="flex justify-between"><span>Grafana</span><span className="text-gray-400">Dashboard (3002)</span></li>
                  </ul>
                </div>
              </div>
            </section>

            {/* ── ENV ── */}
            <section id="env" className="space-y-6 scroll-mt-24">
              <h2 className="text-3xl font-bold tracking-tight">Konfigurasi Environment</h2>
              <p className="text-gray-400 leading-relaxed">Variable environment yang wajib dan opsional.</p>

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
                      ['JWT_SECRET', '✅', '-', 'Secret key untuk JWT'],
                      ['REDIS_HOST', '✅', '127.0.0.1', 'Redis host'],
                      ['FRONTEND_URL', '✅', 'http://localhost:3000', 'URL frontend untuk CORS'],
                      ['MESSAGE_DELAY_MS', '', '3000', 'Delay antar pesan blast (ms)'],
                      ['MIDTRANS_SERVER_KEY', 'optional', '-', 'Payment gateway key'],
                      ['OPENAI_API_KEY', 'optional', '-', 'AI provider key'],
                      ['GEMINI_API_KEY', 'optional', '-', 'AI provider key'],
                      ['ANTHROPIC_API_KEY', 'optional', '-', 'AI provider key'],
                    ].map(([v, r, d, desc]) => (
                      <tr key={v} className="hover:bg-white/5">
                        <td className="p-4 font-mono text-xs text-brand-400">{v}</td>
                        <td className="p-4"><span className={`text-[10px] px-2 py-0.5 rounded-full ${r === '✅' ? 'bg-red-500/10 text-red-400' : 'bg-gray-500/10 text-gray-500'}`}>{r}</span></td>
                        <td className="p-4 text-xs text-gray-600">{d}</td>
                        <td className="p-4 text-gray-400 text-xs hidden md:table-cell">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── PANDUAN FITUR ── */}
            <section id="device" className="space-y-6 scroll-mt-24">
              <h2 className="text-3xl font-bold tracking-tight">📱 Device WhatsApp</h2>
              <p className="text-gray-400 leading-relaxed">
                Device adalah nomor WhatsApp yang terhubung ke platform. Setiap device membutuhkan scan QR code dari HP.
              </p>
              <div className="space-y-4">
                <h4 className="font-bold text-sm">State Machine Device</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { state: 'QR_REQUIRED', desc: 'Menunggu scan QR' },
                    { state: 'CONNECTING', desc: 'Sedang konek' },
                    { state: 'CONNECTED', desc: 'Siap dipakai ✅' },
                    { state: 'DISCONNECTED', desc: 'Terputus' },
                  ].map(d => (
                    <div key={d.state} className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                      <div className="text-[10px] font-mono text-gray-500 mb-1">{d.state}</div>
                      <div className="text-xs text-gray-400">{d.desc}</div>
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/20">
                  <p className="text-sm text-gray-400">💡 <strong className="text-white">Penting:</strong> HP yang discan QR harus tetap online saat platform digunakan sebagai bridge enkripsi WhatsApp. Jika HP offline, pesan akan stuck &quot;waiting for this message&quot;.</p>
                </div>
              </div>
            </section>

            <section id="pesan" className="space-y-6 scroll-mt-24">
              <h2 className="text-3xl font-bold tracking-tight">💬 Kirim Pesan</h2>
              <p className="text-gray-400 leading-relaxed">
                Platform mendukung 3 tipe pesan: <strong className="text-white">Teks</strong>, <strong className="text-white">Gambar</strong>, dan <strong className="text-white">Dokumen</strong>.
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { type: 'TEXT', format: 'Halo!', media: 'Tidak perlu media' },
                  { type: 'IMAGE', format: 'Caption + URL gambar', media: 'mediaUrl: https://...jpg' },
                  { type: 'DOCUMENT', format: 'Deskripsi + URL file', media: 'mediaUrl: https://...pdf' },
                ].map(t => (
                  <div key={t.type} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[10px] font-mono text-brand-400 mb-1">{t.type}</div>
                    <div className="text-xs text-gray-400">{t.format}</div>
                    <div className="text-[10px] text-gray-600 mt-1">{t.media}</div>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="font-bold text-sm mb-2">📌 Format Nomor Telepon</h4>
                <p className="text-xs text-gray-400">Gunakan format internasional tanpa tanda +. Contoh: <code className="text-brand-400 text-xs">628123456789</code> (untuk Indonesia). Sistem otomatis menambahkan <code className="text-gray-500">@s.whatsapp.net</code>.</p>
              </div>
            </section>

            <section id="blast" className="space-y-6 scroll-mt-24">
              <h2 className="text-3xl font-bold tracking-tight">📢 Blast Campaign</h2>
              <p className="text-gray-400 leading-relaxed">
                Fitur untuk mengirim pesan massal ke grup kontak. Mendukung template dinamis dengan variabel <code className="text-brand-400">{'{'} { '{name}' } {'}'}</code>, <code className="text-brand-400">{'{'} { '{link}' } {'}'}</code>, dll.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="font-bold text-sm mb-2">📄 Template Variables</h4>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li><code className="text-brand-400">{'{'} { '{name}' } {'}'}</code> — Nama kontak</li>
                    <li><code className="text-brand-400">{'{'} { '{phone}' } {'}'}</code> — Nomor telepon</li>
                    <li><code className="text-brand-400">{'{'} { '{email}' } {'}'}</code> — Email</li>
                    <li><code className="text-brand-400">{'{'} { '{link}' } {'}'}</code> — Custom dari CSV</li>
                  </ul>
                  <p className="text-[10px] text-gray-600 mt-3">💡 Kolom tambahan di CSV otomatis jadi variabel.</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <h4 className="font-bold text-sm text-amber-400 mb-2">⚠️ Best Practices</h4>
                  <ul className="text-xs text-gray-400 space-y-1.5">
                    <li>• Delay 3-6 detik antar pesan</li>
                    <li>• Maks 200 pesan per sesi</li>
                    <li>• Kirim di jam kerja untuk delivery optimal</li>
                    <li>• Gunakan kontak yang sudah opt-in</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="autoresponder" className="space-y-6 scroll-mt-24">
              <h2 className="text-3xl font-bold tracking-tight">🤖 AI Auto-Responder</h2>
              <p className="text-gray-400 leading-relaxed">
                Otomatiskan balasan pesan dengan dua mode: <strong className="text-white">Keyword Rules</strong> atau <strong className="text-white">AI Cerdas</strong>.
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <h4 className="font-bold text-sm mb-3">🔤 Match Types</h4>
                  <div className="space-y-2">
                    {[
                      { type: 'EXACT', desc: 'Kata persis sama' },
                      { type: 'CONTAINS', desc: 'Mengandung kata' },
                      { type: 'STARTSWITH', desc: 'Diawali dengan' },
                      { type: 'REGEX', desc: 'Regular expression' },
                    ].map(t => (
                      <div key={t.type} className="flex items-center gap-2 text-xs">
                        <code className="text-brand-400">{t.type}</code>
                        <span className="text-gray-500">— {t.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <h4 className="font-bold text-sm mb-3">🧠 AI Provider Support</h4>
                  <div className="space-y-2">
                    {[
                      { name: 'Gemini', prov: 'Google (gratis)' },
                      { name: 'OpenAI', prov: 'ChatGPT' },
                      { name: 'Claude', prov: 'Anthropic' },
                    ].map(p => (
                      <div key={p.name} className="flex items-center gap-2 text-xs">
                        <span className="font-bold">{p.name}</span>
                        <span className="text-gray-500">— {p.prov}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <h4 className="font-bold text-xs mb-1">🌐 Knowledge Base (RAG)</h4>
                    <p className="text-[10px] text-gray-500">Upload dokumen/URL, AI akan menjawab berdasarkan konten tersebut. Cocok untuk FAQ otomatis.</p>
                  </div>
                </div>
              </div>
            </section>

            <section id="webhook" className="space-y-6 scroll-mt-24">
              <h2 className="text-3xl font-bold tracking-tight">🔔 Webhook</h2>
              <p className="text-gray-400 leading-relaxed">
                Dapatkan notifikasi real-time ke server Anda setiap kali ada event: pesan masuk, status berubah, device connect/disconnect.
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { event: 'messages.upsert', desc: 'Pesan baru masuk' },
                  { event: 'message.status', desc: 'Status pesan berubah' },
                  { event: 'device.status', desc: 'Device koneksi' },
                ].map(e => (
                  <div key={e.event} className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[10px] font-mono text-brand-400 mb-1">{e.event}</div>
                    <div className="text-xs text-gray-500">{e.desc}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600">Setiap payload webhook ditandatangani dengan HMAC-SHA256 di header <code className="text-brand-400">x-webhook-signature</code>.</p>
            </section>

            <section id="kontak" className="space-y-6 scroll-mt-24">
              <h2 className="text-3xl font-bold tracking-tight">👥 Kontak & Grup</h2>
              <p className="text-gray-400 leading-relaxed">
                Kelola kontak dengan grup, tag, dan metadata custom. Import dari CSV dengan kolom bebas.
              </p>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <h4 className="font-bold text-sm mb-2">📄 Format CSV Import</h4>
                <CodeBlock code={`name,phone,email,link,group
John Doe,628123456789,john@email.com,https://link.com/john,Invitation
Jane,628987654321,jane@email.com,,Customers

# Kolom name & phone wajib
# Kolom link, group, dan lainnya opsional
# Kolom tambahan otomatis jadi {{variable}} di template`} lang="csv" />
                <Link href="/contact-template.csv" className="inline-flex items-center gap-1 mt-3 text-xs text-brand-400 hover:text-brand-300">📄 Download template CSV</Link>
              </div>
            </section>

            <section id="template" className="space-y-6 scroll-mt-24">
              <h2 className="text-3xl font-bold tracking-tight">📝 Template Pesan</h2>
              <p className="text-gray-400 leading-relaxed">
                Buat template pesan dengan variabel dinamis. Bisa digunakan ulang untuk berbagai campaign.
              </p>
              <CodeBlock code={`// Contoh template
name: "Promo Ramadhan"
content: "Halo {{name}}! Dapatkan diskon spesial di {{link}}"
variables: ["name", "link"]`} lang="json" />
              <p className="text-xs text-gray-500">Template bisa langsung dipilih saat membuat blast campaign.</p>
            </section>

            {/* ── MONITORING ── */}
            <section id="monitoring" className="space-y-6 scroll-mt-24">
              <h2 className="text-3xl font-bold tracking-tight">📊 Monitoring</h2>
              <p className="text-gray-400 leading-relaxed">
                Platform dilengkapi stack Prometheus + Grafana untuk monitoring performa.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <h4 className="font-bold text-sm mb-2">📈 Prometheus</h4>
                  <p className="text-xs text-gray-500">Backend mengekspos metrik di <code className="text-brand-400">/metrics</code>. Port <code className="text-brand-400">9090</code>.</p>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <h4 className="font-bold text-sm mb-2">📉 Grafana</h4>
                  <p className="text-xs text-gray-500">Dashboard visualisasi. Port <code className="text-brand-400">3002</code>. Default login: admin/admin.</p>
                </div>
              </div>
            </section>

            {/* ── BACKUP ── */}
            <section id="backup" className="space-y-6 scroll-mt-24">
              <h2 className="text-3xl font-bold tracking-tight">💾 Backup & Restore</h2>
              <p className="text-gray-400 leading-relaxed">Database backup menggunakan script otomatis.</p>
              <CodeBlock code={`# Backup
cd Infrastruktur
./scripts/backup.sh
# Hasil: ./backups/whatsapp_gateway_20250101_120000.sql.gz

# Restore
gunzip -c backups/file.sql.gz | docker exec -i whatsappin-db mysql -uroot -p"$PASSWORD" whatsapp_gateway

# Cron otomatis (setiap jam 3 pagi)
0 3 * * * cd /opt/whatsapp-gateway/Infrastruktur && ./scripts/backup.sh`} lang="bash" />
            </section>

            {/* ── TROUBLESHOOTING ── */}
            <section id="troubleshooting" className="space-y-6 scroll-mt-24">
              <h2 className="text-3xl font-bold tracking-tight">🔧 Troubleshooting</h2>
              <div className="space-y-4">
                {[
                  { problem: 'Backend tidak bisa connect ke DB', solution: 'Cek docker logs whatsappin-db. Pastikan MySQL healthcheck pass.' },
                  { problem: 'QR Code tidak muncul di dashboard', solution: 'Cek WebSocket connection di browser console (F12). Pastikan ws:// URL benar.' },
                  { problem: 'Pesan "waiting for this message"', solution: 'HP yang scan QR harus online. WA multi-device butuh HP sebagai bridge enkripsi.' },
                  { problem: 'Session hilang setelah restart Docker', solution: 'Session tersimpan di volume session_data. Pastikan volume tidak terhapus (docker compose down -v).' },
                  { problem: 'Redis version warning di log', solution: 'Upgrade image Redis ke v7+. Warning tidak mempengaruhi fungsionalitas.' },
                  { problem: 'Rate limited oleh WhatsApp', solution: 'Tambah delay antar pesan (MESSAGE_DELAY_MS). Maks 200 pesam per sesi.' },
                ].map(t => (
                  <details key={t.problem} className="group p-4 rounded-xl bg-white/5 border border-white/10 open:bg-white/[0.07] transition-all cursor-pointer">
                    <summary className="flex items-center justify-between text-sm font-semibold text-white marker:hidden list-none">
                      {t.problem}
                      <svg className="w-4 h-4 text-gray-500 transition-transform group-open:rotate-180 shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </summary>
                    <p className="mt-3 text-xs text-gray-400 leading-relaxed">{t.solution}</p>
                  </details>
                ))}
              </div>
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
            <Link href="/api" className="hover:text-white transition-colors">API Reference</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
