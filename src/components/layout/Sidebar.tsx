'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ArrowLeftRight, Wallet,
  TrendingUp, Target, BarChart3, Settings, CalendarClock, X, Briefcase, Users,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'İşlemler', href: '/transactions', icon: ArrowLeftRight },
  { label: 'Markalar', href: '/brands', icon: Briefcase },
  { label: 'Çalışanlar', href: '/employees', icon: Users },
  { label: 'Bütçe', href: '/budget', icon: Wallet },
  { label: 'Yatırımlar', href: '/investments', icon: TrendingUp },
  { label: 'Hedefler', href: '/goals', icon: Target },
  { label: 'Raporlar', href: '/reports', icon: BarChart3 },
  { label: 'Ödeme Takvimi', href: '/calendar', icon: CalendarClock },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

function SidebarInner({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  return (
    <aside className="w-56 flex-shrink-0 flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <Image src="/logo.png" alt="muimedya" width={100} height={32} className="object-contain" priority />
        <button onClick={onClose} className="md:hidden p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
          <X size={18} />
        </button>
      </div>
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link key={href} href={href} onClick={onClose}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
              style={active ? { backgroundColor: '#5F17EC' } : undefined}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-2 pb-3 pt-2 border-t border-gray-100 dark:border-gray-800">
        <Link href="/settings" onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <Settings size={16} />
          Ayarlar
        </Link>
      </div>
    </aside>
  );
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      <div className="hidden md:flex h-full">
        <SidebarInner onClose={onClose} />
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <div className="relative z-10 h-full">
            <SidebarInner onClose={onClose} />
          </div>
        </div>
      )}
    </>
  );
}
