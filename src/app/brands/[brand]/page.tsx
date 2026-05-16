'use client';

export const runtime = 'edge';

import { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFinanceStore } from '@/store/useFinanceStore';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { formatCurrency, formatDate, BRAND_MAP, SERVICE_LABELS, MONTHS_TR } from '@/lib/utils';
import { ArrowLeft, TrendingUp, Calendar, Receipt, AlertCircle, CheckCircle2, Plus, Trash2, StickyNote, Target, CircleDollarSign, Pencil } from 'lucide-react';
import { BrandNote, BrandReceivable } from '@/types';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

function getMonthRange(dates: string[]): string[] {
  if (dates.length === 0) return [];
  const sorted = [...dates].sort();
  const start = sorted[0].slice(0, 7);
  const now = new Date();
  const end = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const months: string[] = [];
  let [y, m] = start.split('-').map(Number);
  const [ey, em] = end.split('-').map(Number);
  while (y < ey || (y === ey && m <= em)) {
    months.push(`${y}-${String(m).padStart(2, '0')}`);
    m++; if (m > 12) { m = 1; y++; }
  }
  return months;
}

export default function BrandDetailPage() {
  const params = useParams<{ brand: string }>();
  const brand = decodeURIComponent(params.brand);
  const router = useRouter();
  const { transactions, currency, initialized, brands: dbBrands, brandReceivables, addBrandReceivable, updateBrandReceivable, deleteBrandReceivable } = useFinanceStore();

  const [notes, setNotes] = useState<BrandNote[]>([]);
  const [noteInput, setNoteInput] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Receivable modal state
  const THIS_MONTH = new Date().toISOString().slice(0, 7);
  const [recModal, setRecModal] = useState<{ existing?: BrandReceivable; month: string } | null>(null);
  const [recFixed, setRecFixed] = useState('');
  const [recExtra, setRecExtra] = useState('');
  const [recNote, setRecNote] = useState('');
  const [recCurrency, setRecCurrencyLocal] = useState('TRY');

  // Receivables for this brand
  const myReceivables = useMemo(() =>
    brandReceivables.filter((r) => r.brand === brand).sort((a, b) => b.month.localeCompare(a.month)),
    [brandReceivables, brand]
  );
  const receivableByMonth = useMemo(() => {
    const map: Record<string, BrandReceivable> = {};
    myReceivables.forEach((r) => { map[r.month] = r; });
    return map;
  }, [myReceivables]);

  const dbBrandInfo = dbBrands.find((b) => b.value === brand);
  const info = dbBrandInfo ?? BRAND_MAP[brand];
  const color = info?.color ?? '#9ca3af';
  const labelText = info?.label ?? brand;

  // Fetch notes on mount
  useEffect(() => {
    fetch(`/api/brand-notes?brand=${encodeURIComponent(brand)}`)
      .then((r) => r.json())
      .then((data) => setNotes(
        (data as any[]).map((n) => ({ id: n.id, brand: n.brand, content: n.content, createdAt: n.created_at ?? n.createdAt }))
      ))
      .catch(() => {});
  }, [brand]);

  async function addNote() {
    if (!noteInput.trim()) return;
    setSavingNote(true);
    const res = await fetch('/api/brand-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand, content: noteInput.trim() }),
    });
    const note = await res.json();
    setNotes((prev) => [{ id: note.id, brand: note.brand, content: note.content, createdAt: note.createdAt }, ...prev]);
    setNoteInput('');
    setSavingNote(false);
  }

  function openRecModal(month: string) {
    const existing = receivableByMonth[month];
    setRecModal({ existing, month });
    setRecFixed(existing ? String(existing.fixedAmount) : '');
    setRecExtra(existing ? String(existing.extraAmount) : '');
    setRecNote(existing?.note ?? '');
    setRecCurrencyLocal(existing?.currency ?? 'TRY');
  }

  async function saveReceivable() {
    if (!recModal) return;
    const payload = { brand, month: recModal.month, fixedAmount: parseFloat(recFixed) || 0, extraAmount: parseFloat(recExtra) || 0, currency: recCurrency, note: recNote };
    if (recModal.existing) await updateBrandReceivable(recModal.existing.id, payload);
    else await addBrandReceivable(payload);
    setRecModal(null);
  }

  async function deleteNote(id: string) {
    await fetch(`/api/brand-notes?id=${id}`, { method: 'DELETE' });
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  const brandTxs = useMemo(
    () => transactions.filter((t) => t.brand === brand).sort((a, b) => a.date.localeCompare(b.date)),
    [transactions, brand]
  );
  const incomeTxs = brandTxs.filter((t) => t.type === 'income');
  const expenseTxs = brandTxs.filter((t) => t.type === 'expense');

  const allMonths = useMemo(() => getMonthRange(incomeTxs.map((t) => t.date)), [incomeTxs]);

  const byMonth = useMemo(() => {
    const map = new Map<string, typeof incomeTxs>();
    incomeTxs.forEach((t) => {
      const key = t.date.slice(0, 7);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    });
    return map;
  }, [incomeTxs]);

  // Chart data — monthly income
  const chartData = useMemo(() =>
    allMonths.map((month) => {
      const [, mo] = month.split('-');
      const txList = byMonth.get(month);
      return {
        month: `${MONTHS_TR[parseInt(mo) - 1].slice(0, 3)}`,
        gelir: txList?.reduce((s, t) => s + t.amount, 0) ?? 0,
      };
    }),
    [allMonths, byMonth]
  );

  const totalRevenue = incomeTxs.reduce((s, t) => s + t.amount, 0);
  const totalExpense = expenseTxs.reduce((s, t) => s + t.amount, 0);
  const paidMonths = byMonth.size;
  const unpaidMonths = allMonths.length - paidMonths;
  const avgPerMonth = paidMonths > 0 ? totalRevenue / paidMonths : 0;

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (brandTxs.length === 0) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
          <ArrowLeft size={16} /> Geri
        </button>
        <p className="text-center text-gray-400 py-16 text-sm">
          Bu marka için işlem bulunamadı.
          <br />
          <span className="text-xs text-gray-300 mt-1 block font-mono">{brand}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500">
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: color }}>
            {labelText.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">{labelText}</h1>
            <p className="text-xs text-gray-400">{brandTxs.length} işlem · {allMonths.length} aylık dönem</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"><TrendingUp size={11} /> Toplam Gelir</p>
          <p className="text-lg font-bold font-mono mt-1 text-green-600 dark:text-green-400">{formatCurrency(totalRevenue, currency)}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"><Receipt size={11} /> Aylık Ort.</p>
          <p className="text-lg font-bold font-mono mt-1 text-gray-900 dark:text-white">{formatCurrency(avgPerMonth, currency)}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"><CheckCircle2 size={11} className="text-green-500" /> Ödenen Ay</p>
          <p className="text-lg font-bold font-mono mt-1 text-green-600 dark:text-green-400">{paidMonths}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"><AlertCircle size={11} className="text-red-400" /> Ödenmeyen Ay</p>
          <p className="text-lg font-bold font-mono mt-1 text-red-500 dark:text-red-400">{unpaidMonths}</p>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <Card>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4" style={{ color }}>
            Aylık Gelir Grafiği
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${brand}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.4} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#d1d5db' }} itemStyle={{ color: '#f9fafb' }}
                formatter={(v: number) => formatCurrency(v, currency)} />
              <Area type="monotone" dataKey="gelir" name="Gelir" stroke={color} fill={`url(#grad-${brand})`} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Receivables summary */}
      {(dbBrandInfo?.monthlyTarget ?? 0) > 0 || myReceivables.length > 0 ? (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Target size={14} style={{ color }} /> Aylık Tahsilat Takibi
            </h2>
            <button onClick={() => openRecModal(THIS_MONTH)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
              style={{ backgroundColor: color }}>
              <Plus size={12} /> Bu Ay Giriş
            </button>
          </div>

          {(dbBrandInfo?.monthlyTarget ?? 0) > 0 && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-1"><Target size={11} /> Aylık Hedef</span>
              <span className="font-semibold font-mono text-gray-900 dark:text-white">{formatCurrency(dbBrandInfo!.monthlyTarget!, dbBrandInfo!.targetCurrency ?? 'TRY')}</span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left font-medium text-gray-400 pb-2 pl-2 w-24">Ay</th>
                  <th className="text-right font-medium text-gray-400 pb-2 px-2">Sabit</th>
                  <th className="text-right font-medium text-gray-400 pb-2 px-2">Ekstra</th>
                  <th className="text-right font-medium text-gray-400 pb-2 px-2">Toplam</th>
                  {(dbBrandInfo?.monthlyTarget ?? 0) > 0 && <th className="text-right font-medium text-gray-400 pb-2 pr-2">Durum</th>}
                  <th className="w-8 pb-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {/* Current month if not already in list */}
                {!receivableByMonth[THIS_MONTH] && (
                  <tr className="opacity-40">
                    <td className="py-2.5 pl-2 font-medium text-gray-700 dark:text-gray-300">{THIS_MONTH}</td>
                    <td className="py-2.5 px-2 text-right text-gray-300">—</td>
                    <td className="py-2.5 px-2 text-right text-gray-300">—</td>
                    <td className="py-2.5 px-2 text-right text-gray-300">—</td>
                    {(dbBrandInfo?.monthlyTarget ?? 0) > 0 && <td className="py-2.5 pr-2 text-right text-orange-400">Bekleniyor</td>}
                    <td className="py-2.5 pr-1 text-right">
                      <button onClick={() => openRecModal(THIS_MONTH)} className="p-1 text-gray-300 hover:text-brand-500"><Plus size={12} /></button>
                    </td>
                  </tr>
                )}
                {myReceivables.map((r) => {
                  const total = r.fixedAmount + r.extraAmount;
                  const target = dbBrandInfo?.monthlyTarget ?? 0;
                  const ok = target > 0 && total >= target;
                  const short = target > 0 && total < target;
                  return (
                    <tr key={r.id}>
                      <td className="py-2.5 pl-2 font-medium text-gray-700 dark:text-gray-300">{r.month}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-gray-600 dark:text-gray-400">{formatCurrency(r.fixedAmount, r.currency)}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-blue-600 dark:text-blue-400">{r.extraAmount > 0 ? formatCurrency(r.extraAmount, r.currency) : <span className="text-gray-300">—</span>}</td>
                      <td className="py-2.5 px-2 text-right font-mono font-semibold text-green-600 dark:text-green-400">{formatCurrency(total, r.currency)}</td>
                      {target > 0 && (
                        <td className="py-2.5 pr-2 text-right">
                          {ok ? <span className="text-green-600 dark:text-green-400 flex items-center justify-end gap-1"><CheckCircle2 size={11} /> Tam</span>
                            : <span className="text-orange-500">{formatCurrency(target - total, r.currency)} eksik</span>}
                        </td>
                      )}
                      <td className="py-2.5 pr-1 text-right">
                        <div className="flex items-center gap-0.5 justify-end opacity-0 hover:opacity-100 group-hover:opacity-100">
                          <button onClick={() => openRecModal(r.month)} className="p-1 text-gray-300 hover:text-brand-500"><Pencil size={11} /></button>
                          <button onClick={() => deleteBrandReceivable(r.id)} className="p-1 text-gray-300 hover:text-red-500"><Trash2 size={11} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {myReceivables.length > 0 && (
                <tfoot>
                  <tr className="border-t border-gray-200 dark:border-gray-700">
                    <td className="pt-2 pl-2 text-gray-500 font-medium">Toplam</td>
                    <td className="pt-2 px-2 text-right font-mono font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(myReceivables.reduce((s, r) => s + r.fixedAmount, 0), currency)}</td>
                    <td className="pt-2 px-2 text-right font-mono font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(myReceivables.reduce((s, r) => s + r.extraAmount, 0), currency)}</td>
                    <td className="pt-2 px-2 text-right font-mono font-semibold text-green-600 dark:text-green-400">{formatCurrency(myReceivables.reduce((s, r) => s + r.fixedAmount + r.extraAmount, 0), currency)}</td>
                    {(dbBrandInfo?.monthlyTarget ?? 0) > 0 && <td />}
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </Card>
      ) : null}

      {/* Monthly payment table + notes side by side on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly table */}
        <div className="lg:col-span-2">
          <Card padding="sm">
            <div className="flex items-center justify-between px-2 pb-3 mb-1 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar size={14} style={{ color }} /> Aylık Ödeme Tablosu
              </h2>
              {allMonths.length > 0 && (
                <span className="text-xs text-gray-400">{allMonths[0]} — {allMonths[allMonths.length - 1]}</span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 pb-2 pl-2 w-28">Ay</th>
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 pb-2 px-2">İşlemler</th>
                    <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 pb-2 pr-2">Toplam</th>
                    <th className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 pb-2 w-20">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {[...allMonths].reverse().map((month) => {
                    const txList = byMonth.get(month);
                    const paid = !!txList && txList.length > 0;
                    const monthTotal = txList?.reduce((s, t) => s + t.amount, 0) ?? 0;
                    const [y, mo] = month.split('-');
                    const monthLabel = `${MONTHS_TR[parseInt(mo) - 1]} ${y}`;
                    return (
                      <tr key={month} className={`border-b border-gray-50 dark:border-gray-800/50 ${paid ? '' : 'opacity-40'}`}>
                        <td className="py-2.5 pl-2">
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{monthLabel}</span>
                        </td>
                        <td className="py-2.5 px-2">
                          {paid ? (
                            <div className="flex flex-col gap-0.5">
                              {txList!.map((tx) => (
                                <div key={tx.id} className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(tx.date)}</span>
                                  {tx.service && (
                                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300">
                                      {SERVICE_LABELS[tx.service]}
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500 truncate max-w-[140px]">{tx.description}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-300 dark:text-gray-600 italic">— ödeme alınmadı</span>
                          )}
                        </td>
                        <td className="py-2.5 pr-2 text-right">
                          {paid ? (
                            <span className="font-semibold font-mono text-sm text-green-600 dark:text-green-400 whitespace-nowrap">
                              +{formatCurrency(monthTotal, currency)}
                            </span>
                          ) : <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>}
                        </td>
                        <td className="py-2.5 pr-2 text-center">
                          {paid ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                              <CheckCircle2 size={12} /> Ödendi
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-300 dark:text-gray-600">
                              <AlertCircle size={12} /> Boş
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Expense section if any */}
            {expenseTxs.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">Giderler ({expenseTxs.length} işlem)</p>
                {expenseTxs.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between px-2 py-1.5 text-xs">
                    <span className="text-gray-700 dark:text-gray-300">{formatDate(tx.date)} · {tx.description}</span>
                    <span className="font-mono text-red-500 font-semibold">-{formatCurrency(tx.amount, currency)}</span>
                  </div>
                ))}
                <div className="flex justify-between px-2 pt-2 border-t border-gray-100 dark:border-gray-800 mt-1">
                  <span className="text-xs text-gray-500">Toplam Gider</span>
                  <span className="text-sm font-bold font-mono text-red-600">{formatCurrency(totalExpense, currency)}</span>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Notes */}
        <div>
          <Card className="h-full">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <StickyNote size={14} style={{ color }} /> Notlar
            </h2>

            {/* Add note */}
            <div className="flex gap-2 mb-4">
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addNote(); } }}
                placeholder="Not ekle… (Enter ile kaydet)"
                rows={2}
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
              <button onClick={addNote} disabled={!noteInput.trim() || savingNote}
                className="p-2 rounded-lg text-white disabled:opacity-40 transition-colors flex-shrink-0"
                style={{ backgroundColor: color }}>
                <Plus size={16} />
              </button>
            </div>

            {/* Notes list */}
            <div className="space-y-2 overflow-y-auto max-h-96">
              {notes.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-6">Henüz not yok</p>
              )}
              {notes.map((note) => (
                <div key={note.id}
                  className="group flex items-start gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{note.content}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{note.createdAt ? new Date(note.createdAt).toLocaleDateString('tr-TR') : ''}</p>
                  </div>
                  <button onClick={() => deleteNote(note.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-red-500 transition-all flex-shrink-0">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Receivable Modal */}
      <Modal open={!!recModal} onClose={() => setRecModal(null)} title="Aylık Tahsilat Girişi">
        {recModal && (
          <div className="space-y-4">
            <p className="text-xs text-gray-500">{recModal.month} ayı tahsilatı — <span className="font-medium text-gray-700 dark:text-gray-300">{labelText}</span></p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Sabit Tahsilat</label>
                <input type="number" placeholder="0.00" value={recFixed}
                  onChange={(e) => setRecFixed(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  autoFocus />
                <p className="text-xs text-gray-400 mt-1">Retainer / aylık sabit</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Ekstra Tahsilat</label>
                <input type="number" placeholder="0.00" value={recExtra}
                  onChange={(e) => setRecExtra(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                <p className="text-xs text-gray-400 mt-1">Ek proje / fazla mesai</p>
              </div>
            </div>
            {(recFixed || recExtra) && (
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs">
                <span className="text-gray-500">Toplam</span>
                <span className="font-semibold font-mono text-green-600 dark:text-green-400">
                  {formatCurrency((parseFloat(recFixed) || 0) + (parseFloat(recExtra) || 0), recCurrency)}
                </span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Para Birimi</label>
                <select value={recCurrency} onChange={(e) => setRecCurrencyLocal(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                  {['TRY', 'USD', 'EUR', 'GBP'].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Not</label>
                <input type="text" placeholder="Fatura no..." value={recNote}
                  onChange={(e) => setRecNote(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" className="flex-1" onClick={() => setRecModal(null)}>İptal</Button>
              <Button variant="primary" className="flex-1" onClick={saveReceivable}>Kaydet</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
