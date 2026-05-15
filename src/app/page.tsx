'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, Target, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useFinanceStore, useMonthlyStats, useBudgetProgress } from '@/store/useFinanceStore';
import { StatCard } from '@/components/ui/Card';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import { formatCurrency, formatDate, CATEGORY_LABELS, CATEGORY_ICONS } from '@/lib/utils';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const CHART_COLORS = ['#22c55e', '#3b82f6', '#f97316', '#8b5cf6', '#ef4444', '#eab308'];

export default function DashboardPage() {
  const { transactions, budgets, investments, goals, currency } = useFinanceStore();

  const currentMonth = useMemo(() => new Date().toISOString().slice(0, 7), []);

  const monthlyStats = useMonthlyStats(transactions);
  const last6 = monthlyStats.slice(-6);

  const currentStats = useMemo(() => {
    const month = currentMonth;
    const monthTx = transactions.filter((t) => t.date.startsWith(month));
    const income = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, net: income - expense };
  }, [transactions, currentMonth]);

  const portfolioValue = useMemo(() =>
    investments.reduce((s, i) => s + i.currentPrice * i.quantity, 0),
    [investments]
  );

  const budgetProgress = useBudgetProgress(budgets, transactions, currentMonth);

  // Expense breakdown by category for pie
  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonth))
      .forEach((t) => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return Object.entries(map)
      .map(([category, amount]) => ({ category, amount, label: CATEGORY_LABELS[category as never] }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }, [transactions, currentMonth]);

  const recentTransactions = transactions.slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Bu Ay Gelir"
          value={formatCurrency(currentStats.income, currency)}
          sub="Aylık toplam"
          color="green"
          icon={<TrendingUp size={18} />}
        />
        <StatCard
          label="Bu Ay Gider"
          value={formatCurrency(currentStats.expense, currency)}
          sub="Aylık toplam"
          color="red"
          icon={<TrendingDown size={18} />}
        />
        <StatCard
          label="Net Tasarruf"
          value={formatCurrency(currentStats.net, currency)}
          trend={currentStats.net}
          sub={currentStats.net >= 0 ? 'Pozitif bakiye' : 'Negatif bakiye'}
          color="blue"
          icon={<Wallet size={18} />}
        />
        <StatCard
          label="Portföy Değeri"
          value={formatCurrency(portfolioValue, 'USD')}
          sub="Toplam yatırım"
          color="purple"
          icon={<Target size={18} />}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cash flow area chart */}
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
              <Tooltip
                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#d1d5db' }}
                itemStyle={{ color: '#f9fafb' }}
                formatter={(v: number) => formatCurrency(v, currency)}
              />
              <Area type="monotone" dataKey="income" name="Gelir" stroke="#22c55e" fill="url(#incomeGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="expense" name="Gider" stroke="#ef4444" fill="url(#expenseGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie chart */}
        <Card>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Gider Dağılımı</h2>
          {expenseByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%" cy="45%"
                  innerRadius={50} outerRadius={75}
                  dataKey="amount" nameKey="label"
                  paddingAngle={3}
                >
                  {expenseByCategory.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v, currency)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-12">Bu ay veri yok</p>
          )}
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent transactions */}
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
                  <span className="text-lg">{CATEGORY_ICONS[tx.category]}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{tx.description}</p>
                    <p className="text-xs text-gray-400">{formatDate(tx.date)}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold font-mono ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Budget overview */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Bütçe Durumu</h2>
            <Link href="/budget" className="text-xs text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline">
              Yönet <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-4">
            {budgetProgress.map((b) => (
              <div key={b.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    {CATEGORY_ICONS[b.category]} {CATEGORY_LABELS[b.category]}
                  </span>
                  <span className={`text-xs font-mono ${b.overBudget ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-500'}`}>
                    {formatCurrency(b.spent, currency)} / {formatCurrency(b.limit, currency)}
                  </span>
                </div>
                <ProgressBar value={b.percentage} color={b.color} showLabel />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Goals quick view */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Hedefler</h2>
          <Link href="/goals" className="text-xs text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline">
            Tümünü gör <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {goals.map((g) => {
            const pct = (g.currentAmount / g.targetAmount) * 100;
            return (
              <div key={g.id} className="text-center">
                <div className="text-2xl mb-1">{g.icon}</div>
                <p className="text-xs font-medium text-gray-900 dark:text-white mb-2 truncate">{g.name}</p>
                <ProgressBar value={pct} color={g.color} height={8} />
                <p className="text-xs text-gray-400 mt-1 font-mono">{Math.round(pct)}%</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
