'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/devices', label: 'Devices', icon: '📱' },
  { href: '/contacts', label: 'Contacts', icon: '👥' },
  { href: '/templates', label: 'Templates', icon: '📝' },
  { href: '/send', label: 'Send Message', icon: '💬' },
  { href: '/blast', label: 'Blast', icon: '📢' },
  { href: '/auto-responder', label: 'Auto-Responder', icon: '🤖' },
  { href: '/chat', label: 'Live Chat', icon: '💬' },
  { href: '/team', label: 'Team', icon: '👥' },
  { href: '/webhooks', label: 'Webhooks', icon: '🔗' },
  { href: '/billing', label: 'Billing', icon: '💳' },
  { href: '/logs', label: 'Message Logs', icon: '📋' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-gray-900 border-r border-gray-800">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
        <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-lg font-bold">
          W
        </div>
        <div>
          <p className="font-bold text-white leading-tight">WA Gateway</p>
          <p className="text-xs text-gray-500">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems
          .filter((item) => {
            // Admin doesn't need to see Billing menu as they have unlimited access
            if (user?.role === 'ADMIN' && item.href === '/billing') return false;

            // AGENT restrictions: Hide management & billing
            if (user?.role === 'AGENT') {
              const restricted = ['/billing', '/webhooks', '/team', '/settings'];
              if (restricted.includes(item.href)) return false;
            }

            return true;
          })
          .map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-brand-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}

        {/* Admin Section */}
        {user?.role === 'ADMIN' && (
          <div className="pt-4 mt-4 border-t border-gray-800">
            <p className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Management
            </p>
            {[
              { href: '/admin/plans', label: 'Manage Plans', icon: '💎' },
              { href: '/admin/users', label: 'Manage Users', icon: '👤' },
            ].map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-brand-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-sm font-bold text-white">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full btn-secondary text-sm justify-center"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
