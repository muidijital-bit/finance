'use client';

import { Moon, Sun, LogOut, Menu } from 'lucide-react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { usePathname, useRouter } from 'next/navigation';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/transactions': 'İşlemler',
  '/budget': 'Bütçe Yönetimi',
  '/investments': 'Yatırımlar',
  '/goals': 'Hedefler',
  '/reports': 'Raporlar & Analizler',
  '/calendar': 'Ödeme Takvimi',
  '/brands': 'Markalar',
  '/settings': 'Ayarlar',
};

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { darkMode, toggleDarkMode } = useFinanceStore();
  const pathname = usePathname();
  const router = useRouter();
  const title = PAGE_TITLES[pathname] ?? 'muimedya';

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
          aria-label="Menüyü aç"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
          aria-label="Tema değiştir"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
          aria-label="Çıkış yap"
          title="Çıkış Yap"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
