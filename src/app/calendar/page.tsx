'use client';

export const runtime = 'edge';

import { useState, useMemo } from 'react';
import { Plus, Trash2, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
import { useFinanceStore } from '@/store/useFinanceStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { formatCurrency, CATEGORY_LABELS, PAYMENT_CATEGORY_LABELS, MONTHS_TR } from '@/lib/utils';
import PaymentCategoryIcon from '@/components/ui/PaymentCategoryIcon';
import { PaymentSchedule, TransactionCategory, PaymentCategory } from '@/types';

const EXPENSE_CATEGORIES: TransactionCategory[] = [
  'food', 'transport', 'housing', 'health', 'education', 'entertainment', 'shopping', 'utilities', 'other_expense',
];
const INCOME_CATEGORIES: TransactionCategory[] = ['salary', 'freelance', 'investment', 'other_income'];
const PAYMENT_CATS = Object.keys(PAYMENT_CATEGORY_LABELS) as PaymentCategory[];

const INPUT_CLS = 'w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500';
const LABEL_CLS = 'block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5';

const defaultForm: Omit<PaymentSchedule, 'id'> = {
  title: '', amount: 0, currency: 'TRY', dueDay: 1,
  type: 'expense', category: 'utilities', paymentCategory: undefined,
  isActive: true, note: '',
};

export default function CalendarPage() {
  const { paymentSchedules, addPaymentSchedule, updatePaymentSchedule, deletePaymentSchedule, currency } = useFinanceStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();

  const active = paymentSchedules.filter((p) => p.isActive);
  const totalExpense = active.filter((p) => p.type === 'expense').reduce((s, p) => s + p.amount, 0);
  const totalIncome = active.filter((p) => p.type === 'income').reduce((s, p) => s + p.amount, 0);

  const byDay = useMemo(() =>
    [...paymentSchedules].filter((p) => p.isActive).sort((a, b) => a.dueDay - b.dueDay),
    [paymentSchedules]);

  function openAdd() { setForm(defaultForm); setEditingId(null); setModalOpen(true); }
  function openEdit(p: PaymentSchedule) {
    setForm({ title: p.title, amount: p.amount, currency: p.currency, dueDay: p.dueDay,
      type: p.type, category: p.category, paymentCategory: p.paymentCategory,
      isActive: p.isActive, note: p.note });
    setEditingId(p.id); setModalOpen(true);
  }
  function handleSubmit() {
    if (!form.title || !form.amount) return;
    if (editingId) updatePaymentSchedule(editingId, form);
    else addPaymentSchedule(form);
    setModalOpen(false); setEditingId(null);
  }
  function toggleActive(p: PaymentSchedule) { updatePaymentSchedule(p.id, { isActive: !p.isActive }); }

  const cats = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400">Aylık Sabit Gider</p>
          <p className="text-xl font-semibold font-mono mt-1 text-red-600 dark:text-red-400">{formatCurrency(totalExpense, currency)}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400">Aylık Sabit Gelir</p>
          <p className="text-xl font-semibold font-mono mt-1 text-green-600 dark:text-green-400">{formatCurrency(totalIncome, currency)}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400">Net Sabit</p>
          <p className={`text-xl font-semibold font-mono mt-1 ${totalIncome - totalExpense >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(totalIncome - totalExpense, currency)}
          </p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            {MONTHS_TR[currentMonth]} {now.getFullYear()} — Ödeme Takvimi
          </h2>
          <Button variant="primary" size="sm" onClick={openAdd}><Plus size={14} /> Ekle</Button>
        </div>

        {/* Day strip */}
        <div className="flex gap-1.5 flex-wrap mb-6">
          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
            const hasPay = byDay.some((p) => p.dueDay === day);
            const isToday = day === currentDay;
            const isPast = day < currentDay;
            return (
              <div key={day}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium
                  ${isToday ? 'text-white' : hasPay ? (isPast ? 'bg-gray-100 dark:bg-gray-800 text-gray-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600') : 'text-gray-300 dark:text-gray-700'}`}
                style={isToday ? { backgroundColor: '#5F17EC' } : undefined}>
                {day}
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          {byDay.map((p) => {
            const isPast = p.dueDay < currentDay;
            const isToday = p.dueDay === currentDay;
            const pcLabel = p.paymentCategory ? PAYMENT_CATEGORY_LABELS[p.paymentCategory] : CATEGORY_LABELS[p.category];
            const pcIcon = p.paymentCategory ? <PaymentCategoryIcon category={p.paymentCategory} size={18} /> : null;
            return (
              <div key={p.id}
                className={`group flex items-center justify-between px-4 py-3 rounded-lg border transition-colors
                  ${isToday ? 'border-[#5F17EC] bg-purple-50 dark:bg-purple-900/10' : isPast ? 'border-gray-100 dark:border-gray-800 opacity-60' : 'border-gray-100 dark:border-gray-800 hover:border-gray-200'}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0
                    ${p.type === 'expense' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                    {pcIcon ?? <span className="text-xs font-bold text-gray-600">{p.dueDay}</span>}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.title}</p>
                    <p className="text-xs text-gray-400">{pcLabel}{p.note ? ` · ${p.note}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <span className={`text-sm font-semibold font-mono ${p.type === 'expense' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {p.type === 'expense' ? '-' : '+'}{formatCurrency(p.amount, p.currency)}
                    </span>
                    <p className="text-xs text-gray-400">her ayın {p.dueDay}.</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => toggleActive(p)} className="p-1 text-gray-400 hover:text-brand-500 transition-colors">
                      {p.isActive ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}
                    </button>
                    <button onClick={() => openEdit(p)} className="p-1 text-gray-400 hover:text-brand-500 transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => deletePaymentSchedule(p.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {byDay.length === 0 && <p className="text-center text-sm text-gray-400 py-8">Ödeme takvimi boş</p>}
        </div>
      </Card>

      {paymentSchedules.filter((p) => !p.isActive).length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Pasif Ödemeler</h2>
          <div className="space-y-2">
            {paymentSchedules.filter((p) => !p.isActive).map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-dashed border-gray-200 dark:border-gray-800 opacity-50">
                <span className="text-sm text-gray-500">{p.title}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-gray-400">{formatCurrency(p.amount, p.currency)}</span>
                  <button onClick={() => toggleActive(p)} className="p-1 text-gray-400 hover:text-green-500 transition-colors"><ToggleLeft size={18} /></button>
                  <button onClick={() => deletePaymentSchedule(p.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Ödemeyi Düzenle' : 'Yeni Ödeme Ekle'}>
        <div className="space-y-4">
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            {(['expense', 'income'] as const).map((t) => (
              <button key={t}
                onClick={() => setForm({ ...form, type: t, category: t === 'expense' ? 'utilities' : 'salary' })}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${form.type === t ? (t === 'expense' ? 'bg-red-500 text-white' : 'bg-green-500 text-white') : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                {t === 'expense' ? '— Gider' : '+ Gelir'}
              </button>
            ))}
          </div>

          <div>
            <label className={LABEL_CLS}>Başlık</label>
            <input type="text" placeholder="Ofis kirası, sunucu, sigorta..." value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} className={INPUT_CLS} />
          </div>

          {/* Payment category — replaces service */}
          <div>
            <label className={LABEL_CLS}>Ödeme Türü</label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_CATS.map((pc) => (
                <button key={pc}
                  onClick={() => setForm({ ...form, paymentCategory: pc })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors text-left ${
                    form.paymentCategory === pc
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}>
                  <PaymentCategoryIcon category={pc} size={14} />
                  {PAYMENT_CATEGORY_LABELS[pc]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>Tutar</label>
              <input type="number" value={form.amount || ''}
                onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Ayın Günü</label>
              <input type="number" min={1} max={31} value={form.dueDay}
                onChange={(e) => setForm({ ...form, dueDay: parseInt(e.target.value) || 1 })} className={INPUT_CLS} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>Muhasebe Kategorisi</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as TransactionCategory })} className={INPUT_CLS}>
                {cats.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL_CLS}>Para Birimi</label>
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className={INPUT_CLS}>
                {['TRY', 'USD', 'EUR'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={LABEL_CLS}>Not (banka, firma adı vb.)</label>
            <input type="text" placeholder="İş Bankası, Vodafone, Adobe..." value={form.note ?? ''}
              onChange={(e) => setForm({ ...form, note: e.target.value })} className={INPUT_CLS} />
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
