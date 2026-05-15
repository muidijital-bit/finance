'use client';

export const runtime = 'edge';

import { useState, useMemo } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/utils';
import { Loan } from '@/types';
import {
  Plus, Trash2, Pencil, CreditCard, ChevronDown, ChevronUp,
  CheckCircle2, Circle, AlertTriangle, TrendingDown,
} from 'lucide-react';

const INPUT_CLS = 'w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500';
const LABEL_CLS = 'block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5';

type FormState = {
  title: string;
  lender: string;
  principal: string;
  totalAmount: string;
  installmentCount: string;
  installmentAmount: string;
  startDate: string;
  dueDay: string;
  currency: string;
  note: string;
};

const defaultForm: FormState = {
  title: '',
  lender: '',
  principal: '',
  totalAmount: '',
  installmentCount: '',
  installmentAmount: '',
  startDate: new Date().toISOString().slice(0, 7) + '-01',
  dueDay: '1',
  currency: 'TRY',
  note: '',
};

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 7);
}

function getLoanSchedule(loan: Loan) {
  return Array.from({ length: loan.installmentCount }, (_, i) => ({
    index: i + 1,
    month: addMonths(loan.startDate, i),
    amount: loan.installmentAmount,
    paid: i < loan.paidCount,
  }));
}

export default function LoansPage() {
  const { loans, addLoan, updateLoan, deleteLoan, currency } = useFinanceStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Auto-calculate totalAmount when installmentCount or installmentAmount changes
  function handleFormChange(patch: Partial<FormState>) {
    setForm((prev) => {
      const next = { ...prev, ...patch };
      // Auto-calc total if both fields filled
      const ic = parseFloat(next.installmentCount);
      const ia = parseFloat(next.installmentAmount);
      if (!isNaN(ic) && !isNaN(ia) && ic > 0 && ia > 0) {
        next.totalAmount = (ic * ia).toFixed(2);
      }
      return next;
    });
  }

  function openAdd() {
    setForm(defaultForm);
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(loan: Loan) {
    setForm({
      title: loan.title,
      lender: loan.lender,
      principal: String(loan.principal),
      totalAmount: String(loan.totalAmount),
      installmentCount: String(loan.installmentCount),
      installmentAmount: String(loan.installmentAmount),
      startDate: loan.startDate,
      dueDay: String(loan.dueDay),
      currency: loan.currency,
      note: loan.note ?? '',
    });
    setEditingId(loan.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.title || !form.installmentCount || !form.installmentAmount) return;
    const payload: Omit<Loan, 'id'> = {
      title: form.title,
      lender: form.lender,
      principal: parseFloat(form.principal) || 0,
      totalAmount: parseFloat(form.totalAmount) || 0,
      installmentCount: parseInt(form.installmentCount),
      installmentAmount: parseFloat(form.installmentAmount),
      startDate: form.startDate,
      dueDay: parseInt(form.dueDay) || 1,
      currency: form.currency,
      note: form.note || undefined,
      isActive: true,
      paidCount: editingId ? (loans.find((l) => l.id === editingId)?.paidCount ?? 0) : 0,
    };
    if (editingId) await updateLoan(editingId, payload);
    else await addLoan(payload);
    setModalOpen(false);
  }

  const totalMonthlyBurden = useMemo(() =>
    loans.filter((l) => l.isActive && l.paidCount < l.installmentCount)
      .reduce((s, l) => s + (l.currency === currency ? l.installmentAmount : l.installmentAmount), 0),
    [loans, currency]
  );

  const totalRemaining = useMemo(() =>
    loans.filter((l) => l.isActive)
      .reduce((s, l) => s + (l.installmentCount - l.paidCount) * l.installmentAmount, 0),
    [loans]
  );

  const activeCount = loans.filter((l) => l.isActive && l.paidCount < l.installmentCount).length;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400">Aktif Kredi</p>
          <p className="text-xl font-semibold font-mono mt-1 text-gray-900 dark:text-white">{activeCount} adet</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400">Aylık Taksit Yükü</p>
          <p className="text-xl font-semibold font-mono mt-1 text-red-600 dark:text-red-400">{formatCurrency(totalMonthlyBurden, currency)}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400">Toplam Kalan Borç</p>
          <p className="text-xl font-semibold font-mono mt-1 text-orange-600 dark:text-orange-400">{formatCurrency(totalRemaining, currency)}</p>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Kredi / Taksit Planları</h2>
        <Button variant="primary" size="sm" onClick={openAdd}><Plus size={14} /> Yeni Kredi Ekle</Button>
      </div>

      {loans.length === 0 && (
        <Card className="text-center py-12">
          <CreditCard size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400 text-sm">Henüz kredi eklenmedi.</p>
          <Button variant="primary" size="sm" className="mt-3" onClick={openAdd}><Plus size={14} /> İlk Krediyi Ekle</Button>
        </Card>
      )}

      <div className="space-y-4">
        {loans.map((loan) => {
          const schedule = getLoanSchedule(loan);
          const remaining = loan.installmentCount - loan.paidCount;
          const remainingAmount = remaining * loan.installmentAmount;
          const progress = loan.installmentCount > 0 ? (loan.paidCount / loan.installmentCount) * 100 : 0;
          const isComplete = loan.paidCount >= loan.installmentCount;
          const expanded = expandedId === loan.id;

          return (
            <Card key={loan.id} className="group">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isComplete ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    {isComplete
                      ? <CheckCircle2 size={18} className="text-green-600" />
                      : <CreditCard size={18} className="text-red-600" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{loan.title}</p>
                    {loan.lender && <p className="text-xs text-gray-400">{loan.lender}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(loan)} className="p-1.5 text-gray-400 hover:text-brand-500 transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => setDeleteConfirm(loan.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
                  <p className="text-xs text-gray-400 mb-0.5">Ana Para</p>
                  <p className="text-sm font-semibold font-mono text-gray-900 dark:text-white">{formatCurrency(loan.principal, loan.currency)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
                  <p className="text-xs text-gray-400 mb-0.5">Aylık Taksit</p>
                  <p className="text-sm font-semibold font-mono text-red-600 dark:text-red-400">{formatCurrency(loan.installmentAmount, loan.currency)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
                  <p className="text-xs text-gray-400 mb-0.5">Kalan Taksit</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{remaining} / {loan.installmentCount}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
                  <p className="text-xs text-gray-400 mb-0.5">Kalan Borç</p>
                  <p className="text-sm font-semibold font-mono text-orange-600 dark:text-orange-400">{formatCurrency(remainingAmount, loan.currency)}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-400">{loan.paidCount} taksit ödendi</span>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, backgroundColor: isComplete ? '#22c55e' : '#5F17EC' }} />
                </div>
                {loan.note && <p className="text-xs text-gray-400 mt-1.5 italic">{loan.note}</p>}
              </div>

              {/* Paid count buttons */}
              {!isComplete && (
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={() => updateLoan(loan.id, { paidCount: Math.max(0, loan.paidCount - 1) })}
                    className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-40"
                    disabled={loan.paidCount === 0}>
                    − Taksit
                  </button>
                  <button
                    onClick={() => updateLoan(loan.id, { paidCount: Math.min(loan.installmentCount, loan.paidCount + 1) })}
                    className="px-3 py-1.5 text-xs rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors">
                    ✓ Taksit Ödendi
                  </button>
                  <span className="text-xs text-gray-400 ml-auto">
                    Sonraki: <span className="font-medium text-gray-700 dark:text-gray-300">{addMonths(loan.startDate, loan.paidCount)} ayın {loan.dueDay}.</span>
                  </span>
                </div>
              )}

              {isComplete && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 mb-3">
                  <CheckCircle2 size={13} className="text-green-500" />
                  <span className="text-xs text-green-700 dark:text-green-300 font-medium">Kredi tamamen ödendi!</span>
                </div>
              )}

              {/* Expand/collapse schedule */}
              <button
                onClick={() => setExpandedId(expanded ? null : loan.id)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-brand-500 transition-colors w-full">
                {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                {expanded ? 'Planı gizle' : 'Ödeme planını göster'}
              </button>

              {expanded && (
                <div className="mt-3 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-[auto_1fr_auto_auto] text-xs font-medium text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-2 gap-3">
                    <span>#</span><span>Ay</span><span>Tutar</span><span>Durum</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
                    {schedule.map((s) => (
                      <div key={s.index} className={`grid grid-cols-[auto_1fr_auto_auto] items-center px-3 py-2 gap-3 text-xs ${s.paid ? 'opacity-50' : ''}`}>
                        <span className="text-gray-400 w-5 text-right">{s.index}</span>
                        <span className="text-gray-700 dark:text-gray-300">{s.month}</span>
                        <span className="font-mono text-gray-900 dark:text-white">{formatCurrency(s.amount, loan.currency)}</span>
                        <span>
                          {s.paid
                            ? <CheckCircle2 size={13} className="text-green-500" />
                            : <Circle size={13} className="text-gray-300" />}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                    <span className="text-gray-400 flex items-center gap-1"><TrendingDown size={11} /> Toplam geri ödeme</span>
                    <span className="font-mono font-semibold text-gray-900 dark:text-white">{formatCurrency(loan.totalAmount, loan.currency)}</span>
                  </div>
                  {loan.totalAmount > loan.principal && (
                    <div className="px-3 py-2 bg-orange-50 dark:bg-orange-900/10 border-t border-orange-100 dark:border-orange-900 flex items-center gap-2 text-xs text-orange-700 dark:text-orange-400">
                      <AlertTriangle size={11} />
                      Faiz yükü: {formatCurrency(loan.totalAmount - loan.principal, loan.currency)}
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Kredi Düzenle' : 'Yeni Kredi Ekle'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>Kredi Adı</label>
              <input type="text" placeholder="Taşıt kredisi, konut..." value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} className={INPUT_CLS} autoFocus />
            </div>
            <div>
              <label className={LABEL_CLS}>Banka / Kurum</label>
              <input type="text" placeholder="İş Bankası, Vakıfbank..." value={form.lender}
                onChange={(e) => setForm({ ...form, lender: e.target.value })} className={INPUT_CLS} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>Ana Para</label>
              <input type="number" placeholder="0.00" value={form.principal}
                onChange={(e) => setForm({ ...form, principal: e.target.value })} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Para Birimi</label>
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className={INPUT_CLS}>
                {['TRY', 'USD', 'EUR', 'GBP'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>Taksit Sayısı</label>
              <input type="number" placeholder="12, 24, 36..." value={form.installmentCount}
                onChange={(e) => handleFormChange({ installmentCount: e.target.value })} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Aylık Taksit Tutarı</label>
              <input type="number" placeholder="0.00" value={form.installmentAmount}
                onChange={(e) => handleFormChange({ installmentAmount: e.target.value })} className={INPUT_CLS} />
            </div>
          </div>

          <div>
            <label className={LABEL_CLS}>Toplam Geri Ödeme (otomatik hesaplanır)</label>
            <input type="number" placeholder="0.00" value={form.totalAmount}
              onChange={(e) => setForm({ ...form, totalAmount: e.target.value })} className={INPUT_CLS} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>İlk Taksit Tarihi</label>
              <input type="date" value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Ödeme Günü (ayın kaçı)</label>
              <input type="number" min={1} max={31} placeholder="1-31" value={form.dueDay}
                onChange={(e) => setForm({ ...form, dueDay: e.target.value })} className={INPUT_CLS} />
            </div>
          </div>

          <div>
            <label className={LABEL_CLS}>Not (opsiyonel)</label>
            <input type="text" placeholder="Araç plakası, tapu no..." value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })} className={INPUT_CLS} />
          </div>

          {/* Preview */}
          {form.installmentCount && form.installmentAmount && (
            <div className="text-xs bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-lg px-3 py-2 space-y-1 text-brand-700 dark:text-brand-300">
              <p><span className="font-medium">{form.installmentCount} taksit</span> × {formatCurrency(parseFloat(form.installmentAmount) || 0, form.currency)} = <span className="font-semibold">{formatCurrency((parseFloat(form.installmentCount) || 0) * (parseFloat(form.installmentAmount) || 0), form.currency)}</span></p>
              {form.principal && parseFloat(form.totalAmount) > parseFloat(form.principal) && (
                <p className="text-orange-600 dark:text-orange-400">Faiz yükü: {formatCurrency(parseFloat(form.totalAmount) - parseFloat(form.principal), form.currency)}</p>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>İptal</Button>
            <Button variant="primary" className="flex-1" onClick={handleSubmit}
              disabled={!form.title || !form.installmentCount || !form.installmentAmount}>
              {editingId ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Krediyi Sil">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Bu kredi kaydı silinecek. Bu işlem geri alınamaz.</p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteConfirm(null)}>İptal</Button>
            <Button variant="primary" className="flex-1" style={{ backgroundColor: '#ef4444' }}
              onClick={() => { deleteLoan(deleteConfirm!); setDeleteConfirm(null); }}>
              <Trash2 size={14} /> Sil
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
