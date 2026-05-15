'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ArrowLeftRight, Wallet,
  TrendingUp, Target, BarChart3, Settings, CalendarClock, X, Briefcase,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'İşlemler', href: '/transactions', icon: ArrowLeftRight },
  { label: 'Markalar', href: '/brands', icon: Briefcase },
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
    <aside className="w-60 flex-shrink-0 flex flex-col h-full" style={{ backgroundColor: '#5F17EC' }}>
      <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
        <Image src="/logo.png" alt="muimedya" width={140} height={48} className="object-contain" priority />
        <button onClick={onClose} className="md:hidden p-1 rounded-lg text-white/70 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link key={href} href={href} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pb-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
        <Link href="/settings" onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Settings size={18} />
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
