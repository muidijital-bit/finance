'use client';

export const runtime = 'edge';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useFinanceStore } from '@/store/useFinanceStore';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { formatCurrency, BRAND_MAP, BRANDS } from '@/lib/utils';
import { TrendingUp, ArrowRight, Calendar, Receipt, Settings2, Merge, Check, ChevronDown, Search, Pencil, X } from 'lucide-react';

const INPUT_CLS = 'w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500';

export default function BrandsPage() {
  const { transactions, currency, rebrandTransactions } = useFinanceStore();

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

  // All brands that exist in transaction data
  const brandStats = useMemo(() => {
    const map = new Map<string, { total: number; months: Set<string>; count: number; lastDate: string }>();
    transactions.forEach((t) => {
      if (t.type !== 'income' || !t.brand) return;
      const key = t.brand;
      if (!map.has(key)) map.set(key, { total: 0, months: new Set(), count: 0, lastDate: '' });
      const s = map.get(key)!;
      s.total += t.amount;
      s.months.add(t.date.slice(0, 7));
      s.count += 1;
      if (!s.lastDate || t.date > s.lastDate) s.lastDate = t.date;
    });
    return Array.from(map.entries())
      .map(([brand, s]) => ({
        brand,
        label: BRAND_MAP[brand]?.label ?? brand,
        color: BRAND_MAP[brand]?.color ?? '#9ca3af',
        total: s.total,
        monthCount: s.months.size,
        txCount: s.count,
        avgPerMonth: s.total / s.months.size,
      }))
      .sort((a, b) => b.total - a.total);
  }, [transactions]);

  // All brand options for target dropdown (data brands + BRANDS list)
  const allBrandOptions = useMemo(() => {
    const map = new Map(BRANDS.map((b) => [b.value, b.label]));
    brandStats.forEach((b) => { if (!map.has(b.brand)) map.set(b.brand, b.label); });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [brandStats]);

  function toggleSelect(brand: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(brand) ? next.delete(brand) : next.add(brand);
      return next;
    });
    setDone(false);
  }

  function openManage() {
    setSelected(new Set());
    setTargetBrand('');
    setTargetCustom('');
    setDone(false);
    setBrandSearch('');
    setEditingBrand(null);
    setEditingName('');
    setManageOpen(true);
  }

  async function handleInlineRename() {
    const newName = editingName.trim();
    if (!newName || !editingBrand || newName === editingBrand) { setEditingBrand(null); return; }
    setSaving(true);
    await rebrandTransactions([editingBrand], newName);
    setSaving(false);
    setEditingBrand(null);
    setEditingName('');
    setDone(true);
  }

  async function handleMerge() {
    const to = targetBrand === '__custom__' ? targetCustom.trim() : targetBrand;
    if (!to || selected.size < 1) return;
    // If merging INTO one of the selected, that's fine; if renaming single, also fine
    const fromList = Array.from(selected);
    setSaving(true);
    await rebrandTransactions(fromList, to);
    setSaving(false);
    setDone(true);
    setSelected(new Set());
    setTargetBrand('');
    setTargetCustom('');
  }

  const resolvedTarget = targetBrand === '__custom__' ? targetCustom.trim() : targetBrand;
  const canMerge = selected.size >= 1 && resolvedTarget;

  const topTotal = brandStats[0]?.total ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1" style={{ minWidth: '180px' }}>
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Marka ara..." value={pageSearch}
            onChange={(e) => setPageSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
          {brandStats.length} marka · toplam gelire göre sıralı
        </p>
        <Button variant="secondary" onClick={openManage} className="flex-shrink-0">
          <Settings2 size={14} /> Marka Yönetimi
        </Button>
      </div>

      {brandStats.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-sm">Henüz markalı işlem yok.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {brandStats.filter((b) => !pageSearch || b.label.toLowerCase().includes(pageSearch.toLowerCase()) || b.brand.toLowerCase().includes(pageSearch.toLowerCase())).map((b, i) => (
            <Card key={b.brand} className="flex flex-col gap-3 hover:shadow-md transition-shadow">
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
                <div className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: b.color + '18', color: b.color }}>
                  #{i + 1}
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

              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1"><Calendar size={11} />{b.monthCount} ay</span>
                <span className="flex items-center gap-1"><Receipt size={11} />Ort. {formatCurrency(b.avgPerMonth, currency)}/ay</span>
              </div>

              <Link href={`/brands/${b.brand}`}
                className="mt-auto flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                style={{ backgroundColor: b.color + '12', color: b.color }}>
                Detay görüntüle
                <ArrowRight size={13} />
              </Link>
            </Card>
          ))}
        </div>
      )}

      {/* Brand Management Modal */}
      <Modal open={manageOpen} onClose={() => setManageOpen(false)} title="Marka Yönetimi" width="max-w-xl">
        <div className="space-y-5">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Birleştirmek veya yeniden adlandırmak istediğiniz markaları seçin, ardından hedef markayı belirleyin.
          </p>

          {/* Brand checklist */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <Search size={12} className="text-gray-400 flex-shrink-0" />
              <input type="text" placeholder="Marka ara..." value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className="flex-1 text-xs bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400" />
              <span className="text-xs text-gray-400 flex-shrink-0">
                {selected.size > 0 && <span className="text-brand-600 dark:text-brand-400">{selected.size} seçili</span>}
              </span>
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
                    {/* Checkbox */}
                    <button onClick={() => { if (!isEditing) toggleSelect(b.brand); }}
                      className="flex-shrink-0">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
                        isSelected ? 'bg-brand-500 border-brand-500' : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {isSelected && <Check size={11} className="text-white" />}
                      </div>
                    </button>
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: b.color }} />

                    {/* Inline edit or label */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input autoFocus type="text" value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleInlineRename(); if (e.key === 'Escape') setEditingBrand(null); }}
                            className="flex-1 text-sm px-2 py-0.5 border border-brand-400 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none" />
                          <button onClick={handleInlineRename} className="p-1 text-green-500 hover:text-green-600">
                            <Check size={13} />
                          </button>
                          <button onClick={() => setEditingBrand(null)} className="p-1 text-gray-400 hover:text-gray-600">
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{b.label}</span>
                      )}
                    </div>

                    <span className="text-xs text-gray-400 flex-shrink-0">{b.txCount} işlem</span>

                    {/* Edit button */}
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

          {/* Target brand */}
          {selected.size >= 1 && (
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                <Merge size={12} />
                {selected.size === 1 ? 'Yeni marka adı (yeniden adlandır)' : `${selected.size} markayı birleştir →`}
              </label>
              <div className="relative">
                <select value={targetBrand} onChange={(e) => { setTargetBrand(e.target.value); setTargetCustom(''); setDone(false); }}
                  className={INPUT_CLS}>
                  <option value="">— Hedef marka seçin —</option>
                  <optgroup label="Mevcut markalar">
                    {allBrandOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
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

              {/* Preview */}
              {resolvedTarget && selected.size > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                  {Array.from(selected).map((s) => (
                    <span key={s} className="inline-block mr-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{BRAND_MAP[s]?.label ?? s}</span>
                    </span>
                  ))}
                  <span className="mx-1">→</span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400">
                    {BRAND_MAP[resolvedTarget]?.label ?? resolvedTarget}
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
            <Button variant="primary" className="flex-1" onClick={handleMerge}
              disabled={!canMerge || saving}>
              <Merge size={14} />
              {saving ? 'Kaydediliyor...' : selected.size === 1 ? 'Yeniden Adlandır' : `${selected.size} Markayı Birleştir`}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
