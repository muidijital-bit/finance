'use client';

export const runtime = 'edge';

import { useMemo, useState } from 'react';
import { useFinanceStore, useMonthlyStats } from '@/store/useFinanceStore';
import Card from '@/components/ui/Card';
import { formatCurrency, CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';

export default function ReportsPage() {
  const { transactions, currency } = useFinanceStore();
  const [period, setPeriod] = useState<3 | 6 | 12>(6);

  const monthlyStats = useMonthlyStats(transactions);
  const periodStats = monthlyStats.slice(-period);

  const avgIncome = periodStats.length ? periodStats.reduce((s, m) => s + m.income, 0) / periodStats.length : 0;
  const avgExpense = periodStats.length ? periodStats.reduce((s, m) => s + m.expense, 0) / periodStats.length : 0;
  const savingsRate = avgIncome > 0 ? ((avgIncome - avgExpense) / avgIncome) * 100 : 0;

  const currentMonth = new Date().toISOString().slice(0, 7);
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'expense' && t.date >= `${new Date().getFullYear()}-01`)
      .forEach((t) => { map[t.category] = (map[t.category] || 0) + t.amount; });
    const total = Object.values(map).reduce((s, v) => s + v, 0);
    return Object.entries(map)
      .map(([cat, amount]) => ({
        category: cat,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        label: CATEGORY_LABELS[cat as never],
        color: CATEGORY_COLORS[cat as never],
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const netWorthData = useMemo(() => {
    let running = 0;
    return monthlyStats.slice(-12).map((m) => {
      running += m.net;
      return { month: m.month, net: running };
    });
  }, [monthlyStats]);

  return (
    <div className="space-y-6">
      {/* Period picker */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500 dark:text-gray-400">Dönem:</span>
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          {([3, 6, 12] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-xs font-medium transition-colors ${period === p ? 'bg-brand-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              {p} Ay
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400">Ort. Aylık Gelir</p>
          <p className="text-lg font-semibold font-mono mt-1 text-green-600 dark:text-green-400">{formatCurrency(avgIncome, currency)}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400">Ort. Aylık Gider</p>
          <p className="text-lg font-semibold font-mono mt-1 text-red-600 dark:text-red-400">{formatCurrency(avgExpense, currency)}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400">Tasarruf Oranı</p>
          <p className={`text-lg font-semibold font-mono mt-1 ${savingsRate >= 20 ? 'text-green-600 dark:text-green-400' : savingsRate >= 10 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
            {savingsRate.toFixed(1)}%
          </p>
        </Card>
      </div>

      {/* Income vs Expense Bar Chart */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-5">Gelir & Gider Karşılaştırması</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={periodStats} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <Tooltip
              contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8, fontSize: 12 }}
              formatter={(v: number) => formatCurrency(v, currency)}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="income" name="Gelir" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Gider" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Net worth trend */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-5">Net Tasarruf Trendi</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={netWorthData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <Tooltip
              contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8, fontSize: 12 }}
              formatter={(v: number) => formatCurrency(v, currency)}
            />
            <Line type="monotone" dataKey="net" name="Birikim" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Kategori Dağılımı (Bu Yıl)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={categoryBreakdown} cx="50%" cy="50%" outerRadius={80} dataKey="amount" nameKey="label" paddingAngle={2}>
                {categoryBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v, currency)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">En Yüksek Harcama Kategorileri</h2>
          <div className="space-y-3">
            {categoryBreakdown.slice(0, 8).map((c) => (
              <div key={c.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{c.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">{formatCurrency(c.amount, currency)}</span>
                  <span className="text-xs text-gray-400 ml-2">({c.percentage.toFixed(1)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
