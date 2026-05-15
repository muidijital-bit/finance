'use client';

export const runtime = 'edge';

import { useFinanceStore } from '@/store/useFinanceStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function SettingsPage() {
  const { darkMode, toggleDarkMode, currency, setCurrency } = useFinanceStore();

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Görünüm</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">Karanlık Mod</p>
            <p className="text-xs text-gray-400 mt-0.5">Koyu renkli tema kullan</p>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative w-11 h-6 rounded-full transition-colors ${darkMode ? 'bg-brand-500' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Para Birimi</h2>
        <div className="flex gap-3">
          {['TRY', 'USD', 'EUR', 'GBP'].map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currency === c ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Uygulama Hakkında</h2>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>FinansApp v1.0.0</p>
          <p>Next.js 15 + TypeScript + Tailwind CSS + Zustand + Recharts</p>
          <p className="text-xs text-gray-400">Tüm veriler tarayıcınıza kaydedilir, sunucuya gönderilmez.</p>
        </div>
      </Card>
    </div>
  );
}
