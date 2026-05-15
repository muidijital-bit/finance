'use client';

export const runtime = 'edge';

import { useState, useMemo } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { useFinanceStore, useBudgetProgress } from '@/store/useFinanceStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ProgressBar from '@/components/ui/ProgressBar';
import CategoryIcon from '@/components/ui/CategoryIcon';
import { formatCurrency, CATEGORY_LABELS } from '@/lib/utils';
import { TransactionCategory } from '@/types';

const BUDGET_CATEGORIES: TransactionCategory[] = [
  'food', 'transport', 'housing', 'health', 'education', 'entertainment', 'shopping', 'utilities', 'other_expense',
];

const COLORS = ['#22c55e', '#3b82f6', '#f97316', '#8b5cf6', '#ef4444', '#eab308', '#06b6d4', '#ec4899', '#78716c'];

const defaultForm = {
  category: 'food' as TransactionCategory,
  limit: '',
  color: COLORS[0],
};

export default function BudgetPage() {
  const { budgets, addBudget, deleteBudget, transactions, currency } = useFinanceStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const currentMonth = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const budgetProgress = useBudgetProgress(budgets, transactions, currentMonth);

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgetProgress.reduce((s, b) => s + b.spent, 0);
  const overBudgetCount = budgetProgress.filter((b) => b.overBudget).length;

  function handleSubmit() {
    if (!form.limit) return;
    addBudget({
      category: form.category,
      limit: parseFloat(form.limit),
      period: 'monthly',
      color: form.color,
    });
    setForm(defaultForm);
    setModalOpen(false);
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400">Toplam Bütçe</p>
          <p className="text-xl font-semibold font-mono mt-1 text-gray-900 dark:text-white">{formatCurrency(totalBudget, currency)}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400">Bu Ay Harcama</p>
          <p className="text-xl font-semibold font-mono mt-1 text-orange-600 dark:text-orange-400">{formatCurrency(totalSpent, currency)}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400">Bütçe Aşımı</p>
          <p className={`text-xl font-semibold font-mono mt-1 ${overBudgetCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            {overBudgetCount} kategori
          </p>
        </Card>
      </div>

      {/* Overall progress */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Toplam Bütçe Kullanımı</h2>
          <span className="text-sm font-mono text-gray-500">{totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%</span>
        </div>
        <ProgressBar value={totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0} color="#3b82f6" height={10} />
        <p className="text-xs text-gray-400 mt-2">{formatCurrency(totalBudget - totalSpent, currency)} kaldı</p>
      </Card>

      {/* Budget cards */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Kategori Bütçeleri</h2>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          <Plus size={14} /> Bütçe Ekle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgetProgress.map((b) => (
          <Card key={b.id} className="group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"><CategoryIcon category={b.category} size={16} /></span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{CATEGORY_LABELS[b.category]}</p>
                  <p className="text-xs text-gray-400">Aylık limit</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {b.overBudget && <AlertCircle size={16} className="text-red-500" />}
                <button
                  onClick={() => deleteBudget(b.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-red-500 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <ProgressBar value={b.percentage} color={b.overBudget ? '#ef4444' : b.color} height={8} />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {formatCurrency(b.spent, currency)} harcandı
              </span>
              <span className={`text-xs font-medium ${b.overBudget ? 'text-red-600 dark:text-red-400' : 'text-gray-500'}`}>
                {b.overBudget ? `${formatCurrency(b.spent - b.limit, currency)} aşıldı` : `${formatCurrency(b.limit - b.spent, currency)} kaldı`}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 font-mono">Limit: {formatCurrency(b.limit, currency)}</p>
          </Card>
        ))}
      </div>

      {budgets.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-gray-400 text-sm">Henüz bütçe eklenmedi.</p>
          <Button variant="primary" size="sm" className="mt-3" onClick={() => setModalOpen(true)}>
            <Plus size={14} /> İlk Bütçeni Ekle
          </Button>
        </Card>
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Yeni Bütçe Ekle">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Kategori</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as TransactionCategory })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {BUDGET_CATEGORIES.filter((c) => !budgets.find((b) => b.category === c)).map((c) => (
                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Aylık Limit (₺)</label>
            <input
              type="number"
              placeholder="0"
              value={form.limit}
              onChange={(e) => setForm({ ...form, limit: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Renk</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setForm({ ...form, color: c })}
                  className="w-8 h-8 rounded-full border-2 transition-all"
                  style={{ backgroundColor: c, borderColor: form.color === c ? '#1f2937' : 'transparent' }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>İptal</Button>
            <Button variant="primary" className="flex-1" onClick={handleSubmit}>Kaydet</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
