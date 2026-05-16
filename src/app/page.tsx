'use client';

export const runtime = 'edge';

import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, Target, ArrowRight, ChevronLeft, ChevronRight, Eye, EyeOff, CheckCircle2, AlertCircle, Clock, Users } from 'lucide-react';
import Link from 'next/link';
import { useFinanceStore, useMonthlyStats, useBudgetProgress } from '@/store/useFinanceStore';
import { StatCard } from '@/components/ui/Card';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import { formatCurrency, formatDate, CATEGORY_LABELS, SERVICE_LABELS, SERVICE_COLORS, MONTHS_TR, BRAND_MAP } from '@/lib/utils';
import CategoryIcon from '@/components/ui/CategoryIcon';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';

type ViewMode = 'monthly' | 'yearly' | 'all';

export default function DashboardPage() {
  const { transactions, budgets, investments, currency, brands: dbBrands, brandReceivables } = useFinanceStore();

  const now = new Date();
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [hideAmounts, setHideAmounts] = useState(false);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());

  const currentMonthKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
  const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === now.getMonth();

  function prevMonth() {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear((y) => y - 1); }
    else setSelectedMonth((m) => m - 1);
  }
  function nextMonth() {
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear((y) => y + 1); }
    else setSelectedMonth((m) => m + 1);
  }

  const periodTxs = useMemo(() => {
    if (viewMode === 'monthly') return transactions.filter((t) => t.date.startsWith(currentMonthKey));
    if (viewMode === 'yearly') return transactions.filter((t) => t.date.startsWith(String(selectedYear)));
    return transactions;
  }, [transactions, viewMode, currentMonthKey, selectedYear]);

  const stats = useMemo(() => {
    const income = periodTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = periodTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, net: income - expense, count: periodTxs.length };
  }, [periodTxs]);

  const portfolioValue = useMemo(() =>
    investments.reduce((s, i) => s + i.currentPrice * i.quantity, 0), [investments]);

  const monthlyStats = useMonthlyStats(transactions);
  const last6 = monthlyStats.slice(-6);
  const budgetProgress = useBudgetProgress(budgets, transactions, currentMonthKey);

  const incomeList = useMemo(() =>
    periodTxs.filter((t) => t.type === 'income').sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8),
    [periodTxs]);

  const expenseList = useMemo(() =>
    periodTxs.filter((t) => t.type === 'expense').sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8),
    [periodTxs]);

  const serviceBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    periodTxs.filter((t) => t.type === 'income' && t.service)
      .forEach((t) => { map[t.service!] = (map[t.service!] || 0) + t.amount; });
    return Object.entries(map)
      .map(([service, amount]) => ({ service, amount, label: SERVICE_LABELS[service as never], color: SERVICE_COLORS[service as never] }))
      .sort((a, b) => b.amount - a.amount);
  }, [periodTxs]);

  const monthlyServiceData = useMemo(() => {
    return last6.map((m) => {
      const row: Record<string, string | number> = { month: m.month.slice(5) };
      transactions
        .filter((t) => t.type === 'income' && t.date.startsWith(m.month) && t.service)
        .forEach((t) => { row[SERVICE_LABELS[t.service as never]] = ((row[SERVICE_LABELS[t.service as never]] as number) || 0) + t.amount; });
      return row;
    });
  }, [transactions, last6]);

  const topServices = useMemo(() => {
    const seen = new Set<string>();
    transactions.filter((t) => t.type === 'income' && t.service).forEach((t) => seen.add(t.service!));
    return Array.from(seen).slice(0, 5);
  }, [transactions]);

  // Brand monthly payment tracking — only brands with a monthly target
  const brandPaymentRows = useMemo(() => {
    const today = now.getDate();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return dbBrands
      .filter((b) => b.isActive && (b.monthlyTarget ?? 0) > 0)
      .map((b) => {
        const rec = brandReceivables.find((r) => r.brand === b.value && r.month === thisMonth);
        const received = rec ? (rec.fixedAmount + rec.extraAmount) : 0;
        const dueDay = b.dueDay ?? 1;
        const overdue = today > dueDay && received < (b.monthlyTarget ?? 0);
        const complete = received >= (b.monthlyTarget ?? 0);
        const pending = !complete && !overdue;
        return { b, rec, received, dueDay, overdue, complete, pending, thisMonth };
      })
      .sort((a, z) => {
        // Sort: overdue first, then pending, then complete
        if (a.overdue && !z.overdue) return -1;
        if (!a.overdue && z.overdue) return 1;
        if (a.pending && z.complete) return -1;
        if (a.complete && z.pending) return 1;
        return a.dueDay - z.dueDay;
      });
  }, [dbBrands, brandReceivables, now]);

  const periodLabel = viewMode === 'monthly'
    ? `${MONTHS_TR[selectedMonth]} ${selectedYear}`
    : viewMode === 'yearly' ? String(selectedYear) : 'Tüm Zamanlar';

  return (
    <div className="space-y-6">
      {/* ── View mode + period selector ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden flex-shrink-0">
          {(['monthly', 'yearly', 'all'] as const).map((m) => (
            <button key={m} onClick={() => setViewMode(m)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === m ? 'bg-brand-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              {m === 'monthly' ? 'Aylık' : m === 'yearly' ? 'Yıllık' : 'Tüm'}
            </button>
          ))}
        </div>

        {viewMode === 'monthly' && (
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ChevronLeft size={16} className="text-gray-600 dark:text-gray-400" />
            </button>
            <span className="text-sm font-semibold text-gray-900 dark:text-white w-32 text-center">
              {MONTHS_TR[selectedMonth]} {selectedYear}
            </span>
            <button onClick={nextMonth} disabled={isCurrentMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30">
              <ChevronRight size={16} className="text-gray-600 dark:text-gray-400" />
            </button>
            {!isCurrentMonth && (
              <button onClick={() => { setSelectedMonth(now.getMonth()); setSelectedYear(now.getFullYear()); }}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
                Bu ay
              </button>
            )}
          </div>
        )}

        {viewMode === 'yearly' && (
          <div className="flex items-center gap-2">
            <button onClick={() => setSelectedYear((y) => y - 1)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <ChevronLeft size={16} className="text-gray-600 dark:text-gray-400" />
            </button>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{selectedYear}</span>
            <button onClick={() => setSelectedYear((y) => y + 1)} disabled={selectedYear >= now.getFullYear()}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30">
              <ChevronRight size={16} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        )}

        <span className="text-xs text-gray-400">{stats.count} işlem</span>
        <button onClick={() => setHideAmounts((v) => !v)}
          className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
          title={hideAmounts ? 'Rakamları göster' : 'Rakamları gizle'}>
          {hideAmounts ? <EyeOff size={14} /> : <Eye size={14} />}
          {hideAmounts ? 'Göster' : 'Gizle'}
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Gelir" value={hideAmounts ? '••••••' : formatCurrency(stats.income, currency)} sub={periodLabel} color="green" icon={<TrendingUp size={18} />} />
        <StatCard label="Gider" value={hideAmounts ? '••••••' : formatCurrency(stats.expense, currency)} sub={periodLabel} color="red" icon={<TrendingDown size={18} />} />
        <StatCard label="Net" value={hideAmounts ? '••••••' : formatCurrency(stats.net, currency)} trend={hideAmounts ? undefined : stats.net} sub={stats.net >= 0 ? 'Pozitif' : 'Negatif'} color="blue" icon={<Wallet size={18} />} />
        <StatCard label="Portföy" value={hideAmounts ? '••••••' : formatCurrency(portfolioValue, 'USD')} sub="Toplam yatırım" color="purple" icon={<Target size={18} />} />
      </div>

      {/* ── Income / Expense lists ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" /> Gelirler — {periodLabel}
            </h2>
            <Link href="/transactions" className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
              Tümü <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-1.5">
            {incomeList.length === 0 && <p className="text-xs text-gray-400 text-center py-6">Bu dönem gelir yok</p>}
            {incomeList.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-gray-800 last:border-0 gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{tx.description}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-gray-400">{formatDate(tx.date)}</span>
                    {tx.brand && BRAND_MAP[tx.brand] && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: BRAND_MAP[tx.brand].color + '20', color: BRAND_MAP[tx.brand].color }}>
                        {BRAND_MAP[tx.brand].label}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs font-semibold font-mono text-green-600 dark:text-green-400 flex-shrink-0">
                  {hideAmounts ? '••••' : `+${formatCurrency(tx.amount, currency)}`}
                </span>
              </div>
            ))}
          </div>
          {stats.income > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between">
              <span className="text-xs text-gray-500">Toplam</span>
              <span className="text-sm font-bold font-mono text-green-600 dark:text-green-400">{hideAmounts ? '••••••' : formatCurrency(stats.income, currency)}</span>
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" /> Giderler — {periodLabel}
            </h2>
            <Link href="/transactions" className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
              Tümü <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-1.5">
            {expenseList.length === 0 && <p className="text-xs text-gray-400 text-center py-6">Bu dönem gider yok</p>}
            {expenseList.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-gray-800 last:border-0 gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{tx.description}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">{formatDate(tx.date)} · <CategoryIcon category={tx.category} size={11} /> {(CATEGORY_LABELS as Record<string,string>)[tx.category] ?? tx.category}</p>
                </div>
                <span className="text-xs font-semibold font-mono text-red-600 dark:text-red-400 flex-shrink-0">
                  {hideAmounts ? '••••' : `-${formatCurrency(tx.amount, currency)}`}
                </span>
              </div>
            ))}
          </div>
          {stats.expense > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between">
              <span className="text-xs text-gray-500">Toplam</span>
              <span className="text-sm font-bold font-mono text-red-600 dark:text-red-400">{hideAmounts ? '••••••' : formatCurrency(stats.expense, currency)}</span>
            </div>
          )}
        </Card>
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-5">Nakit Akışı (Son 6 Ay)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={last6} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ig" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} /><stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#d1d5db' }} itemStyle={{ color: '#f9fafb' }}
                formatter={(v: number) => formatCurrency(v, currency)} />
              <Area type="monotone" dataKey="income" name="Gelir" stroke="#22c55e" fill="url(#ig)" strokeWidth={2} />
              <Area type="monotone" dataKey="expense" name="Gider" stroke="#ef4444" fill="url(#eg)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Hizmet Gelirleri — {periodLabel}</h2>
          {serviceBreakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={serviceBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                    dataKey="amount" nameKey="label" paddingAngle={3}>
                    {serviceBreakdown.map((s, i) => <Cell key={i} fill={s.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v, currency)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {serviceBreakdown.map((s) => (
                  <div key={s.service} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="text-gray-600 dark:text-gray-400 truncate">{s.label}</span>
                    </span>
                    <span className="font-mono font-medium text-gray-900 dark:text-white">{formatCurrency(s.amount, currency)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="text-sm text-gray-400 text-center py-12">Bu dönem hizmet geliri yok</p>}
        </Card>
      </div>

      {topServices.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Hizmet Bazlı Aylık Gelir (Son 6 Ay)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left font-medium text-gray-500 pb-2 pr-3 whitespace-nowrap">Hizmet</th>
                  {last6.map((m) => (
                    <th key={m.month} className="text-right font-medium text-gray-500 pb-2 px-2 whitespace-nowrap">{m.month.slice(5)}</th>
                  ))}
                  <th className="text-right font-medium text-gray-500 pb-2 pl-2 whitespace-nowrap">Toplam</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {topServices.map((s) => {
                  const rowTotal = last6.reduce((sum, m) => sum + ((monthlyServiceData.find((r) => r.month === m.month.slice(5))?.[SERVICE_LABELS[s as never]] as number) || 0), 0);
                  return (
                    <tr key={s} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="py-2.5 pr-3 whitespace-nowrap">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: SERVICE_COLORS[s as never] }} />
                          <span className="text-gray-700 dark:text-gray-300 font-medium">{SERVICE_LABELS[s as never]}</span>
                        </span>
                      </td>
                      {last6.map((m) => {
                        const val = (monthlyServiceData.find((r) => r.month === m.month.slice(5))?.[SERVICE_LABELS[s as never]] as number) || 0;
                        return (
                          <td key={m.month} className="py-2.5 px-2 text-right font-mono whitespace-nowrap">
                            {val > 0
                              ? <span className="text-gray-900 dark:text-white">{formatCurrency(val, currency)}</span>
                              : <span className="text-gray-300 dark:text-gray-700">—</span>}
                          </td>
                        );
                      })}
                      <td className="py-2.5 pl-2 text-right font-mono font-semibold whitespace-nowrap text-gray-900 dark:text-white">
                        {rowTotal > 0 ? formatCurrency(rowTotal, currency) : <span className="text-gray-300 dark:text-gray-700">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200 dark:border-gray-800">
                  <td className="pt-2.5 pr-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Toplam</td>
                  {last6.map((m) => {
                    const colTotal = topServices.reduce((sum, s) => sum + ((monthlyServiceData.find((r) => r.month === m.month.slice(5))?.[SERVICE_LABELS[s as never]] as number) || 0), 0);
                    return (
                      <td key={m.month} className="pt-2.5 px-2 text-right font-mono font-semibold whitespace-nowrap text-gray-900 dark:text-white">
                        {colTotal > 0 ? formatCurrency(colTotal, currency) : <span className="text-gray-300 dark:text-gray-700">—</span>}
                      </td>
                    );
                  })}
                  <td className="pt-2.5 pl-2 text-right font-mono font-bold whitespace-nowrap" style={{ color: '#5F17EC' }}>
                    {formatCurrency(topServices.reduce((sum, s) => sum + last6.reduce((s2, m) => s2 + ((monthlyServiceData.find((r) => r.month === m.month.slice(5))?.[SERVICE_LABELS[s as never]] as number) || 0), 0), 0), currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}

      {/* ── Brand monthly payment tracking ── */}
      {brandPaymentRows.length > 0 && (
        <Card padding="sm">
          <div className="flex items-center justify-between px-2 pb-3 mb-1 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Target size={14} className="text-brand-500" />
              Marka Aylık Tahsilat Takibi — {MONTHS_TR[now.getMonth()]} {now.getFullYear()}
            </h2>
            <Link href="/brands" className="text-xs text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline">
              Markalar <ArrowRight size={11} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left font-medium text-gray-400 pb-2 pl-3">Marka</th>
                  <th className="text-right font-medium text-gray-400 pb-2 px-3">Beklenen</th>
                  <th className="text-right font-medium text-gray-400 pb-2 px-3">Sabit</th>
                  <th className="text-right font-medium text-gray-400 pb-2 px-3">Ekstra</th>
                  <th className="text-right font-medium text-gray-400 pb-2 px-3">Toplam</th>
                  <th className="text-center font-medium text-gray-400 pb-2 pr-3 w-28">Son Gün</th>
                  <th className="text-center font-medium text-gray-400 pb-2 pr-3 w-28">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {brandPaymentRows.map(({ b, rec, received, dueDay, overdue, complete }) => (
                  <tr key={b.id} className={overdue ? 'bg-red-50/50 dark:bg-red-900/5' : complete ? 'bg-green-50/30 dark:bg-green-900/5' : ''}>
                    <td className="py-2.5 pl-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold"
                          style={{ backgroundColor: b.color }}>
                          {b.label.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{b.label}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-gray-600 dark:text-gray-400">
                      {hideAmounts ? '••••' : formatCurrency(b.monthlyTarget ?? 0, b.targetCurrency ?? 'TRY')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-gray-700 dark:text-gray-300">
                      {rec && rec.fixedAmount > 0 ? (hideAmounts ? '••••' : formatCurrency(rec.fixedAmount, rec.currency)) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-blue-600 dark:text-blue-400">
                      {rec && rec.extraAmount > 0 ? (hideAmounts ? '••••' : formatCurrency(rec.extraAmount, rec.currency)) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">
                      {received > 0
                        ? <span className={complete ? 'text-green-600 dark:text-green-400' : 'text-orange-500'}>{hideAmounts ? '••••' : formatCurrency(received, rec?.currency ?? 'TRY')}</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`font-medium ${overdue && !complete ? 'text-red-500' : 'text-gray-500'}`}>
                        Her ayın {dueDay}.
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-center">
                      {complete ? (
                        <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                          <CheckCircle2 size={12} /> Ödendi
                        </span>
                      ) : overdue ? (
                        <span className="inline-flex items-center gap-1 text-red-500 font-medium">
                          <AlertCircle size={12} /> Gecikti
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-orange-500">
                          <Clock size={12} /> Bekliyor
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td className="pt-2 pl-3 text-gray-500 font-medium">Toplam</td>
                  <td className="pt-2 px-3 text-right font-mono font-semibold text-gray-700 dark:text-gray-300">
                    {hideAmounts ? '••••' : formatCurrency(brandPaymentRows.reduce((s, r) => s + (r.b.monthlyTarget ?? 0), 0), currency)}
                  </td>
                  <td colSpan={2} />
                  <td className="pt-2 px-3 text-right font-mono font-semibold text-green-600 dark:text-green-400">
                    {hideAmounts ? '••••' : formatCurrency(brandPaymentRows.reduce((s, r) => s + r.received, 0), currency)}
                  </td>
                  <td />
                  <td className="pt-2 pr-3 text-center text-xs text-gray-400">
                    {brandPaymentRows.filter((r) => r.complete).length}/{brandPaymentRows.length} tamamlandı
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}

      {/* ── Active clients ── */}
      {(() => {
        const activeClients = dbBrands.filter((b) => b.isActive);
        if (activeClients.length === 0) return null;
        return (
          <Card padding="sm">
            <div className="flex items-center justify-between px-2 pb-3 mb-1 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Users size={14} className="text-brand-500" />
                Aktif Müşteriler
                <span className="text-xs font-normal text-white bg-brand-500 rounded-full px-1.5 py-0.5">{activeClients.length}</span>
              </h2>
              <Link href="/brands" className="text-xs text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline">
                Tümü <ArrowRight size={11} />
              </Link>
            </div>
            <div className="flex flex-wrap gap-2 px-2 py-2">
              {activeClients.map((b) => {
                const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                const rec = brandReceivables.find((r) => r.brand === b.value && r.month === thisMonthKey);
                const received = rec ? rec.fixedAmount + rec.extraAmount : 0;
                const hasTarget = (b.monthlyTarget ?? 0) > 0;
                const complete = hasTarget && received >= (b.monthlyTarget ?? 0);
                const today = now.getDate();
                const overdue = hasTarget && !complete && today > (b.dueDay ?? 1);
                return (
                  <Link key={b.id} href="/brands"
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors bg-white dark:bg-gray-900">
                    <div className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center text-white text-[9px] font-bold"
                      style={{ backgroundColor: b.color }}>
                      {b.label.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{b.label}</span>
                    {hasTarget && (
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${complete ? 'bg-green-500' : overdue ? 'bg-red-500' : 'bg-orange-400'}`} />
                    )}
                  </Link>
                );
              })}
            </div>
          </Card>
        );
      })()}

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Bütçe Durumu</h2>
          <Link href="/budget" className="text-xs text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline">
            Yönet <ArrowRight size={12} />
          </Link>
        </div>
        <div className="space-y-4">
          {budgetProgress.slice(0, 5).map((b) => (
            <div key={b.id}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <CategoryIcon category={b.category} size={14} /> {(CATEGORY_LABELS as Record<string,string>)[b.category] ?? b.category}
                </span>
                <span className={`text-xs font-mono ${b.overBudget ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                  {formatCurrency(b.spent, currency)} / {formatCurrency(b.limit, currency)}
                </span>
              </div>
              <ProgressBar value={b.percentage} color={b.color} showLabel />
            </div>
          ))}
          {budgetProgress.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Bütçe tanımlanmadı</p>}
        </div>
      </Card>
    </div>
  );
}
