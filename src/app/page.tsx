'use client';

import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, Target, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useFinanceStore, useMonthlyStats, useBudgetProgress } from '@/store/useFinanceStore';
import { StatCard } from '@/components/ui/Card';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import { formatCurrency, formatDate, CATEGORY_LABELS, CATEGORY_ICONS, SERVICE_LABELS, SERVICE_COLORS, MONTHS_TR } from '@/lib/utils';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';

export default function DashboardPage() {
  const { transactions, budgets, investments, goals, currency } = useFinanceStore();

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth()); // 0-indexed

  const currentMonth = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;

  function prevMonth() {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear((y) => y - 1); }
    else setSelectedMonth((m) => m - 1);
  }
  function nextMonth() {
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear((y) => y + 1); }
    else setSelectedMonth((m) => m + 1);
  }
  const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === now.getMonth();

  const monthlyStats = useMonthlyStats(transactions);
  const last6 = monthlyStats.slice(-6);

  const currentStats = useMemo(() => {
    const monthTx = transactions.filter((t) => t.date.startsWith(currentMonth));
    const income = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, net: income - expense, count: monthTx.length };
  }, [transactions, currentMonth]);

  const portfolioValue = useMemo(() =>
    investments.reduce((s, i) => s + i.currentPrice * i.quantity, 0), [investments]);

  const budgetProgress = useBudgetProgress(budgets, transactions, currentMonth);

  // Hizmet bazlı gelir dağılımı
  const serviceBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'income' && t.date.startsWith(currentMonth) && t.service)
      .forEach((t) => { map[t.service!] = (map[t.service!] || 0) + t.amount; });
    return Object.entries(map)
      .map(([service, amount]) => ({ service, amount, label: SERVICE_LABELS[service as never], color: SERVICE_COLORS[service as never] }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, currentMonth]);

  // Aylık hizmet gelir karşılaştırması (bar chart)
  const monthlyServiceData = useMemo(() => {
    const months = last6.map((m) => m.month);
    return months.map((month) => {
      const row: Record<string, string | number> = { month };
      transactions
        .filter((t) => t.type === 'income' && t.date.startsWith(month) && t.service)
        .forEach((t) => { row[SERVICE_LABELS[t.service as never]] = ((row[SERVICE_LABELS[t.service as never]] as number) || 0) + t.amount; });
      return row;
    });
  }, [transactions, last6]);

  const topServices = useMemo(() => {
    const seen = new Set<string>();
    transactions.filter((t) => t.type === 'income' && t.service).forEach((t) => seen.add(t.service!));
    return Array.from(seen).slice(0, 5);
  }, [transactions]);

  const recentTransactions = transactions.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Ay seçici */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ChevronLeft size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white w-36 text-center">
            {MONTHS_TR[selectedMonth]} {selectedYear}
          </h2>
          <button onClick={nextMonth} disabled={isCurrentMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30">
            <ChevronRight size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
          {!isCurrentMonth && (
            <button onClick={() => { setSelectedMonth(now.getMonth()); setSelectedYear(now.getFullYear()); }}
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
              Bu aya dön
            </button>
          )}
        </div>
        <span className="text-xs text-gray-400">{currentStats.count} işlem</span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Gelir" value={formatCurrency(currentStats.income, currency)} sub={MONTHS_TR[selectedMonth]} color="green" icon={<TrendingUp size={18} />} />
        <StatCard label="Gider" value={formatCurrency(currentStats.expense, currency)} sub={MONTHS_TR[selectedMonth]} color="red" icon={<TrendingDown size={18} />} />
        <StatCard label="Net Bakiye" value={formatCurrency(currentStats.net, currency)} trend={currentStats.net} sub={currentStats.net >= 0 ? 'Pozitif' : 'Negatif'} color="blue" icon={<Wallet size={18} />} />
        <StatCard label="Portföy" value={formatCurrency(portfolioValue, 'USD')} sub="Toplam yatırım" color="purple" icon={<Target size={18} />} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Nakit Akışı (Son 6 Ay)</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={last6} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#d1d5db' }} itemStyle={{ color: '#f9fafb' }}
                formatter={(v: number) => formatCurrency(v, currency)} />
              <Area type="monotone" dataKey="income" name="Gelir" stroke="#22c55e" fill="url(#incomeGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="expense" name="Gider" stroke="#ef4444" fill="url(#expenseGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Hizmet gelir dağılımı */}
        <Card>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Hizmet Gelirleri</h2>
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
          ) : (
            <p className="text-sm text-gray-400 text-center py-12">Bu ay hizmet geliri yok</p>
          )}
        </Card>
      </div>

      {/* Hizmet bazlı aylık bar chart */}
      {topServices.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-5">Hizmet Bazlı Aylık Gelir</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyServiceData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#d1d5db' }} itemStyle={{ color: '#f9fafb' }}
                formatter={(v: number) => formatCurrency(v, currency)} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              {topServices.map((s) => (
                <Bar key={s} dataKey={SERVICE_LABELS[s as never]} fill={SERVICE_COLORS[s as never]} radius={[3, 3, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Son İşlemler</h2>
            <Link href="/transactions" className="text-xs text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline">
              Tümünü gör <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-base">{CATEGORY_ICONS[tx.category]}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{tx.description}</p>
                    <p className="text-xs text-gray-400">
                      {formatDate(tx.date)}{tx.service ? ` · ${SERVICE_LABELS[tx.service]}` : ''}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-semibold font-mono ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                </span>
              </div>
            ))}
          </div>
        </Card>

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
                    {CATEGORY_ICONS[b.category]} {CATEGORY_LABELS[b.category]}
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
    </div>
  );
}
