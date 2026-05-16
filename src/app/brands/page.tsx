'use client';

export const runtime = 'edge';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useFinanceStore } from '@/store/useFinanceStore';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { formatCurrency, BRAND_MAP, BRANDS } from '@/lib/utils';
import { Brand, BrandReceivable } from '@/types';
import {
  TrendingUp, ArrowRight, Calendar, Receipt, Plus,
  ToggleLeft, ToggleRight, AlertCircle, Trash2, Palette, Target,
  CheckCircle2, CircleDollarSign, Pencil, LayoutGrid, List, Users, UserX,
} from 'lucide-react';

const INPUT_CLS = 'w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500';
const LABEL_CLS = 'block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5';

const COLOR_PRESETS = [
  '#5F17EC','#3b82f6','#22c55e','#ef4444','#f97316','#eab308',
  '#ec4899','#06b6d4','#8b5cf6','#14b8a6','#0891b2','#64748b',
];

const THIS_MONTH = new Date().toISOString().slice(0, 7);

export default function BrandsPage() {
  const { transactions, currency, brands: dbBrands, addBrand, updateBrand, deleteBrand, brandReceivables, addBrandReceivable, updateBrandReceivable, deleteBrandReceivable } = useFinanceStore();

  const [pageSearch, setPageSearch] = useState('');

  // Add brand modal
  const [addOpen, setAddOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState('#5F17EC');
  const [newNote, setNewNote] = useState('');
  const [addSaving, setAddSaving] = useState(false);

  // Color picker popover
  const [colorEditBrand, setColorEditBrand] = useState<string | null>(null);

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Monthly target modal
  const [targetModal, setTargetModal] = useState<{ brandKey: string; dbId?: string; label: string; color: string } | null>(null);
  const [targetAmount, setTargetAmount] = useState('');
  const [targetCurrency, setTargetCurrencyState] = useState('TRY');
  const [targetDueDay, setTargetDueDay] = useState('1');

  // Receivable modal (sabit + ekstra tahsilat)
  const [receivableModal, setReceivableModal] = useState<{ brandKey: string; label: string; color: string; existing?: BrandReceivable } | null>(null);
  const [recFixed, setRecFixed] = useState('');
  const [recExtra, setRecExtra] = useState('');
  const [recCurrency, setRecCurrencyState] = useState('TRY');
  const [recNote, setRecNote] = useState('');
  const [recMonth, setRecMonth] = useState(THIS_MONTH);

  // Combined BRAND_MAP
  const combinedBrandMap = useMemo(() => {
    const map: Record<string, { label: string; color: string; isActive: boolean; id?: string; monthlyTarget?: number; targetCurrency?: string; dueDay?: number }> = {};
    BRANDS.forEach((b) => { map[b.value] = { label: b.label, color: b.color, isActive: true }; });
    dbBrands.forEach((b) => { map[b.value] = { label: b.label, color: b.color, isActive: b.isActive, id: b.id, monthlyTarget: b.monthlyTarget, targetCurrency: b.targetCurrency, dueDay: b.dueDay }; });
    return map;
  }, [dbBrands]);

  // Brand stats
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
          monthlyTarget: info?.monthlyTarget ?? 0,
          targetCurrency: info?.targetCurrency ?? 'TRY',
          dueDay: info?.dueDay ?? 1,
          total: s.total,
          monthCount: s.months.size,
          txCount: s.count,
          avgPerMonth: s.total / s.months.size,
          lastRemaining: s.lastRemaining,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [transactions, combinedBrandMap]);

  const dbOnlyBrands = useMemo(() => {
    const txBrands = new Set(brandStats.map((b) => b.brand));
    return dbBrands.filter((b) => !txBrands.has(b.value));
  }, [dbBrands, brandStats]);

  // Receivables indexed by brand+month
  const receivableMap = useMemo(() => {
    const map: Record<string, BrandReceivable> = {};
    brandReceivables.forEach((r) => { map[`${r.brand}__${r.month}`] = r; });
    return map;
  }, [brandReceivables]);

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

  function openTargetModal(b: typeof brandStats[0]) {
    setTargetModal({ brandKey: b.brand, dbId: b.dbId, label: b.label, color: b.color });
    setTargetAmount(b.monthlyTarget ? String(b.monthlyTarget) : '');
    setTargetCurrencyState(b.targetCurrency ?? 'TRY');
    const dbInfo = dbBrands.find((d) => d.id === b.dbId);
    setTargetDueDay(String(dbInfo?.dueDay ?? 1));
  }

  function openTargetModalDbOnly(b: typeof dbBrands[0]) {
    setTargetModal({ brandKey: b.value, dbId: b.id, label: b.label, color: b.color });
    setTargetAmount(b.monthlyTarget ? String(b.monthlyTarget) : '');
    setTargetCurrencyState(b.targetCurrency ?? 'TRY');
    setTargetDueDay(String(b.dueDay ?? 1));
  }

  async function saveTarget() {
    if (!targetModal) return;
    const amt = parseFloat(targetAmount) || 0;
    const dd = parseInt(targetDueDay) || 1;
    if (targetModal.dbId) {
      const dbBrand = dbBrands.find((b) => b.id === targetModal.dbId);
      if (dbBrand) await updateBrand(targetModal.dbId, { monthlyTarget: amt, targetCurrency: targetCurrency, dueDay: dd });
    } else {
      const stat = brandStats.find((b) => b.brand === targetModal.brandKey);
      if (stat) await addBrand({ value: stat.brand, label: stat.label, color: stat.color, isActive: stat.isActive, monthlyTarget: amt, targetCurrency: targetCurrency, dueDay: dd });
    }
    setTargetModal(null);
  }

  function openReceivableModal(brandKey: string, label: string, color: string) {
    const existing = receivableMap[`${brandKey}__${THIS_MONTH}`];
    setReceivableModal({ brandKey, label, color, existing });
    setRecFixed(existing ? String(existing.fixedAmount) : '');
    setRecExtra(existing ? String(existing.extraAmount) : '');
    setRecCurrencyState(existing?.currency ?? 'TRY');
    setRecNote(existing?.note ?? '');
    setRecMonth(THIS_MONTH);
  }

  async function saveReceivable() {
    if (!receivableModal) return;
    const payload = {
      brand: receivableModal.brandKey,
      month: recMonth,
      fixedAmount: parseFloat(recFixed) || 0,
      extraAmount: parseFloat(recExtra) || 0,
      currency: recCurrency,
      note: recNote,
    };
    const existing = receivableMap[`${receivableModal.brandKey}__${recMonth}`];
    if (existing) {
      await updateBrandReceivable(existing.id, payload);
    } else {
      await addBrandReceivable(payload);
    }
    setReceivableModal(null);
  }

  const topTotal = brandStats[0]?.total ?? 1;

  const filtered = brandStats.filter((b) =>
    !pageSearch || b.label.toLowerCase().includes(pageSearch.toLowerCase()) || b.brand.toLowerCase().includes(pageSearch.toLowerCase())
  );
  const activeStats = filtered.filter((b) => b.isActive);
  const passiveStats = filtered.filter((b) => !b.isActive);

  const [view, setView] = useState<'table' | 'grid'>('table');

  // Helper to render card actions (color, target, toggle, delete)
  function CardActions({ b }: { b: typeof brandStats[0] }) {
    return (
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <div className="relative">
          <button onClick={() => setColorEditBrand(colorEditBrand === b.brand ? null : b.brand)}
            className="p-1 text-gray-300 hover:text-brand-500 transition-colors opacity-0 group-hover:opacity-100" title="Renk">
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
              <input type="color" value={b.color} onChange={(e) => handleColorChange(b, e.target.value)}
                className="w-full h-7 rounded cursor-pointer border border-gray-200 dark:border-gray-700" />
            </div>
          )}
        </div>
        <button onClick={() => openTargetModal(b)} className="p-1 text-gray-300 hover:text-brand-500 transition-colors opacity-0 group-hover:opacity-100" title="Hedef">
          <Target size={14} />
        </button>
        <button onClick={() => toggleBrandActive(b)} className="p-1 text-gray-400 hover:text-brand-500 transition-colors">
          {b.isActive ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}
        </button>
        {b.dbId && (
          <button onClick={() => setDeleteConfirm(b.brand)} className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
            <Trash2 size={14} />
          </button>
        )}
      </div>
    );
  }

  function BrandCard({ b, rank }: { b: typeof brandStats[0]; rank: number }) {
    const thisMonthRec = receivableMap[`${b.brand}__${THIS_MONTH}`];
    const thisMonthTotal = thisMonthRec ? (thisMonthRec.fixedAmount + thisMonthRec.extraAmount) : 0;
    const hasTarget = b.monthlyTarget > 0;
    const balance = hasTarget ? b.monthlyTarget - thisMonthTotal : null;
    return (
      <Card className="flex flex-col gap-3 hover:shadow-md transition-shadow group">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: b.color }}>{rank}</div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{b.label}</p>
              <p className="text-xs text-gray-400">{b.txCount} işlem</p>
            </div>
          </div>
          <CardActions b={b} />
        </div>
        {hasTarget && (
          <div className="rounded-lg border border-gray-100 dark:border-gray-800 overflow-hidden text-xs">
            <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50">
              <span className="text-gray-400 flex items-center gap-1"><Target size={10} /> Aylık Hedef</span>
              <span className="font-semibold font-mono text-gray-700 dark:text-gray-300">{formatCurrency(b.monthlyTarget, b.targetCurrency ?? 'TRY')}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-1.5">
              <span className="text-gray-400 flex items-center gap-1"><CircleDollarSign size={10} /> Bu Ay</span>
              <span className={`font-semibold font-mono ${thisMonthTotal >= b.monthlyTarget ? 'text-green-600 dark:text-green-400' : 'text-orange-500'}`}>
                {thisMonthTotal > 0 ? formatCurrency(thisMonthTotal, thisMonthRec?.currency ?? 'TRY') : '—'}
              </span>
            </div>
            {balance !== null && (
              <div className={`flex items-center justify-between px-3 py-1.5 border-t border-gray-100 dark:border-gray-800 ${balance <= 0 ? 'bg-green-50 dark:bg-green-900/10' : 'bg-orange-50 dark:bg-orange-900/10'}`}>
                <span className={balance <= 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-500'}>{balance <= 0 ? '✓ Tamamlandı' : 'Kalan Alacak'}</span>
                <span className={`font-semibold font-mono ${balance <= 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-500'}`}>
                  {balance <= 0 ? formatCurrency(Math.abs(balance), b.targetCurrency ?? 'TRY') + ' fazla' : formatCurrency(balance, b.targetCurrency ?? 'TRY')}
                </span>
              </div>
            )}
          </div>
        )}
        <button onClick={() => openReceivableModal(b.brand, b.label, b.color)}
          className="flex items-center justify-center gap-1.5 w-full px-3 py-1.5 rounded-lg border border-dashed text-xs font-medium transition-colors"
          style={{ borderColor: b.color + '60', color: b.color }}>
          <Plus size={11} />{thisMonthRec ? 'Bu Ay Tahsilatı Düzenle' : 'Bu Ay Tahsilat Ekle'}
        </button>
        <div>
          <div className="flex items-end justify-between mb-1.5">
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"><TrendingUp size={11} /> Toplam Gelir</span>
            <span className="text-base font-bold font-mono text-gray-900 dark:text-white">{formatCurrency(b.total, currency)}</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${(b.total / topTotal) * 100}%`, backgroundColor: b.color }} />
          </div>
        </div>
        {b.lastRemaining != null && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <AlertCircle size={13} className="text-amber-500 flex-shrink-0" />
            <span className="text-xs text-amber-700 dark:text-amber-300">Kalan: <span className="font-semibold font-mono">{formatCurrency(b.lastRemaining, currency)}</span></span>
          </div>
        )}
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1"><Calendar size={11} />{b.monthCount} ay</span>
          <span className="flex items-center gap-1"><Receipt size={11} />Ort. {formatCurrency(b.avgPerMonth, currency)}/ay</span>
        </div>
        <Link href={`/brands/${b.brand}`}
          className="mt-auto flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium"
          style={{ backgroundColor: b.color + '12', color: b.color }}>
          Detay <ArrowRight size={13} />
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1" style={{ minWidth: '180px' }}>
          <input type="text" placeholder="Marka / müşteri ara..." value={pageSearch}
            onChange={(e) => setPageSearch(e.target.value)}
            className="w-full pl-4 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden flex-shrink-0">
          <button onClick={() => setView('table')}
            className={`px-2.5 py-1.5 text-xs font-medium flex items-center gap-1 transition-colors ${view === 'table' ? 'bg-brand-500 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <List size={13} /> Tablo
          </button>
          <button onClick={() => setView('grid')}
            className={`px-2.5 py-1.5 text-xs font-medium flex items-center gap-1 transition-colors ${view === 'grid' ? 'bg-brand-500 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <LayoutGrid size={13} /> Kart
          </button>
        </div>
        <Button variant="primary" onClick={() => setAddOpen(true)} className="flex-shrink-0">
          <Plus size={14} /> Yeni Marka
        </Button>
      </div>

      {brandStats.length === 0 && dbOnlyBrands.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-sm">Henüz marka / müşteri yok.</p>
        </div>
      ) : (
        <>
          {/* ── AKTİF MÜŞTERİLER ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Users size={15} className="text-green-500" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Aktif Müşteriler</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">{activeStats.length + dbOnlyBrands.filter(b => b.isActive).length}</span>
            </div>

            {view === 'table' ? (
              <Card padding="sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 text-xs font-medium text-gray-400">
                        <th className="text-left pb-2 pl-3 w-8">#</th>
                        <th className="text-left pb-2 px-3">Marka / Müşteri</th>
                        <th className="text-right pb-2 px-3">Toplam Gelir</th>
                        <th className="text-right pb-2 px-3">Ort./Ay</th>
                        <th className="text-right pb-2 px-3">Aylık Hedef</th>
                        <th className="text-right pb-2 px-3">Bu Ay Tahsilat</th>
                        <th className="text-center pb-2 px-3">Son Gün</th>
                        <th className="text-center pb-2 px-3">Durum</th>
                        <th className="pb-2 pr-3 w-24" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                      {activeStats.map((b, i) => {
                        const rec = receivableMap[`${b.brand}__${THIS_MONTH}`];
                        const received = rec ? rec.fixedAmount + rec.extraAmount : 0;
                        const hasTarget = b.monthlyTarget > 0;
                        const today = new Date().getDate();
                        const complete = hasTarget && received >= b.monthlyTarget;
                        const overdue = hasTarget && !complete && today > b.dueDay;
                        return (
                          <tr key={b.brand} className="group hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                            <td className="py-3 pl-3">
                              <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[11px] font-bold"
                                style={{ backgroundColor: b.color }}>{i + 1}</div>
                            </td>
                            <td className="py-3 px-3">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{b.label}</p>
                                <p className="text-xs text-gray-400">{b.txCount} işlem · {b.monthCount} ay</p>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-semibold text-gray-900 dark:text-white">{formatCurrency(b.total, currency)}</td>
                            <td className="py-3 px-3 text-right font-mono text-gray-500 text-xs">{formatCurrency(b.avgPerMonth, currency)}</td>
                            <td className="py-3 px-3 text-right font-mono text-gray-600 dark:text-gray-400 text-xs">
                              {hasTarget ? formatCurrency(b.monthlyTarget, b.targetCurrency ?? 'TRY') : <span className="text-gray-300">—</span>}
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-xs">
                              {received > 0
                                ? <span className={complete ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-orange-500'}>{formatCurrency(received, rec?.currency ?? 'TRY')}</span>
                                : <span className="text-gray-300">—</span>}
                            </td>
                            <td className="py-3 px-3 text-center text-xs text-gray-500">
                              {hasTarget ? `${b.dueDay}.` : '—'}
                            </td>
                            <td className="py-3 px-3 text-center">
                              {!hasTarget ? <span className="text-gray-300 text-xs">—</span>
                                : complete ? <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium"><CheckCircle2 size={11} /> Ödendi</span>
                                : overdue ? <span className="inline-flex items-center gap-1 text-xs text-red-500 font-medium"><AlertCircle size={11} /> Gecikti</span>
                                : <span className="text-xs text-orange-500">Bekliyor</span>}
                            </td>
                            <td className="py-3 pr-3">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                                <button onClick={() => openReceivableModal(b.brand, b.label, b.color)}
                                  className="p-1 rounded text-gray-400 hover:text-green-500" title="Tahsilat ekle"><CircleDollarSign size={13} /></button>
                                <button onClick={() => openTargetModal(b)}
                                  className="p-1 rounded text-gray-400 hover:text-brand-500" title="Hedef"><Target size={13} /></button>
                                <button onClick={() => toggleBrandActive(b)}
                                  className="p-1 rounded text-gray-400 hover:text-orange-500" title="Pasife al"><ToggleRight size={15} className="text-green-500" /></button>
                                <Link href={`/brands/${b.brand}`} className="p-1 rounded text-gray-400 hover:text-brand-500"><ArrowRight size={13} /></Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {dbOnlyBrands.filter(b => b.isActive).map((b) => {
                        const rec = receivableMap[`${b.value}__${THIS_MONTH}`];
                        const received = rec ? rec.fixedAmount + rec.extraAmount : 0;
                        return (
                          <tr key={b.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors opacity-60">
                            <td className="py-3 pl-3">
                              <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[11px] font-bold"
                                style={{ backgroundColor: b.color }}>—</div>
                            </td>
                            <td className="py-3 px-3">
                              <p className="font-medium text-gray-900 dark:text-white">{b.label}</p>
                              <p className="text-xs text-gray-400">İşlem yok</p>
                            </td>
                            <td className="py-3 px-3 text-right text-gray-300 text-xs">—</td>
                            <td className="py-3 px-3 text-right text-gray-300 text-xs">—</td>
                            <td className="py-3 px-3 text-right font-mono text-xs text-gray-500">
                              {(b.monthlyTarget ?? 0) > 0 ? formatCurrency(b.monthlyTarget!, b.targetCurrency ?? 'TRY') : '—'}
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-xs">
                              {received > 0 ? formatCurrency(received, rec?.currency ?? 'TRY') : <span className="text-gray-300">—</span>}
                            </td>
                            <td className="py-3 px-3 text-center text-xs text-gray-400">{(b.dueDay ?? 0) > 0 ? `${b.dueDay}.` : '—'}</td>
                            <td className="py-3 px-3 text-center text-xs text-gray-300">—</td>
                            <td className="py-3 pr-3">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 justify-end">
                                <button onClick={() => openReceivableModal(b.value, b.label, b.color)}
                                  className="p-1 rounded text-gray-400 hover:text-green-500"><CircleDollarSign size={13} /></button>
                                <button onClick={() => openTargetModalDbOnly(b)}
                                  className="p-1 rounded text-gray-400 hover:text-brand-500"><Target size={13} /></button>
                                <button onClick={() => updateBrand(b.id, { isActive: false })}
                                  className="p-1 rounded text-gray-400 hover:text-orange-500"><ToggleRight size={15} className="text-green-500" /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {activeStats.length > 0 && (
                      <tfoot>
                        <tr className="border-t border-gray-200 dark:border-gray-700 text-xs font-semibold">
                          <td className="pt-2 pl-3 text-gray-400" colSpan={2}>{activeStats.length} aktif müşteri</td>
                          <td className="pt-2 px-3 text-right font-mono text-gray-900 dark:text-white">{formatCurrency(activeStats.reduce((s, b) => s + b.total, 0), currency)}</td>
                          <td />
                          <td className="pt-2 px-3 text-right font-mono text-gray-600 dark:text-gray-400">
                            {formatCurrency(activeStats.filter(b => b.monthlyTarget > 0).reduce((s, b) => s + b.monthlyTarget, 0), currency)}
                          </td>
                          <td className="pt-2 px-3 text-right font-mono text-green-600 dark:text-green-400">
                            {formatCurrency(activeStats.reduce((s, b) => { const r = receivableMap[`${b.brand}__${THIS_MONTH}`]; return s + (r ? r.fixedAmount + r.extraAmount : 0); }, 0), currency)}
                          </td>
                          <td colSpan={3} />
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeStats.map((b, i) => <BrandCard key={b.brand} b={b} rank={i + 1} />)}
                {dbOnlyBrands.filter(b => b.isActive).map((b) => (
                  <Card key={b.id} className="flex flex-col gap-3 border-dashed group">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: b.color }}>M</div>
                        <div><p className="font-semibold text-gray-900 dark:text-white text-sm">{b.label}</p><p className="text-xs text-gray-400">İşlem yok</p></div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => openTargetModalDbOnly(b)} className="p-1 text-gray-300 hover:text-brand-500 opacity-0 group-hover:opacity-100"><Target size={14} /></button>
                        <button onClick={() => updateBrand(b.id, { isActive: false })} className="p-1 text-gray-400"><ToggleRight size={18} className="text-green-500" /></button>
                        <button onClick={() => setDeleteConfirm(b.id)} className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <button onClick={() => openReceivableModal(b.value, b.label, b.color)}
                      className="flex items-center justify-center gap-1.5 w-full px-3 py-1.5 rounded-lg border border-dashed text-xs font-medium"
                      style={{ borderColor: b.color + '60', color: b.color }}>
                      <Plus size={11} /> Bu Ay Tahsilat Ekle
                    </button>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* ── PASİF MÜŞTERİLER ── */}
          {(passiveStats.length > 0 || dbOnlyBrands.filter(b => !b.isActive).length > 0) && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <UserX size={15} className="text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Pasif Müşteriler</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 font-medium">{passiveStats.length + dbOnlyBrands.filter(b => !b.isActive).length}</span>
              </div>
              <Card padding="sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 text-xs font-medium text-gray-400">
                        <th className="text-left pb-2 pl-3">Marka / Müşteri</th>
                        <th className="text-right pb-2 px-3">Toplam Gelir</th>
                        <th className="text-right pb-2 px-3">Ort./Ay</th>
                        <th className="text-right pb-2 px-3">Son İşlem</th>
                        <th className="pb-2 pr-3 w-20" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50 opacity-60">
                      {passiveStats.map((b) => (
                        <tr key={b.brand} className="group hover:opacity-100 transition-opacity">
                          <td className="py-2.5 pl-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: b.color }}>
                                {b.label.slice(0, 2).toUpperCase()}
                              </div>
                              <span className="font-medium text-gray-700 dark:text-gray-300 text-xs">{b.label}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-xs text-gray-600 dark:text-gray-400">{formatCurrency(b.total, currency)}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-xs text-gray-400">{formatCurrency(b.avgPerMonth, currency)}</td>
                          <td className="py-2.5 px-3 text-right text-xs text-gray-400">{b.monthCount} ay</td>
                          <td className="py-2.5 pr-3">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 justify-end">
                              <button onClick={() => toggleBrandActive(b)} className="p-1 text-gray-300 hover:text-green-500" title="Aktife al"><ToggleLeft size={15} /></button>
                              <Link href={`/brands/${b.brand}`} className="p-1 text-gray-300 hover:text-brand-500"><ArrowRight size={13} /></Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {dbOnlyBrands.filter(b => !b.isActive).map((b) => (
                        <tr key={b.id} className="group hover:opacity-100 transition-opacity">
                          <td className="py-2.5 pl-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: b.color }}>
                                {b.label.slice(0, 2).toUpperCase()}
                              </div>
                              <span className="font-medium text-gray-700 dark:text-gray-300 text-xs">{b.label}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right text-xs text-gray-300">—</td>
                          <td className="py-2.5 px-3 text-right text-xs text-gray-300">—</td>
                          <td className="py-2.5 px-3 text-right text-xs text-gray-300">—</td>
                          <td className="py-2.5 pr-3">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 justify-end">
                              <button onClick={() => updateBrand(b.id, { isActive: true })} className="p-1 text-gray-300 hover:text-green-500"><ToggleLeft size={15} /></button>
                              <button onClick={() => setDeleteConfirm(b.id)} className="p-1 text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </section>
          )}
        </>
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
                className="w-7 h-7 rounded-full cursor-pointer border-0 p-0" />
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

      {/* Monthly Target Modal */}
      <Modal open={!!targetModal} onClose={() => setTargetModal(null)} title="Aylık Hedef Belirle">
        {targetModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-800">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: targetModal.color }}>{targetModal.label.slice(0, 2).toUpperCase()}</div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{targetModal.label}</span>
            </div>
            <p className="text-xs text-gray-500">Bu markadan her ay alınması beklenen sabit ödeme tutarı.</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>Aylık Hedef Tutar</label>
                <input type="number" placeholder="0.00" value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)} className={INPUT_CLS} autoFocus />
              </div>
              <div>
                <label className={LABEL_CLS}>Para Birimi</label>
                <select value={targetCurrency} onChange={(e) => setTargetCurrencyState(e.target.value)} className={INPUT_CLS}>
                  {['TRY', 'USD', 'EUR', 'GBP'].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={LABEL_CLS}>Ödeme Son Günü (ayın kaçı)</label>
              <input type="number" min={1} max={31} placeholder="1-31" value={targetDueDay}
                onChange={(e) => setTargetDueDay(e.target.value)} className={INPUT_CLS} />
              <p className="text-xs text-gray-400 mt-1">Her ayın bu gününe kadar ödeme bekleniyor.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" className="flex-1" onClick={() => setTargetModal(null)}>İptal</Button>
              <Button variant="primary" className="flex-1" onClick={saveTarget}>Kaydet</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Receivable Modal */}
      <Modal open={!!receivableModal} onClose={() => setReceivableModal(null)} title="Aylık Tahsilat Girişi">
        {receivableModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-800">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: receivableModal.color }}>{receivableModal.label.slice(0, 2).toUpperCase()}</div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{receivableModal.label}</span>
            </div>

            <div>
              <label className={LABEL_CLS}>Ay</label>
              <input type="month" value={recMonth} onChange={(e) => {
                setRecMonth(e.target.value);
                const existing = receivableMap[`${receivableModal.brandKey}__${e.target.value}`];
                if (existing) { setRecFixed(String(existing.fixedAmount)); setRecExtra(String(existing.extraAmount)); setRecNote(existing.note ?? ''); }
                else { setRecFixed(''); setRecExtra(''); setRecNote(''); }
              }} className={INPUT_CLS} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>Sabit Tahsilat</label>
                <input type="number" placeholder="0.00" value={recFixed}
                  onChange={(e) => setRecFixed(e.target.value)} className={INPUT_CLS} autoFocus />
                <p className="text-xs text-gray-400 mt-1">Retainer / aylık sabit</p>
              </div>
              <div>
                <label className={LABEL_CLS}>Ekstra Tahsilat</label>
                <input type="number" placeholder="0.00" value={recExtra}
                  onChange={(e) => setRecExtra(e.target.value)} className={INPUT_CLS} />
                <p className="text-xs text-gray-400 mt-1">Ek proje / fazla mesai</p>
              </div>
            </div>

            {(recFixed || recExtra) && (
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs">
                <span className="text-gray-500">Toplam Tahsilat</span>
                <span className="font-semibold font-mono text-green-600 dark:text-green-400">
                  {formatCurrency((parseFloat(recFixed) || 0) + (parseFloat(recExtra) || 0), recCurrency)}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>Para Birimi</label>
                <select value={recCurrency} onChange={(e) => setRecCurrencyState(e.target.value)} className={INPUT_CLS}>
                  {['TRY', 'USD', 'EUR', 'GBP'].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL_CLS}>Not</label>
                <input type="text" placeholder="Fatura no, açıklama..." value={recNote}
                  onChange={(e) => setRecNote(e.target.value)} className={INPUT_CLS} />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" className="flex-1" onClick={() => setReceivableModal(null)}>İptal</Button>
              <Button variant="primary" className="flex-1" onClick={saveReceivable}>Kaydet</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Markayı Sil">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Bu markayı silmek istediğinizden emin misiniz?</p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteConfirm(null)}>İptal</Button>
            <Button variant="primary" className="flex-1" style={{ backgroundColor: '#ef4444' }}
              onClick={() => {
                const txBrand = brandStats.find((b) => b.brand === deleteConfirm);
                const dbOnly = dbOnlyBrands.find((b) => b.id === deleteConfirm);
                if (txBrand) handleDelete(txBrand);
                else if (dbOnly) handleDeleteDbOnly(dbOnly);
                else setDeleteConfirm(null);
              }}>
              <Trash2 size={14} /> Sil
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
