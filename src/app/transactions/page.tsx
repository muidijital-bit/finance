'use client';

import { useState, useMemo } from 'react';
import { Plus, Trash2, Search } from 'lucide-react';
import { useFinanceStore } from '@/store/useFinanceStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { formatCurrency, formatDate, CATEGORY_LABELS, CATEGORY_ICONS, SERVICE_LABELS } from '@/lib/utils';
import { Transaction, TransactionCategory, TransactionType, MuiService } from '@/types';

const INCOME_CATEGORIES: TransactionCategory[] = ['salary', 'freelance', 'investment', 'other_income'];
const EXPENSE_CATEGORIES: TransactionCategory[] = [
  'food', 'transport', 'housing', 'health', 'education', 'entertainment', 'shopping', 'utilities', 'other_expense',
];
const SERVICES = Object.keys(SERVICE_LABELS) as MuiService[];

const INPUT_CLS = 'w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500';
const LABEL_CLS = 'block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5';

const defaultForm = {
  type: 'income' as TransactionType,
  category: 'freelance' as TransactionCategory,
  amount: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  service: '' as MuiService | '',
};

export default function TransactionsPage() {
  const { transactions, addTransaction, deleteTransaction, currency } = useFinanceStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');

  const filtered = useMemo(() =>
    transactions
      .filter((t) => {
        const matchType = filterType === 'all' || t.type === filterType;
        const matchSearch = t.description.toLowerCase().includes(search.toLowerCase()) ||
          CATEGORY_LABELS[t.category].toLowerCase().includes(search.toLowerCase()) ||
          (t.service ? SERVICE_LABELS[t.service].toLowerCase().includes(search.toLowerCase()) : false);
        return matchType && matchSearch;
      })
      .sort((a, b) => b.date.localeCompare(a.date)),
    [transactions, filterType, search]
  );

  const totalIncome = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  function handleSubmit() {
    if (!form.amount || !form.description) return;
    addTransaction({
      type: form.type,
      category: form.category,
      amount: parseFloat(form.amount),
      description: form.description,
      date: form.date,
      service: form.service || undefined,
    });
    setForm(defaultForm);
    setModalOpen(false);
  }

  const cats = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Toplam Gelir', value: totalIncome, color: 'text-green-600 dark:text-green-400' },
          { label: 'Toplam Gider', value: totalExpense, color: 'text-red-600 dark:text-red-400' },
          { label: 'Net', value: totalIncome - totalExpense, color: totalIncome - totalExpense >= 0 ? 'text-blue-600' : 'text-red-600' },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p className={`text-lg font-semibold font-mono mt-1 ${color}`}>{formatCurrency(value, currency)}</p>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="İşlem ara..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          {(['all', 'income', 'expense'] as const).map((t) => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-3 py-2 text-xs font-medium transition-colors ${filterType === t ? 'bg-brand-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              {t === 'all' ? 'Tümü' : t === 'income' ? 'Gelir' : 'Gider'}
            </button>
          ))}
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          <Plus size={15} /> Ekle
        </Button>
      </div>

      <Card padding="sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                {['Kategori', 'Hizmet', 'Açıklama', 'Tarih', 'Tutar', ''].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 pb-3 px-3 first:pl-0 last:pr-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((tx) => (
                <tr key={tx.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-3 first:pl-0">
                    <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      {CATEGORY_ICONS[tx.category]} {CATEGORY_LABELS[tx.category]}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {tx.service ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                        {SERVICE_LABELS[tx.service]}
                      </span>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="py-3 px-3 text-gray-900 dark:text-white">{tx.description}</td>
                  <td className="py-3 px-3 text-gray-500 text-xs">{formatDate(tx.date)}</td>
                  <td className={`py-3 px-3 font-semibold font-mono ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                  </td>
                  <td className="py-3 pr-0 text-right">
                    <button onClick={() => deleteTransaction(tx.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center text-sm text-gray-400 py-12">İşlem bulunamadı</p>}
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Yeni İşlem Ekle">
        <div className="space-y-4">
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            {(['income', 'expense'] as const).map((t) => (
              <button key={t}
                onClick={() => setForm({ ...form, type: t, category: t === 'income' ? 'freelance' : 'food' })}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${form.type === t ? (t === 'income' ? 'bg-green-500 text-white' : 'bg-red-500 text-white') : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                {t === 'income' ? 'Gelir' : 'Gider'}
              </button>
            ))}
          </div>

          <div>
            <label className={LABEL_CLS}>Hizmet</label>
            <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value as MuiService | '' })} className={INPUT_CLS}>
              <option value="">— Seçiniz —</option>
              {SERVICES.map((s) => <option key={s} value={s}>{SERVICE_LABELS[s]}</option>)}
            </select>
          </div>

          <div>
            <label className={LABEL_CLS}>Kategori</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as TransactionCategory })} className={INPUT_CLS}>
              {cats.map((c) => <option key={c} value={c}>{CATEGORY_ICONS[c]} {CATEGORY_LABELS[c]}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>Tutar (₺)</label>
              <input type="number" placeholder="0.00" value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Tarih</label>
              <input type="date" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })} className={INPUT_CLS} />
            </div>
          </div>

          <div>
            <label className={LABEL_CLS}>Açıklama</label>
            <input type="text" placeholder="Müşteri adı veya açıklama" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} className={INPUT_CLS} />
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
