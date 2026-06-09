'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';

// ── Hooks ────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null!);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [ref, inView] = useInView(0.1);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${className} ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ── Testimonial Data ─────────────────────────────────────
const testimonials = [
  { quote: 'Sejak pakai Whatsappin, tim CS kami bisa handle 5x lebih banyak pertanyaan pelanggan. AI Auto-Responder-nya luar biasa!', name: 'Ahmad Rizal', role: 'CEO, TokoRoti.id' },
  { quote: 'API-nya sangat developer-friendly. Integrasi cuma butuh 2 jam dari awal baca docs sampai production!', name: 'Dian Puspita', role: 'CTO, FintechXYZ' },
  { quote: 'Blast campaign fitur andalan kami. Kirim promosi ke 10.000 kontak dalam hitungan menit tanpa hambatan.', name: 'Bambang Hartono', role: 'Marketing Director, EduCourse' },
];

const faqs = [
  { q: 'Apakah saya perlu perangkat kedua untuk menjalankan gateway ini?', a: 'Ya, Anda perlu scan QR Code menggunakan WhatsApp di ponsel. Setelah terhubung, ponsel tetap harus online untuk menjaga koneksi enkripsi end-to-end.' },
  { q: 'Apakah nomor WhatsApp saya bisa terkena banned?', a: 'Tidak jika digunakan sesuai aturan. Kami menggunakan library resmi WhatsApp Web API (Baileys) yang aman. Hindari spam berlebihan dan selalu gunakan delay antar pengiriman.' },
  { q: 'Berapa lama waktu yang dibutuhkan untuk integrasi API?', a: 'Rata-rata developer hanya butuh 30 menit hingga 2 jam untuk integrasi penuh. Dokumentasi kami lengkap dengan contoh kode di berbagai bahasa pemrograman.' },
  { q: 'Apakah ada garansi uang kembali?', a: 'Ya! Kami memberikan garansi uang kembali 14 hari jika Anda tidak puas dengan layanan kami. Silakan hubungi support untuk informasi lebih lanjut.' },
];

// ── Floating Particles ───────────────────────────────────
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    let anim: number;
    const particles: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize(); window.addEventListener('resize', resize);
    for (let i = 0; i < 40; i++) particles.push({ x: Math.random() * c.width, y: Math.random() * c.height, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, r: Math.random() * 2 + 0.5 });
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > c.width) p.vx *= -1;
        if (p.y < 0 || p.y > c.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99, 102, 241, 0.3)'; ctx.fill();
      });
      anim = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(anim); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

// ── Navbar ───────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/10' : 'bg-transparent'}`}>
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tighter group">
          <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <span className="text-white text-lg font-black">W</span>
          </div>
          <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Whatsappin</span>
        </Link>

        <div className="hidden md:flex items-center gap-9 text-sm font-medium">
          {['Features', 'Pricing', 'Testimonials', 'FAQ'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-gray-400 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-brand-500 after:transition-all hover:after:w-full">{item}</a>
          ))}
          <Link href="/docs" className="text-gray-400 hover:text-white transition-colors">Docs</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:inline-block text-sm font-medium text-gray-400 hover:text-white transition-colors">Login</Link>
          <Link href="/register" className="px-5 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 rounded-full text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-500/25">Get Started</Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} /></svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? 'max-h-96' : 'max-h-0'}`}>
        <div className="px-6 py-4 space-y-3 bg-[#0a0a0a] border-t border-white/5">
          {['Features', 'Pricing', 'Testimonials', 'FAQ', 'Docs'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileOpen(false)} className="block text-sm text-gray-400 hover:text-white py-2">{item}</a>
          ))}
          <Link href="/login" onClick={() => setMobileOpen(false)} className="block text-sm text-gray-400 hover:text-white py-2">Login</Link>
        </div>
      </div>
    </nav>
  );
}

// ── Main Page ────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-brand-500/30 selection:text-white relative">
      <ParticleField />

      <Navbar />

      {/* ─── HERO ───────────────────────────────────────────── */}
      <section className="relative z-10 pt-36 pb-24 px-6 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="container mx-auto max-w-6xl text-center relative">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-widest mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
              </span>
              Now with AI Auto-Responder
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] mb-6">
              Scale Your <br />
              <span className="bg-gradient-to-r from-brand-400 via-brand-300 to-emerald-400 bg-clip-text text-transparent">
                WhatsApp Marketing
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={200}>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
              Platform WhatsApp Gateway SaaS paling canggih untuk bisnis Anda —
              dilengkapi <strong className="text-white">AI Auto-Responder</strong>, <strong className="text-white">Mass Blast Campaign</strong>,
              dan API yang siap diintegrasikan dalam hitungan menit.
            </p>
          </FadeIn>

          <FadeIn delay={300}>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-14">
              <Link href="/register" className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/10">
                Start for Free →
              </Link>
              <a href="#features" className="px-8 py-4 bg-white/5 border border-white/10 rounded-full font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Watch Demo
              </a>
            </div>
          </FadeIn>

          <FadeIn delay={400}>
            <div className="flex flex-wrap justify-center gap-10 pt-4 border-t border-white/5 max-w-lg mx-auto">
              {[
                { val: '10K+', label: 'Messages Sent' },
                { val: '500+', label: 'Active Devices' },
                { val: '99.9%', label: 'Uptime SLA' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-extrabold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">{s.val}</div>
                  <div className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={500}>
            <div className="mt-16 relative max-w-5xl mx-auto">
              <div className="absolute -inset-6 bg-gradient-to-r from-brand-500/20 via-transparent to-emerald-500/20 blur-[80px] rounded-3xl" />
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-white/5 backdrop-blur-sm">
                <Image src="/hero-illustration.png" alt="Whatsappin Dashboard" width={1200} height={750} className="w-full object-cover" priority />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────── */}
      <section className="relative z-10 py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <FadeIn>
            <div className="text-center space-y-4 mb-16">
              <span className="inline-block px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-widest">How It Works</span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Three Simple Steps</h2>
              <p className="text-gray-400 max-w-xl mx-auto">Dari setup hingga go-live dalam hitungan menit, tanpa ribet.</p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Connect WhatsApp', desc: 'Scan QR code dari dashboard untuk menghubungkan nomor WhatsApp Anda. Cukup sekali setup.', color: 'from-brand-500/20 to-brand-500/5', icon: '📱' },
              { step: '02', title: 'Configure Automations', desc: 'Atur AI Auto-Responder, buat template blast, atau siapkan webhook. Semua dari satu dashboard.', color: 'from-emerald-500/20 to-emerald-500/5', icon: '⚙️' },
              { step: '03', title: 'Launch & Scale', desc: 'Mulai kirim pesan massal, integrasi API, dan scale bisnis Anda tanpa batas.', color: 'from-purple-500/20 to-purple-500/5', icon: '🚀' },
            ].map((s, i) => (
              <FadeIn key={s.step} delay={i * 150}>
                <div className={`p-8 rounded-2xl bg-gradient-to-b ${s.color} border border-white/5 hover:border-white/20 transition-all group`}>
                  <div className="text-4xl mb-6">{s.icon}</div>
                  <div className="text-3xl font-black text-gray-600 mb-3">{s.step}</div>
                  <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ───────────────────────────────────────── */}
      <section id="features" className="relative z-10 py-24 bg-white/[0.015] border-y border-white/5 px-6">
        <div className="container mx-auto max-w-6xl">
          <FadeIn>
            <div className="text-center space-y-4 mb-16">
              <span className="inline-block px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-widest">Features</span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Everything You Need to Automate</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">Fitur lengkap untuk membantu bisnis Anda berkembang lebih cepat melalui WhatsApp.</p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '📱', title: 'Multi-Device Support', desc: 'Hubungkan banyak akun WhatsApp dalam satu dashboard. Kelola percakapan tim dengan efisien.', color: 'text-blue-400' },
              { icon: '🤖', title: 'AI Auto-Responder', desc: 'Chatbot cerdas berbasis Gemini, OpenAI & Claude. Siap melayani pelanggan 24/7 secara natural.', color: 'text-emerald-400' },
              { icon: '📢', title: 'Mass Blast Campaigns', desc: 'Kirim pesan massal terjadwal ke ribuan kontak sekaligus dengan sistem antrean yang stabil.', color: 'text-purple-400' },
              { icon: '🔌', title: 'RESTful API', desc: 'API lengkap & dokumentasi jelas. Integrasi cepat dalam bahasa pemrograman apapun.', color: 'text-pink-400' },
              { icon: '🔄', title: 'Webhook Events', desc: 'Terima notifikasi real-time untuk setiap event: pesan masuk, status delivery, dan lainnya.', color: 'text-amber-400' },
              { icon: '📊', title: 'Detailed Analytics', desc: 'Pantau kinerja campaign, respons rate, dan aktivitas device secara real-time.', color: 'text-cyan-400' },
            ].map((f, i) => (
              <FadeIn key={f.title} delay={i * 100}>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-500/40 hover:bg-white/[0.07] transition-all group">
                  <div className={`text-3xl mb-4 group-hover:scale-110 transition-transform`}>{f.icon}</div>
                  <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ──────────────────────────────────── */}
      <section id="testimonials" className="relative z-10 py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <FadeIn>
            <div className="text-center space-y-4 mb-16">
              <span className="inline-block px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-widest">Testimonials</span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Trusted by Businesses</h2>
              <p className="text-gray-400 max-w-xl mx-auto">Lihat apa kata mereka yang sudah menggunakan Whatsappin.</p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <FadeIn key={t.name} delay={i * 150}>
                <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all relative">
                  <svg className="w-8 h-8 text-brand-500/30 mb-4" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" /></svg>
                  <p className="text-gray-300 leading-relaxed mb-6 text-sm">{t.quote}</p>
                  <div>
                    <div className="font-bold text-sm">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ────────────────────────────────────────── */}
      <section id="pricing" className="relative z-10 py-24 bg-white/[0.015] border-y border-white/5 px-6">
        <div className="container mx-auto max-w-5xl">
          <FadeIn>
            <div className="text-center space-y-4 mb-16">
              <span className="inline-block px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-widest">Pricing</span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Choose Your Plan</h2>
              <p className="text-gray-400 max-w-xl mx-auto">Mulai gratis, upgrade kapan saja sesuai kebutuhan.</p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free */}
            <FadeIn delay={0}>
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col hover:bg-white/[0.08] transition-all">
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-400 mb-2">Free</h3>
                  <div className="text-4xl font-extrabold">Rp 0<span className="text-lg text-gray-600 font-medium">/bln</span></div>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  {['1 Device WhatsApp', '100 Messages / Bulan', 'Basic Dashboard'].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-gray-400">
                      <svg className="w-5 h-5 text-brand-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="w-full py-4 rounded-xl border border-white/20 text-center font-bold hover:bg-white/5 transition-colors">Get Started</Link>
              </div>
            </FadeIn>

            {/* Starter (Popular) */}
            <FadeIn delay={100}>
              <div className="p-8 rounded-3xl bg-white/5 border-2 border-brand-500 flex flex-col relative shadow-2xl shadow-brand-500/10 scale-[1.02]">
                <div className="absolute top-0 right-8 -translate-y-1/2 px-4 py-1 bg-gradient-to-r from-brand-500 to-brand-600 text-white text-xs font-bold rounded-full shadow-lg shadow-brand-500/30">POPULAR</div>
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-brand-400 mb-2">Starter</h3>
                  <div className="text-4xl font-extrabold">Rp 50k<span className="text-lg text-gray-500 font-medium">/bln</span></div>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  {['3 Device WhatsApp', '5,000 Messages / Bulan', 'Blast Campaigns', 'AI Auto-Responder'].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <svg className="w-5 h-5 text-brand-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white text-center font-bold hover:from-brand-600 hover:to-brand-700 transition-all shadow-lg shadow-brand-500/20">Upgrade Now</Link>
              </div>
            </FadeIn>

            {/* Pro */}
            <FadeIn delay={200}>
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col hover:bg-white/[0.08] transition-all">
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-400 mb-2">Pro</h3>
                  <div className="text-4xl font-extrabold">Rp 150k<span className="text-lg text-gray-600 font-medium">/bln</span></div>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  {['10 Device WhatsApp', '50,000 Messages / Bulan', 'Unlimited AI Auto-Responder', 'API Full Access', 'Priority Support'].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                      <svg className="w-5 h-5 text-brand-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="w-full py-4 rounded-xl border border-white/20 text-center font-bold hover:bg-white/5 transition-colors">Go Enterprise</Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── FAQ ────────────────────────────────────────────── */}
      <section id="faq" className="relative z-10 py-24 px-6">
        <div className="container mx-auto max-w-3xl">
          <FadeIn>
            <div className="text-center space-y-4 mb-16">
              <span className="inline-block px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-widest">FAQ</span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Frequently Asked Questions</h2>
            </div>
          </FadeIn>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <FadeIn key={faq.q} delay={i * 100}>
                <details className="group p-6 rounded-2xl bg-white/5 border border-white/10 open:bg-white/[0.07] transition-all cursor-pointer">
                  <summary className="flex items-center justify-between font-semibold text-white marker:hidden list-none">
                    {faq.q}
                    <svg className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180 shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </summary>
                  <p className="mt-4 text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                </details>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-6">
        <div className="container mx-auto max-w-5xl">
          <FadeIn>
            <div className="rounded-[40px] bg-gradient-to-br from-brand-600 via-brand-500 to-emerald-500 p-12 md:p-20 text-center space-y-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="relative">
                <h2 className="text-4xl md:text-5xl font-extrabold text-[#0a0a0a] tracking-tight leading-tight">
                  Ready to automate your <br />
                  customer communication?
                </h2>
                <p className="text-black/70 text-lg font-medium max-w-lg mx-auto mt-6 leading-relaxed">
                  Bergabunglah dengan ratusan bisnis yang telah mempercayakan otomasi WhatsApp mereka kepada Whatsappin.
                </p>
                <div className="pt-8">
                  <Link href="/register" className="inline-block px-10 py-5 bg-[#0a0a0a] text-white rounded-full font-extrabold text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/30">
                    Start for Free Now →
                  </Link>
                  <p className="text-black/50 text-xs mt-4">No credit card required • 14-day money back guarantee</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/5 bg-black/30 backdrop-blur-md">
        <div className="container mx-auto px-6 py-16 grid md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tighter">
              <div className="w-7 h-7 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center"><span className="text-white text-sm">W</span></div>
              Whatsappin
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Solusi WhatsApp Gateway & Automation terbaik untuk bisnis di Indonesia. Gunakan kecerdasan AI untuk tingkatkan kepuasan pelanggan.
            </p>
          </div>
          {[
            { title: 'Products', links: [{ label: 'AI Auto-Responder', href: '#features' }, { label: 'Message Blast', href: '#features' }, { label: 'API Reference', href: '/api' }] },
            { title: 'Developer', links: [{ label: 'Documentation', href: '/docs' }, { label: 'API Reference', href: '/api' }, { label: 'Webhooks', href: '/docs#webhooks' }] },
            { title: 'Company', links: [{ label: 'Pricing', href: '#pricing' }, { label: 'Blog', href: '#' }, { label: 'Contact', href: 'mailto:support@whatsappin.com' }] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-gray-500">{col.title}</h4>
              <ul className="space-y-4">
                {col.links.map(l => (
                  <li key={l.label}>
                    {l.href.startsWith('http') || l.href.startsWith('mailto')
                      ? <a href={l.href} className="text-sm text-gray-500 hover:text-white transition-colors">{l.label}</a>
                      : <Link href={l.href} className="text-sm text-gray-500 hover:text-white transition-colors">{l.label}</Link>
                    }
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="container mx-auto px-6 py-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-600">
          <div>© {new Date().getFullYear()} Whatsappin. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
