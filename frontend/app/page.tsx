import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-brand-500 selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-2xl font-bold tracking-tighter">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">W</span>
            </div>
            Whatsappin
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#api" className="hover:text-white transition-colors">API Reference</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-brand-400 transition-colors">
              Login
            </Link>
            <Link 
              href="/register" 
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-500/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6">
          <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                </span>
                New: AI Auto-Responder Included
              </div>
              <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
                Scale Your <br />
                <span className="bg-gradient-to-r from-brand-400 to-emerald-400 bg-clip-text text-transparent">
                  WhatsApp Marketing
                </span>
              </h1>
              <p className="text-xl text-gray-400 max-w-lg leading-relaxed">
                Platform WhatsApp Gateway (SaaS) paling canggih untuk bisnis Anda. 
                Dilengkapi dengan AI Auto-Responder, Mass Blast, dan API yang mudah diintegrasikan.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link 
                  href="/register" 
                  className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-200 transition-all hover:scale-[1.02]"
                >
                  Start for Free
                </Link>
                <a 
                  href="#features" 
                  className="px-8 py-4 bg-white/5 border border-white/10 rounded-full font-bold text-lg hover:bg-white/10 transition-all"
                >
                  Explore Features
                </a>
              </div>
              <div className="flex items-center gap-6 pt-8 border-t border-white/5">
                <div>
                  <div className="text-2xl font-bold">10k+</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Messages Sent</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Active Devices</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">99.9%</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Uptime</div>
                </div>
              </div>
            </div>
            <div className="relative animate-in fade-in slide-in-from-right duration-700">
              <div className="absolute -inset-4 bg-brand-500/20 blur-[100px] rounded-full"></div>
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <Image 
                  src="/hero-illustration.png" 
                  alt="Whatsappin Dashboard" 
                  width={800} 
                  height={600}
                  className="w-full object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white/[0.02] border-y border-white/5">
          <div className="container mx-auto px-6 text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold tracking-tight">Everything You Need to Automate</h2>
            <p className="text-gray-400 max-w-2xl mx-auto italic">
              "Kami menyediakan fitur terlengkap untuk membantu bisnis Anda berkembang lebih cepat melalui WhatsApp."
            </p>
          </div>
          <div className="container mx-auto px-6 grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-500/50 transition-all group">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Multi-Device Support</h3>
              <p className="text-gray-400 leading-relaxed">
                Hubungkan banyak akun WhatsApp dalam satu dashboard. Kelola percakapan tim dengan efisien.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-500/50 transition-all group">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-4">AI Auto-Responder</h3>
              <p className="text-gray-400 leading-relaxed">
                Chatbot cerdas berbasis Gemini, OpenAI, & Claude yang siap menjawab pelanggan 24/7 secara natural.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-500/50 transition-all group">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Mass Blast Campaigns</h3>
              <p className="text-gray-400 leading-relaxed">
                Kirim pesan massal terjadwal ke ribuan kontak sekaligus dengan sistem antrean yang aman & stabil.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center space-y-4 mb-20">
              <h2 className="text-4xl font-bold tracking-tight">Pilih Paket Sesuai Kebutuhan</h2>
              <p className="text-gray-400">Investasi terbaik untuk otomasi bisnis Anda.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Free Plan */}
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col hover:bg-white/[0.08] transition-colors">
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-400 mb-2">Free</h3>
                  <div className="text-4xl font-bold">Rp 0<span className="text-lg text-gray-500">/bulan</span></div>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-center gap-3 text-sm text-gray-400">
                    <svg className="w-5 h-5 text-brand-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    1 Device WhatsApp
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-400">
                    <svg className="w-5 h-5 text-brand-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    100 Message / Bulan
                  </li>
                </ul>
                <Link href="/register" className="w-full py-4 rounded-xl border border-white/20 text-center font-bold hover:bg-white/5 transition-colors">
                  Get Started
                </Link>
              </div>

              {/* Starter Plan */}
              <div className="p-8 rounded-3xl bg-white/5 border-2 border-brand-500 flex flex-col relative shadow-2xl shadow-brand-500/10">
                <div className="absolute top-0 right-8 -translate-y-1/2 px-4 py-1 bg-brand-500 text-black text-xs font-bold rounded-full">POPULAR</div>
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-brand-400 mb-2">Starter</h3>
                  <div className="text-4xl font-bold">Rp 50k<span className="text-lg text-gray-500">/bulan</span></div>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-center gap-3 text-sm">
                    <svg className="w-5 h-5 text-brand-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    3 Device WhatsApp
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <svg className="w-5 h-5 text-brand-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    5,000 Message / Bulan
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <svg className="w-5 h-5 text-brand-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    Blast Campaigns
                  </li>
                </ul>
                <Link href="/register" className="w-full py-4 rounded-xl bg-brand-500 text-black text-center font-bold hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20">
                  Upgrade Now
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col hover:bg-white/[0.08] transition-colors">
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-400 mb-2">Pro</h3>
                  <div className="text-4xl font-bold">150k<span className="text-lg text-gray-500">/bulan</span></div>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-center gap-3 text-sm text-gray-300">
                    <svg className="w-5 h-5 text-brand-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    10 Device WhatsApp
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-300">
                    <svg className="w-5 h-5 text-brand-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    50,000 Message / Bulan
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-300">
                    <svg className="w-5 h-5 text-brand-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    Unlimited AI Auto-Responder
                  </li>
                </ul>
                <Link href="/register" className="w-full py-4 rounded-xl border border-white/20 text-center font-bold hover:bg-white/5 transition-colors">
                  Go Enterprise
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6">
          <div className="container mx-auto max-w-4xl rounded-[40px] bg-gradient-to-br from-brand-500 to-emerald-600 p-12 md:p-20 text-center space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0a0a0a] tracking-tight">
              Ready to automate your <br />
              customer communication?
            </h2>
            <p className="text-black/70 text-lg font-medium max-w-lg mx-auto leading-relaxed">
              Bergabunglah dengan ratusan bisnis yang telah mempercayakan otomasi WhatsApp mereka kepada Whatsappin.
            </p>
            <div className="pt-4 relative">
              <Link 
                href="/register" 
                className="inline-block px-10 py-5 bg-[#0a0a0a] text-white rounded-full font-extrabold text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/30"
              >
                Start for Free Now
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/5 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xl font-bold tracking-tighter">
              <div className="w-6 h-6 bg-brand-500 rounded flex items-center justify-center">
                <span className="text-white text-sm">W</span>
              </div>
              Whatsappin
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Solusi WhatsApp Gateway & Automation terbaik untuk bisnis di Indonesia. 
              Gunakan kecerdasan AI untuk tingkatkan kepuasan pelanggan.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-gray-400">Products</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link href="#features" className="hover:text-white transition-colors">AI Auto-Responder</Link></li>
              <li><Link href="#features" className="hover:text-white transition-colors">Message Blast</Link></li>
              <li><Link href="#features" className="hover:text-white transition-colors">API Reference</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-gray-400">Developer</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="/docs/api" className="hover:text-white transition-colors">Webhooks</Link></li>
              <li><Link href="/docs/roadmap" className="hover:text-white transition-colors">Roadmap</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-gray-400">Legal</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-6 pt-12 mt-12 border-t border-white/5 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} Whatsappin. Built with ❤️ for scalability.
        </div>
      </footer>
    </div>
  );
}
