'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ArrowLeftRight, Wallet,
  TrendingUp, Target, BarChart3, Settings, CalendarClock,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'İşlemler', href: '/transactions', icon: ArrowLeftRight },
  { label: 'Bütçe', href: '/budget', icon: Wallet },
  { label: 'Yatırımlar', href: '/investments', icon: TrendingUp },
  { label: 'Hedefler', href: '/goals', icon: Target },
  { label: 'Raporlar', href: '/reports', icon: BarChart3 },
  { label: 'Ödeme Takvimi', href: '/calendar', icon: CalendarClock },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col" style={{ backgroundColor: '#5F17EC' }}>
      {/* Logo */}
      <div className="flex items-center px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
        <Image src="/logo.png" alt="muimedya" width={140} height={48} className="object-contain" priority />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="px-3 pb-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Settings size={18} />
          Ayarlar
        </Link>
      </div>
    </aside>
  );
}
