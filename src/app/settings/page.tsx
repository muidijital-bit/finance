'use client';

export const runtime = 'edge';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useFinanceStore } from '@/store/useFinanceStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { CustomCategory } from '@/types';

const INPUT_CLS = 'w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500';
const LABEL_CLS = 'block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5';

type CatType = CustomCategory['type'];

const TYPE_LABELS: Record<CatType, string> = {
  income_cat: '+ Gelir Kategorisi',
  expense_cat: '− Gider Kategorisi',
  service: '⚙ Hizmet',
};

const ICON_PRESETS = ['📌','💡','🔑','🏷️','📋','🗂️','🔧','🎯','💼','📦','🔄','✨','🌐','📞','🖊️'];

export default function SettingsPage() {
  const { darkMode, toggleDarkMode, currency, setCurrency, customCategories, addCustomCategory, deleteCustomCategory } = useFinanceStore();

  const [newLabel, setNewLabel] = useState('');
  const [newIcon, setNewIcon] = useState('📌');
  const [newType, setNewType] = useState<CatType>('income_cat');
  const [newColor, setNewColor] = useState('#5F17EC');
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    if (!newLabel.trim()) return;
    setAdding(true);
    await addCustomCategory({ type: newType, label: newLabel.trim(), icon: newIcon, color: newColor });
    setAdding(false);
    setNewLabel('');
  }

  const grouped = {
    income_cat: customCategories.filter((c) => c.type === 'income_cat'),
    expense_cat: customCategories.filter((c) => c.type === 'expense_cat'),
    service: customCategories.filter((c) => c.type === 'service'),
  };

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
            <button key={c} onClick={() => setCurrency(c)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currency === c ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
              {c}
            </button>
          ))}
        </div>
      </Card>

      {/* Custom Category Management */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Özel Kategori / Hizmet Ekle</h2>
        <div className="space-y-4">
          {/* Add form */}
          <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>Tür</label>
                <select value={newType} onChange={(e) => setNewType(e.target.value as CatType)} className={INPUT_CLS}>
                  {(Object.entries(TYPE_LABELS) as [CatType, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLS}>Ad</label>
                <input type="text" placeholder="Kategori adı" value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  className={INPUT_CLS} />
              </div>
            </div>
            <div>
              <label className={LABEL_CLS}>İkon</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {ICON_PRESETS.map((ic) => (
                  <button key={ic} onClick={() => setNewIcon(ic)}
                    className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all ${newIcon === ic ? 'ring-2 ring-brand-500 bg-brand-50 dark:bg-brand-900/30 scale-110' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                    {ic}
                  </button>
                ))}
                <input type="text" value={newIcon} onChange={(e) => setNewIcon(e.target.value)}
                  className="w-8 h-8 rounded-lg text-center text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" maxLength={2} />
              </div>
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className={LABEL_CLS}>Renk</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)}
                    className="w-9 h-9 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700 p-0.5" />
                  <span className="text-xs text-gray-500 font-mono">{newColor}</span>
                </div>
              </div>
              <Button variant="primary" onClick={handleAdd} disabled={!newLabel.trim() || adding}>
                <Plus size={14} /> {adding ? 'Ekleniyor...' : 'Ekle'}
              </Button>
            </div>
          </div>

          {/* Existing custom categories */}
          {(Object.entries(grouped) as [CatType, CustomCategory[]][]).map(([type, cats]) => cats.length > 0 && (
            <div key={type}>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">{TYPE_LABELS[type]}</p>
              <div className="space-y-1">
                {cats.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 group">
                    <span className="text-base">{c.icon}</span>
                    <span className="flex-1 text-sm text-gray-900 dark:text-white">{c.label}</span>
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                    <button onClick={() => deleteCustomCategory(c.id)}
                      className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {customCategories.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-2">Henüz özel kategori eklenmedi</p>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Uygulama Hakkında</h2>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>muimedya Finans v1.0.0</p>
          <p>Next.js 15 + TypeScript + Tailwind CSS + Zustand + Cloudflare D1</p>
        </div>
      </Card>
    </div>
  );
}
