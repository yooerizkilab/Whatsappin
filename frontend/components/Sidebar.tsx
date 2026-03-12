'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const { t, i18n } = useTranslation('common');

  const navItems = [
    // ... existing items
    { href: '/dashboard', label: t('dashboard'), icon: '📊' },
    { href: '/devices', label: t('devices'), icon: '📱' },
    { href: '/contacts', label: t('contacts'), icon: '👥' },
    { href: '/templates', label: t('templates'), icon: '📝' },
    { href: '/send', label: t('send_message'), icon: '💬' },
    { href: '/blast', label: t('blast'), icon: '📢' },
    { href: '/auto-responder', label: t('autoResponder'), icon: '🤖' },
    { href: '/knowledge', label: t('aiAgent'), icon: '🧠' },
    { href: '/chat', label: t('chat'), icon: '💬' },
    { href: '/team', label: t('team'), icon: '👥' },
    { href: '/webhooks', label: t('webhooks'), icon: '🔗' },
    { href: '/billing', label: t('billing'), icon: '💳' },
    { href: '/logs', label: t('logs'), icon: '📋' },
    { href: '/settings', label: t('settings'), icon: '⚙️' },
  ];

  const toggleLanguage = () => {
    const newLang = i18n.language === 'id' ? 'en' : 'id';
    i18n.changeLanguage(newLang);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transition-transform duration-300 transform lg:translate-x-0 lg:static lg:inset-0 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo & Close Button */}
        <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-lg font-bold">
              W
            </div>
            <div>
              <p className="font-bold text-white leading-tight">WA Gateway</p>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 text-gray-400"
          >
            ✕
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems
            .filter((item) => {
              if (user?.role === 'ADMIN' && item.href === '/billing') return false;
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
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-brand-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <span className="w-5 text-center">{item.icon}</span>
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
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-brand-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <span className="w-5 text-center">{item.icon}</span>
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
            <div className="w-8 h-8 flex-shrink-0 rounded-full bg-brand-700 flex items-center justify-center text-sm font-bold text-white">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full btn-secondary text-sm justify-center mb-2"
          >
            {t('logout')}
          </button>

          <button
            onClick={toggleLanguage}
            className="w-full text-[10px] text-gray-500 hover:text-white flex items-center justify-center gap-2 transition-colors py-1"
          >
            <span>🌐</span>
            {i18n.language === 'id' ? 'Ganti ke English' : 'Switch to Indonesian'}
          </button>
        </div>
      </aside>
    </>
  );
}
