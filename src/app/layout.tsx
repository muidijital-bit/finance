import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import DarkModeProvider from '@/components/layout/DarkModeProvider';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'muimedya — Finans Yönetimi',
  description: 'Gelir, gider, yatırım ve hedeflerinizi tek yerden yönetin.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen`}>
        <DarkModeProvider>
          <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <TopBar />
              <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950">
                {children}
              </main>
            </div>
          </div>
        </DarkModeProvider>
      </body>
    </html>
  );
}
