'use client';

import { useEffect } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';

export default function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useFinanceStore((s) => s.darkMode);
  const init = useFinanceStore((s) => s.init);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    init();
  }, [init]);

  return <>{children}</>;
}
