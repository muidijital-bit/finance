import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import DarkModeProvider from '@/components/layout/DarkModeProvider';
import AppShell from '@/components/layout/AppShell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'muimedya — Finans Yönetimi',
  description: 'Gelir, gider, yatırım ve hedeflerinizi tek yerden yönetin.',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen`}>
        <DarkModeProvider>
          <AppShell>{children}</AppShell>
        </DarkModeProvider>
      </body>
    </html>
  );
}
