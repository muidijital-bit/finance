'use client';

export const runtime = 'edge';

import { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFinanceStore } from '@/store/useFinanceStore';
import Card from '@/components/ui/Card';
import { formatCurrency, formatDate, BRAND_MAP, SERVICE_LABELS, MONTHS_TR } from '@/lib/utils';
import { ArrowLeft, TrendingUp, Calendar, Receipt, AlertCircle, CheckCircle2, Plus, Trash2, StickyNote } from 'lucide-react';
import { BrandNote } from '@/types';
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
  const { brand } = useParams<{ brand: string }>();
  const router = useRouter();
  const { transactions, currency } = useFinanceStore();

  const [notes, setNotes] = useState<BrandNote[]>([]);
  const [noteInput, setNoteInput] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const info = BRAND_MAP[brand];
  const color = info?.color ?? '#9ca3af';
  const labelText = info?.label ?? decodeURIComponent(brand);

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

  if (brandTxs.length === 0) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
          <ArrowLeft size={16} /> Geri
        </button>
        <p className="text-center text-gray-400 py-16 text-sm">Bu marka için işlem bulunamadı.</p>
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
    </div>
  );
}
