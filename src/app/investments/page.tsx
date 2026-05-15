'use client';

import { useState, useMemo } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, Pencil } from 'lucide-react';
import { useFinanceStore } from '@/store/useFinanceStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Investment } from '@/types';

type InvestmentType = Investment['type'];

const TYPE_LABELS: Record<InvestmentType, string> = {
  stock: 'Hisse Senedi',
  crypto: 'Kripto',
  fund: 'Fon',
  bond: 'Tahvil',
  real_estate: 'Gayrimenkul',
  deposit: 'Vadeli Hesap',
  other: 'Diğer',
};

const TYPE_ICONS: Record<InvestmentType, string> = {
  stock: '📈',
  crypto: '₿',
  fund: '🏦',
  bond: '📄',
  real_estate: '🏠',
  deposit: '🏛️',
  other: '💼',
};

const INPUT_CLS = 'w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500';
const LABEL_CLS = 'block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5';

type FormState = Omit<Investment, 'id'>;

const defaultForm: FormState = {
  name: '',
  symbol: '',
  type: 'stock',
  quantity: 0,
  buyPrice: 0,
  currentPrice: 0,
  currency: 'USD',
  date: new Date().toISOString().split('T')[0],
  interestRate: undefined,
  maturityDate: undefined,
};

function calcDepositCurrentPrice(principal: number, annualRate: number, startDate: string): number {
  const days = Math.max(0, (Date.now() - new Date(startDate).getTime()) / 86400000);
  return principal * (1 + (annualRate / 100) * (days / 365));
}

export default function InvestmentsPage() {
  const { investments, addInvestment, updateInvestment, deleteInvestment } = useFinanceStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const enriched = useMemo(() =>
    investments.map((inv) => {
      const currentPrice =
        inv.type === 'deposit' && inv.interestRate != null
          ? calcDepositCurrentPrice(inv.buyPrice, inv.interestRate, inv.date)
          : inv.currentPrice;
      const value = currentPrice * inv.quantity;
      const cost = inv.buyPrice * inv.quantity;
      const pnl = value - cost;
      const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
      return { ...inv, currentPrice, value, cost, pnl, pnlPct };
    }),
    [investments]
  );

  const portfolioStats = useMemo(() => {
    const totalCost = enriched.reduce((s, i) => s + i.cost, 0);
    const totalValue = enriched.reduce((s, i) => s + i.value, 0);
    const profit = totalValue - totalCost;
    const profitPct = totalCost > 0 ? (profit / totalCost) * 100 : 0;
    return { totalCost, totalValue, profit, profitPct };
  }, [enriched]);

  function set(patch: Partial<FormState>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function handleSubmit() {
    if (!form.name) return;
    const payload: FormState =
      form.type === 'deposit'
        ? { ...form, quantity: 1, symbol: form.symbol || 'VH', currentPrice: form.buyPrice }
        : form;

    if (editingId) {
      updateInvestment(editingId, payload);
      setEditingId(null);
    } else {
      addInvestment(payload);
    }
    setForm(defaultForm);
    setModalOpen(false);
  }

  function openEdit(inv: Investment) {
    setForm({
      name: inv.name, symbol: inv.symbol, type: inv.type,
      quantity: inv.quantity, buyPrice: inv.buyPrice, currentPrice: inv.currentPrice,
      currency: inv.currency, date: inv.date,
      interestRate: inv.interestRate, maturityDate: inv.maturityDate,
    });
    setEditingId(inv.id);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(defaultForm);
  }

  const isDeposit = form.type === 'deposit';

  return (
    <div className="space-y-6">
      {/* Portfolio overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400">Toplam Değer</p>
          <p className="text-xl font-semibold font-mono mt-1 text-gray-900 dark:text-white">{formatCurrency(portfolioStats.totalValue, 'USD')}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400">Toplam Maliyet</p>
          <p className="text-xl font-semibold font-mono mt-1 text-gray-900 dark:text-white">{formatCurrency(portfolioStats.totalCost, 'USD')}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400">Kar/Zarar</p>
          <p className={`text-xl font-semibold font-mono mt-1 ${portfolioStats.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {portfolioStats.profit >= 0 ? '+' : ''}{formatCurrency(portfolioStats.profit, 'USD')}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400">Getiri</p>
          <p className={`text-xl font-semibold font-mono mt-1 flex items-center gap-1 ${portfolioStats.profitPct >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {portfolioStats.profitPct >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {portfolioStats.profitPct >= 0 ? '+' : ''}{portfolioStats.profitPct.toFixed(2)}%
          </p>
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{investments.length} Yatırım Aracı</h2>
        <Button variant="primary" size="sm" onClick={() => { setEditingId(null); setForm(defaultForm); setModalOpen(true); }}>
          <Plus size={14} /> Yatırım Ekle
        </Button>
      </div>

      {/* Table */}
      <Card padding="sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                {['Araç', 'Tür', 'Miktar / Faiz', 'Alış / Ana Para', 'Güncel Değer', 'Toplam', 'Kar/Faiz', ''].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 pb-3 px-2 first:pl-0 last:pr-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {enriched.map((inv) => (
                <tr key={inv.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-2 first:pl-0">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{inv.symbol}</p>
                      <p className="text-xs text-gray-400">{inv.name}</p>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-sm">{TYPE_ICONS[inv.type]}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{TYPE_LABELS[inv.type]}</span>
                  </td>
                  <td className="py-3 px-2 font-mono text-sm text-gray-700 dark:text-gray-300">
                    {inv.type === 'deposit'
                      ? <span className="text-brand-600 dark:text-brand-400 font-semibold">%{inv.interestRate ?? '—'}</span>
                      : inv.quantity
                    }
                    {inv.type === 'deposit' && inv.maturityDate && (
                      <p className="text-xs text-gray-400 mt-0.5">Vade: {formatDate(inv.maturityDate)}</p>
                    )}
                  </td>
                  <td className="py-3 px-2 font-mono text-sm text-gray-700 dark:text-gray-300">
                    {formatCurrency(inv.buyPrice, inv.currency)}
                  </td>
                  <td className="py-3 px-2 font-mono text-sm text-gray-900 dark:text-white">
                    {formatCurrency(inv.currentPrice, inv.currency)}
                  </td>
                  <td className="py-3 px-2 font-mono text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(inv.value, inv.currency)}
                  </td>
                  <td className={`py-3 px-2 font-mono text-sm font-medium ${inv.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {inv.pnl >= 0 ? '+' : ''}{formatCurrency(inv.pnl, inv.currency)}
                    <span className="text-xs ml-1">({inv.pnl >= 0 ? '+' : ''}{inv.pnlPct.toFixed(1)}%)</span>
                  </td>
                  <td className="py-3 pr-0 text-right">
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => openEdit(inv)}
                        className="p-1.5 rounded text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => deleteInvestment(inv.id)}
                        className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {investments.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-12">Henüz yatırım eklenmedi</p>
          )}
        </div>
      </Card>

      {/* Modal */}
      <Modal open={modalOpen} onClose={closeModal} title={editingId ? 'Yatırımı Düzenle' : 'Yeni Yatırım Ekle'}>
        <div className="space-y-4">
          {/* Tür */}
          <div>
            <label className={LABEL_CLS}>Yatırım Türü</label>
            <select value={form.type} onChange={(e) => set({ type: e.target.value as InvestmentType })} className={INPUT_CLS}>
              {Object.entries(TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{TYPE_ICONS[v as InvestmentType]} {l}</option>
              ))}
            </select>
          </div>

          {/* Ortak alanlar */}
          <div>
            <label className={LABEL_CLS}>{isDeposit ? 'Banka / Hesap Adı' : 'Araç Adı'}</label>
            <input type="text" placeholder={isDeposit ? 'Ziraat Bankası Vadeli' : 'Apple Inc.'} value={form.name}
              onChange={(e) => set({ name: e.target.value })} className={INPUT_CLS} />
          </div>

          {!isDeposit && (
            <div>
              <label className={LABEL_CLS}>Sembol</label>
              <input type="text" placeholder="AAPL" value={form.symbol}
                onChange={(e) => set({ symbol: e.target.value })} className={INPUT_CLS} />
            </div>
          )}

          {/* Vadeli hesap alanları */}
          {isDeposit ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLS}>Ana Para</label>
                  <input type="number" placeholder="100000" value={form.buyPrice || ''}
                    onChange={(e) => set({ buyPrice: parseFloat(e.target.value) || 0 })} className={INPUT_CLS} />
                </div>
                <div>
                  <label className={LABEL_CLS}>Yıllık Faiz Oranı (%)</label>
                  <input type="number" placeholder="42.5" step="0.01" value={form.interestRate ?? ''}
                    onChange={(e) => set({ interestRate: parseFloat(e.target.value) || undefined })} className={INPUT_CLS} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLS}>Açılış Tarihi</label>
                  <input type="date" value={form.date}
                    onChange={(e) => set({ date: e.target.value })} className={INPUT_CLS} />
                </div>
                <div>
                  <label className={LABEL_CLS}>Vade Tarihi</label>
                  <input type="date" value={form.maturityDate ?? ''}
                    onChange={(e) => set({ maturityDate: e.target.value })} className={INPUT_CLS} />
                </div>
              </div>
              <div>
                <label className={LABEL_CLS}>Para Birimi</label>
                <select value={form.currency} onChange={(e) => set({ currency: e.target.value })} className={INPUT_CLS}>
                  {['TRY', 'USD', 'EUR', 'GBP'].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {form.buyPrice > 0 && form.interestRate && (
                <div className="bg-brand-50 dark:bg-brand-900/20 rounded-lg px-4 py-3 text-sm text-brand-700 dark:text-brand-300">
                  Tahmini faiz getirisi: <span className="font-semibold font-mono">
                    {formatCurrency(form.buyPrice * (form.interestRate / 100), form.currency)}
                  </span> / yıl
                </div>
              )}
            </>
          ) : (
            /* Normal yatırım alanları */
            <div className="grid grid-cols-2 gap-3">
              {([
                { key: 'quantity', label: 'Miktar' },
                { key: 'buyPrice', label: 'Alış Fiyatı' },
                { key: 'currentPrice', label: 'Güncel Fiyat' },
              ] as { key: keyof FormState; label: string }[]).map(({ key, label }) => (
                <div key={key}>
                  <label className={LABEL_CLS}>{label}</label>
                  <input type="number" value={(form[key] as number) || ''}
                    onChange={(e) => set({ [key]: parseFloat(e.target.value) || 0 })} className={INPUT_CLS} />
                </div>
              ))}
              <div>
                <label className={LABEL_CLS}>Para Birimi</label>
                <select value={form.currency} onChange={(e) => set({ currency: e.target.value })} className={INPUT_CLS}>
                  {['USD', 'TRY', 'EUR', 'GBP'].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={closeModal}>İptal</Button>
            <Button variant="primary" className="flex-1" onClick={handleSubmit}>Kaydet</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
