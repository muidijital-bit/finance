'use client';

export const runtime = 'edge';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useFinanceStore } from '@/store/useFinanceStore';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { formatCurrency, BRAND_MAP, BRANDS } from '@/lib/utils';
import {
  TrendingUp, ArrowRight, Calendar, Receipt, Plus,
  ToggleLeft, ToggleRight, AlertCircle, Trash2, Palette, X,
} from 'lucide-react';

const INPUT_CLS = 'w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500';
const LABEL_CLS = 'block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5';

const COLOR_PRESETS = [
  '#5F17EC','#3b82f6','#22c55e','#ef4444','#f97316','#eab308',
  '#ec4899','#06b6d4','#8b5cf6','#14b8a6','#0891b2','#64748b',
];

export default function BrandsPage() {
  const { transactions, currency, brands: dbBrands, addBrand, updateBrand, deleteBrand } = useFinanceStore();

  const [pageSearch, setPageSearch] = useState('');

  // New brand modal
  const [addOpen, setAddOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState('#5F17EC');
  const [newNote, setNewNote] = useState('');
  const [addSaving, setAddSaving] = useState(false);

  // Color picker popover
  const [colorEditBrand, setColorEditBrand] = useState<string | null>(null);

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Combined BRAND_MAP: hardcoded + DB
  const combinedBrandMap = useMemo(() => {
    const map: Record<string, { label: string; color: string; isActive: boolean; id?: string }> = {};
    BRANDS.forEach((b) => { map[b.value] = { label: b.label, color: b.color, isActive: true }; });
    dbBrands.forEach((b) => { map[b.value] = { label: b.label, color: b.color, isActive: b.isActive, id: b.id }; });
    return map;
  }, [dbBrands]);

  // Brand stats from transaction data
  const brandStats = useMemo(() => {
    const map = new Map<string, { total: number; months: Set<string>; count: number; lastDate: string; lastRemaining?: number }>();
    transactions.forEach((t) => {
      if (t.type !== 'income' || !t.brand) return;
      const key = t.brand;
      if (!map.has(key)) map.set(key, { total: 0, months: new Set(), count: 0, lastDate: '', lastRemaining: undefined });
      const s = map.get(key)!;
      s.total += t.amount;
      s.months.add(t.date.slice(0, 7));
      s.count += 1;
      if (!s.lastDate || t.date > s.lastDate) {
        s.lastDate = t.date;
        if (t.remainingBalance != null) s.lastRemaining = t.remainingBalance;
      }
    });
    return Array.from(map.entries())
      .map(([brand, s]) => {
        const info = combinedBrandMap[brand];
        return {
          brand,
          label: info?.label ?? brand,
          color: info?.color ?? '#9ca3af',
          isActive: info?.isActive ?? true,
          dbId: info?.id,
          total: s.total,
          monthCount: s.months.size,
          txCount: s.count,
          avgPerMonth: s.total / s.months.size,
          lastRemaining: s.lastRemaining,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [transactions, combinedBrandMap]);

  // DB-only brands (no transactions yet)
  const dbOnlyBrands = useMemo(() => {
    const txBrands = new Set(brandStats.map((b) => b.brand));
    return dbBrands.filter((b) => !txBrands.has(b.value));
  }, [dbBrands, brandStats]);

  async function handleAddBrand() {
    if (!newLabel.trim()) return;
    setAddSaving(true);
    await addBrand({ value: '', label: newLabel.trim(), color: newColor, isActive: true, note: newNote || undefined });
    setAddSaving(false);
    setNewLabel(''); setNewColor('#5F17EC'); setNewNote('');
    setAddOpen(false);
  }

  async function toggleBrandActive(b: typeof brandStats[0]) {
    if (b.dbId) {
      await updateBrand(b.dbId, { isActive: !b.isActive });
    } else {
      await addBrand({ value: b.brand, label: b.label, color: b.color, isActive: false });
    }
  }

  async function handleColorChange(b: typeof brandStats[0], color: string) {
    if (b.dbId) {
      await updateBrand(b.dbId, { color });
    } else {
      await addBrand({ value: b.brand, label: b.label, color, isActive: b.isActive });
    }
    setColorEditBrand(null);
  }

  async function handleDelete(b: typeof brandStats[0]) {
    if (b.dbId) await deleteBrand(b.dbId);
    setDeleteConfirm(null);
  }

  async function handleDeleteDbOnly(b: typeof dbBrands[0]) {
    await deleteBrand(b.id);
    setDeleteConfirm(null);
  }

  const topTotal = brandStats[0]?.total ?? 1;

  const visibleBrands = brandStats.filter((b) =>
    !pageSearch || b.label.toLowerCase().includes(pageSearch.toLowerCase()) || b.brand.toLowerCase().includes(pageSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1" style={{ minWidth: '180px' }}>
          <input type="text" placeholder="Marka ara..." value={pageSearch}
            onChange={(e) => setPageSearch(e.target.value)}
            className="w-full pl-4 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">{brandStats.length} marka</p>
        <Button variant="primary" onClick={() => setAddOpen(true)} className="flex-shrink-0">
          <Plus size={14} /> Yeni Marka
        </Button>
      </div>

      {visibleBrands.length === 0 && dbOnlyBrands.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-sm">Henüz markalı işlem yok.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleBrands.map((b, i) => (
            <Card key={b.brand} className={`flex flex-col gap-3 hover:shadow-md transition-shadow group ${!b.isActive ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: b.color }}>
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{b.label}</p>
                    <p className="text-xs text-gray-400">{b.txCount} işlem</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {/* Color picker */}
                  <div className="relative">
                    <button onClick={() => setColorEditBrand(colorEditBrand === b.brand ? null : b.brand)}
                      className="p-1 text-gray-300 hover:text-brand-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Renk değiştir">
                      <Palette size={14} />
                    </button>
                    {colorEditBrand === b.brand && (
                      <div className="absolute right-0 top-7 z-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-3 w-48">
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {COLOR_PRESETS.map((c) => (
                            <button key={c} onClick={() => handleColorChange(b, c)}
                              className={`w-6 h-6 rounded-full transition-all ${b.color === c ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : ''}`}
                              style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        <input type="color" value={b.color}
                          onChange={(e) => handleColorChange(b, e.target.value)}
                          className="w-full h-7 rounded cursor-pointer border border-gray-200 dark:border-gray-700" />
                      </div>
                    )}
                  </div>
                  {/* Toggle */}
                  <button onClick={() => toggleBrandActive(b)}
                    className="p-1 text-gray-400 hover:text-brand-500 transition-colors" title={b.isActive ? 'Pasife al' : 'Aktif et'}>
                    {b.isActive ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}
                  </button>
                  {/* Delete */}
                  {b.dbId && (
                    <button onClick={() => setDeleteConfirm(b.brand)}
                      className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Sil">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-end justify-between mb-1.5">
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <TrendingUp size={11} /> Toplam Gelir
                  </span>
                  <span className="text-base font-bold font-mono text-gray-900 dark:text-white">
                    {formatCurrency(b.total, currency)}
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(b.total / topTotal) * 100}%`, backgroundColor: b.color }} />
                </div>
              </div>

              {b.lastRemaining != null && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <AlertCircle size={13} className="text-amber-500 flex-shrink-0" />
                  <span className="text-xs text-amber-700 dark:text-amber-300">
                    Kalan: <span className="font-semibold font-mono">{formatCurrency(b.lastRemaining, currency)}</span>
                  </span>
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1"><Calendar size={11} />{b.monthCount} ay</span>
                <span className="flex items-center gap-1"><Receipt size={11} />Ort. {formatCurrency(b.avgPerMonth, currency)}/ay</span>
              </div>

              <Link href={`/brands/${b.brand}`}
                className="mt-auto flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                style={{ backgroundColor: b.color + '12', color: b.color }}>
                Detay görüntüle <ArrowRight size={13} />
              </Link>
            </Card>
          ))}

          {/* DB-only brands */}
          {dbOnlyBrands.map((b) => (
            <Card key={b.id} className={`flex flex-col gap-3 border-dashed group ${!b.isActive ? 'opacity-40' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: b.color }}>M</div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{b.label}</p>
                    <p className="text-xs text-gray-400">İşlem yok</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {/* Color picker */}
                  <div className="relative">
                    <button onClick={() => setColorEditBrand(colorEditBrand === b.id ? null : b.id)}
                      className="p-1 text-gray-300 hover:text-brand-500 transition-colors opacity-0 group-hover:opacity-100">
                      <Palette size={14} />
                    </button>
                    {colorEditBrand === b.id && (
                      <div className="absolute right-0 top-7 z-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-3 w-48">
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {COLOR_PRESETS.map((c) => (
                            <button key={c} onClick={() => { updateBrand(b.id, { color: c }); setColorEditBrand(null); }}
                              className={`w-6 h-6 rounded-full transition-all ${b.color === c ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : ''}`}
                              style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        <input type="color" value={b.color}
                          onChange={(e) => { updateBrand(b.id, { color: e.target.value }); setColorEditBrand(null); }}
                          className="w-full h-7 rounded cursor-pointer border border-gray-200 dark:border-gray-700" />
                      </div>
                    )}
                  </div>
                  <button onClick={() => updateBrand(b.id, { isActive: !b.isActive })}
                    className="p-1 text-gray-400 hover:text-brand-500 transition-colors">
                    {b.isActive ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}
                  </button>
                  <button onClick={() => setDeleteConfirm(b.id)}
                    className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center py-2">Henüz gelir kaydı girilmemiş</p>
            </Card>
          ))}
        </div>
      )}

      {/* Add Brand Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Yeni Marka Ekle">
        <div className="space-y-4">
          <div>
            <label className={LABEL_CLS}>Marka / Müşteri Adı</label>
            <input type="text" placeholder="Örn: Acme Ltd." value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)} className={INPUT_CLS} autoFocus />
          </div>
          <div>
            <label className={LABEL_CLS}>Renk</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {COLOR_PRESETS.map((c) => (
                <button key={c} onClick={() => setNewColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${newColor === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                  style={{ backgroundColor: c }} />
              ))}
              <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)}
                className="w-7 h-7 rounded-full cursor-pointer border-0 p-0" title="Özel renk" />
            </div>
          </div>
          <div>
            <label className={LABEL_CLS}>Not (opsiyonel)</label>
            <input type="text" placeholder="Sektör, irtibat vb." value={newNote}
              onChange={(e) => setNewNote(e.target.value)} className={INPUT_CLS} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setAddOpen(false)}>İptal</Button>
            <Button variant="primary" className="flex-1" onClick={handleAddBrand} disabled={!newLabel.trim() || addSaving}>
              {addSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Markayı Sil">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Bu markayı silmek istediğinizden emin misiniz? Mevcut işlemler etkilenmez.
          </p>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteConfirm(null)}>İptal</Button>
            <Button variant="primary" className="flex-1"
              onClick={() => {
                const txBrand = brandStats.find((b) => b.brand === deleteConfirm);
                const dbOnly = dbOnlyBrands.find((b) => b.id === deleteConfirm);
                if (txBrand) handleDelete(txBrand);
                else if (dbOnly) handleDeleteDbOnly(dbOnly);
                else setDeleteConfirm(null);
              }}
              style={{ backgroundColor: '#ef4444' }}>
              <Trash2 size={14} /> Sil
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
