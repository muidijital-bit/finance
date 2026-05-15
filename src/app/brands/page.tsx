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
  TrendingUp, ArrowRight, Calendar, Receipt, Settings2, Merge, Check,
  ChevronDown, Search, Pencil, X, Plus, ToggleLeft, ToggleRight, AlertCircle,
} from 'lucide-react';

const INPUT_CLS = 'w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500';
const LABEL_CLS = 'block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5';

const COLOR_PRESETS = [
  '#5F17EC','#3b82f6','#22c55e','#ef4444','#f97316','#eab308',
  '#ec4899','#06b6d4','#8b5cf6','#14b8a6','#0891b2','#64748b',
];

export default function BrandsPage() {
  const { transactions, currency, rebrandTransactions, brands: dbBrands, addBrand, updateBrand, deleteBrand } = useFinanceStore();

  // Manage modal state
  const [manageOpen, setManageOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [targetBrand, setTargetBrand] = useState('');
  const [targetCustom, setTargetCustom] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');
  const [editingBrand, setEditingBrand] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [pageSearch, setPageSearch] = useState('');

  // New brand modal
  const [addOpen, setAddOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState('#5F17EC');
  const [newNote, setNewNote] = useState('');
  const [addSaving, setAddSaving] = useState(false);

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

  // Also show DB-only brands (no transactions yet)
  const dbOnlyBrands = useMemo(() => {
    const txBrands = new Set(brandStats.map((b) => b.brand));
    return dbBrands.filter((b) => !txBrands.has(b.value));
  }, [dbBrands, brandStats]);

  const allBrandOptions = useMemo(() => {
    const map = new Map(BRANDS.map((b) => [b.value, b.label]));
    dbBrands.forEach((b) => map.set(b.value, b.label));
    brandStats.forEach((b) => { if (!map.has(b.brand)) map.set(b.brand, b.label); });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [brandStats, dbBrands]);

  function toggleSelect(brand: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(brand) ? next.delete(brand) : next.add(brand);
      return next;
    });
    setDone(false);
  }

  function openManage() {
    setSelected(new Set()); setTargetBrand(''); setTargetCustom('');
    setDone(false); setBrandSearch(''); setEditingBrand(null); setEditingName('');
    setManageOpen(true);
  }

  async function handleMerge() {
    const to = targetBrand === '__custom__' ? targetCustom.trim() : targetBrand;
    if (!to || selected.size < 1) return;
    setSaving(true);
    await rebrandTransactions(Array.from(selected), to);
    setSaving(false);
    setDone(true);
    setSelected(new Set()); setTargetBrand(''); setTargetCustom('');
  }

  async function handleInlineRename() {
    const newName = editingName.trim();
    if (!newName || !editingBrand || newName === editingBrand) { setEditingBrand(null); return; }
    setSaving(true);
    await rebrandTransactions([editingBrand], newName);
    setSaving(false);
    setEditingBrand(null); setEditingName(''); setDone(true);
  }

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
      // Brand not in DB yet — create it first, then it'll have isActive=false
      await addBrand({ value: b.brand, label: b.label, color: b.color, isActive: false });
    }
  }

  const resolvedTarget = targetBrand === '__custom__' ? targetCustom.trim() : targetBrand;
  const canMerge = selected.size >= 1 && resolvedTarget;
  const topTotal = brandStats[0]?.total ?? 1;

  const visibleBrands = brandStats.filter((b) =>
    !pageSearch || b.label.toLowerCase().includes(pageSearch.toLowerCase()) || b.brand.toLowerCase().includes(pageSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1" style={{ minWidth: '180px' }}>
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Marka ara..." value={pageSearch}
            onChange={(e) => setPageSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">{brandStats.length} marka</p>
        <Button variant="secondary" onClick={openManage} className="flex-shrink-0">
          <Settings2 size={14} /> Birleştir / Yeniden Adlandır
        </Button>
        <Button variant="primary" onClick={() => setAddOpen(true)} className="flex-shrink-0">
          <Plus size={14} /> Yeni Marka
        </Button>
      </div>

      {/* Brand grid from transactions */}
      {visibleBrands.length === 0 && dbOnlyBrands.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-sm">Henüz markalı işlem yok.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleBrands.map((b, i) => (
            <Card key={b.brand} className={`flex flex-col gap-3 hover:shadow-md transition-shadow ${!b.isActive ? 'opacity-50' : ''}`}>
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
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => toggleBrandActive(b)}
                    className="p-1 text-gray-400 hover:text-brand-500 transition-colors" title={b.isActive ? 'Pasife al' : 'Aktif et'}>
                    {b.isActive ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}
                  </button>
                  <div className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: b.color + '18', color: b.color }}>#{i + 1}</div>
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

              {/* Remaining balance */}
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

          {/* DB-only brands (no transactions yet) */}
          {dbOnlyBrands.map((b) => (
            <Card key={b.id} className={`flex flex-col gap-3 border-dashed ${!b.isActive ? 'opacity-40' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: b.color }}>M</div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{b.label}</p>
                    <p className="text-xs text-gray-400">İşlem yok</p>
                  </div>
                </div>
                <button onClick={() => updateBrand(b.id, { isActive: !b.isActive })}
                  className="p-1 text-gray-400 hover:text-brand-500 transition-colors">
                  {b.isActive ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}
                </button>
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

      {/* Brand Management Modal */}
      <Modal open={manageOpen} onClose={() => setManageOpen(false)} title="Marka Yönetimi" width="max-w-xl">
        <div className="space-y-5">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Birleştirmek veya yeniden adlandırmak istediğiniz markaları seçin.
          </p>

          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <Search size={12} className="text-gray-400 flex-shrink-0" />
              <input type="text" placeholder="Marka ara..." value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className="flex-1 text-xs bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400" />
              {selected.size > 0 && <span className="text-xs text-brand-600 dark:text-brand-400 flex-shrink-0">{selected.size} seçili</span>}
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-64 overflow-y-auto">
              {brandStats.filter((b) => !brandSearch || b.label.toLowerCase().includes(brandSearch.toLowerCase())).map((b) => {
                const isSelected = selected.has(b.brand);
                const isEditing = editingBrand === b.brand;
                return (
                  <div key={b.brand}
                    className={`flex items-center gap-2 px-3 py-2.5 transition-colors ${
                      isSelected ? 'bg-brand-50 dark:bg-brand-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}>
                    <button onClick={() => { if (!isEditing) toggleSelect(b.brand); }} className="flex-shrink-0">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
                        isSelected ? 'bg-brand-500 border-brand-500' : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {isSelected && <Check size={11} className="text-white" />}
                      </div>
                    </button>
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: b.color }} />
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input autoFocus type="text" value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleInlineRename(); if (e.key === 'Escape') setEditingBrand(null); }}
                            className="flex-1 text-sm px-2 py-0.5 border border-brand-400 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none" />
                          <button onClick={handleInlineRename} className="p-1 text-green-500 hover:text-green-600"><Check size={13} /></button>
                          <button onClick={() => setEditingBrand(null)} className="p-1 text-gray-400 hover:text-gray-600"><X size={13} /></button>
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{b.label}</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{b.txCount} işlem</span>
                    {!isEditing && (
                      <button onClick={() => { setEditingBrand(b.brand); setEditingName(b.label); setDone(false); }}
                        className="flex-shrink-0 p-1 text-gray-300 hover:text-brand-500 transition-colors">
                        <Pencil size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {selected.size >= 1 && (
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                <Merge size={12} />
                {selected.size === 1 ? 'Yeni marka adı' : `${selected.size} markayı birleştir →`}
              </label>
              <div className="relative">
                <select value={targetBrand} onChange={(e) => { setTargetBrand(e.target.value); setTargetCustom(''); setDone(false); }}
                  className={INPUT_CLS}>
                  <option value="">— Hedef marka seçin —</option>
                  <optgroup label="Mevcut markalar">
                    {allBrandOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </optgroup>
                  <option value="__custom__">+ Yeni marka adı gir...</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
              </div>
              {targetBrand === '__custom__' && (
                <input type="text" placeholder="Yeni marka adı" value={targetCustom}
                  onChange={(e) => { setTargetCustom(e.target.value); setDone(false); }}
                  className={INPUT_CLS} autoFocus />
              )}
              {resolvedTarget && selected.size > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                  {Array.from(selected).map((s) => (
                    <span key={s} className="inline-block mr-1 font-medium text-gray-700 dark:text-gray-300">
                      {combinedBrandMap[s]?.label ?? s}
                    </span>
                  ))}
                  <span className="mx-1">→</span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400">
                    {combinedBrandMap[resolvedTarget]?.label ?? resolvedTarget}
                  </span>
                </div>
              )}
            </div>
          )}

          {done && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">
              <Check size={14} /> Markalar başarıyla güncellendi
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setManageOpen(false)}>Kapat</Button>
            <Button variant="primary" className="flex-1" onClick={handleMerge} disabled={!canMerge || saving}>
              <Merge size={14} />
              {saving ? 'Kaydediliyor...' : selected.size === 1 ? 'Yeniden Adlandır' : `${selected.size} Markayı Birleştir`}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
