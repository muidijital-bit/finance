'use client';

export const runtime = 'edge';

import { useState, useMemo } from 'react';
import { Plus, Trash2, Search, ChevronDown, X, Pencil, CheckSquare, Square, Layers, ShoppingCart } from 'lucide-react';
import { useFinanceStore } from '@/store/useFinanceStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import {
  formatCurrency, formatDate,
  CATEGORY_LABELS, CATEGORY_ICONS,
  SERVICE_LABELS, BRANDS, BRAND_MAP, MONTHS_TR,
} from '@/lib/utils';
import { Transaction, TransactionCategory, TransactionType, MuiService, CustomCategory } from '@/types';

const INCOME_CATEGORIES: TransactionCategory[] = ['salary', 'freelance', 'investment', 'other_income'];
const EXPENSE_CATEGORIES: TransactionCategory[] = [
  'personel', 'lisans_gider', 'kredi_gider', 'fatura',
  'yatirim_gider', 'demirbas_alimi', 'hizmet_gideri', 'kredi_karti', 'other_expense',
];
const SERVICES = Object.keys(SERVICE_LABELS) as MuiService[];

const INPUT_CLS = 'w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500';
const LABEL_CLS = 'block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5';

type FormState = {
  type: TransactionType;
  category: TransactionCategory;
  amount: string;
  description: string;
  note: string;
  remainingBalance: string;
  date: string;
  service: MuiService | '';
  brand: string;
  brandCustom: string;
};

const defaultForm: FormState = {
  type: 'income',
  category: 'freelance',
  amount: '',
  description: '',
  note: '',
  remainingBalance: '',
  date: new Date().toISOString().split('T')[0],
  service: '',
  brand: '',
  brandCustom: '',
};

// ─── Filter select pill ────────────────────────────────────────────────────────
function FilterSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const active = value !== '';
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className={`appearance-none pl-3 pr-7 py-2 text-xs rounded-lg border font-medium cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
          active
            ? 'bg-brand-500 text-white border-brand-500'
            : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-gray-300'
        }`}>
        <option value="">{label}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={12} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${active ? 'text-white' : 'text-gray-400'}`} />
    </div>
  );
}

// ─── Brand badge ───────────────────────────────────────────────────────────────
function BrandBadge({ brand }: { brand?: string }) {
  if (!brand) return <span className="text-gray-300 dark:text-gray-700">—</span>;
  const known = BRAND_MAP[brand];
  if (known) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
        style={{ backgroundColor: known.color + '20', color: known.color }}>
        {known.label}
      </span>
    );
  }
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 whitespace-nowrap">
      {brand}
    </span>
  );
}

// ─── Brand input: predefined list + custom entry ───────────────────────────────
function BrandInput({ value, customValue, onChange, onCustomChange, allBrands }: {
  value: string; customValue: string;
  onChange: (v: string) => void; onCustomChange: (v: string) => void;
  allBrands: { value: string; label: string }[];
}) {
  const isCustom = value === '__custom__';
  return (
    <div className="space-y-2">
      <select value={value} onChange={(e) => onChange(e.target.value)} className={INPUT_CLS}>
        <option value="">— Seçiniz —</option>
        {allBrands.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
        <option value="__custom__">+ Yeni marka gir...</option>
      </select>
      {isCustom && (
        <input
          type="text"
          placeholder="Marka / müşteri adı"
          value={customValue}
          onChange={(e) => onCustomChange(e.target.value)}
          className={INPUT_CLS}
          autoFocus
        />
      )}
    </div>
  );
}

// ─── Resolved brand value from form ───────────────────────────────────────────
function resolvedBrand(form: FormState): string | undefined {
  if (form.brand === '__custom__') return form.brandCustom.trim() || undefined;
  return form.brand || undefined;
}

export default function TransactionsPage() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, currency, customCategories, brands: dbBrands } = useFinanceStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);

  // Filters
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterService, setFilterService] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkService, setBulkService] = useState('');
  const [bulkBrand, setBulkBrand] = useState('');

  // Toplu satış modal
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [saleBrands, setSaleBrands] = useState<Set<string>>(new Set());
  const [saleService, setSaleService] = useState('');
  const [saleCategory, setSaleCategory] = useState<TransactionCategory>('freelance');
  const [saleAmounts, setSaleAmounts] = useState<Record<string, string>>({});
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [saleDescription, setSaleDescription] = useState('');

  // Custom income/expense categories from DB
  const customIncomeCats = useMemo(() => customCategories.filter((c) => c.type === 'income_cat'), [customCategories]);
  const customExpenseCats = useMemo(() => customCategories.filter((c) => c.type === 'expense_cat'), [customCategories]);
  const customServices = useMemo(() => customCategories.filter((c) => c.type === 'service'), [customCategories]);

  // Dynamic brands: DB brands + static list + any brand found in transaction data
  const allBrands = useMemo(() => {
    const map = new Map(BRANDS.map((b) => [b.value, b.label]));
    dbBrands.forEach((b) => map.set(b.value, b.label));
    transactions.forEach((t) => {
      if (t.brand && !map.has(t.brand)) map.set(t.brand, t.brand);
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [transactions, dbBrands]);

  // Dynamic brand filter options: only brands that exist in current data
  const brandFilterOptions = useMemo(() => {
    const inData = new Set(transactions.map((t) => t.brand).filter(Boolean));
    return allBrands.filter((b) => inData.has(b.value));
  }, [transactions, allBrands]);

  // Available months from data
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => set.add(t.date.slice(0, 7)));
    return Array.from(set).sort().reverse().map((m) => {
      const [y, mo] = m.split('-');
      return { value: m, label: `${MONTHS_TR[parseInt(mo) - 1]} ${y}` };
    });
  }, [transactions]);

  const hasFilters = !!(search || filterType !== 'all' || filterService || filterBrand || filterCategory || filterMonth);

  function clearFilters() {
    setSearch(''); setFilterType('all'); setFilterService('');
    setFilterBrand(''); setFilterCategory(''); setFilterMonth('');
  }

  const filtered = useMemo(() =>
    transactions
      .filter((t) => {
        if (filterType !== 'all' && t.type !== filterType) return false;
        if (filterService && t.service !== filterService) return false;
        if (filterBrand && t.brand !== filterBrand) return false;
        if (filterCategory && t.category !== filterCategory) return false;
        if (filterMonth && !t.date.startsWith(filterMonth)) return false;
        if (search) {
          const q = search.toLowerCase();
          const brandLabel = t.brand ? (BRAND_MAP[t.brand]?.label ?? t.brand) : '';
          if (
            !t.description.toLowerCase().includes(q) &&
            !CATEGORY_LABELS[t.category].toLowerCase().includes(q) &&
            !(t.service && SERVICE_LABELS[t.service].toLowerCase().includes(q)) &&
            !brandLabel.toLowerCase().includes(q)
          ) return false;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date)),
    [transactions, filterType, filterService, filterBrand, filterCategory, filterMonth, search]
  );

  const totalIncome = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  function openAdd() {
    setEditingId(null);
    setForm(defaultForm);
    setModalOpen(true);
  }

  function openEdit(tx: Transaction) {
    setEditingId(tx.id);
    setForm({
      type: tx.type,
      category: tx.category,
      amount: String(tx.amount),
      description: tx.description,
      note: tx.note ?? '',
      remainingBalance: tx.remainingBalance != null ? String(tx.remainingBalance) : '',
      date: tx.date,
      service: tx.service ?? '',
      brand: tx.brand ?? '',
      brandCustom: '',
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(defaultForm);
  }

  // ── Bulk helpers ──────────────────────────────────────────────────────────
  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function toggleSelectAll() {
    setSelectedIds((prev) =>
      prev.size === filtered.length ? new Set() : new Set(filtered.map((t) => t.id))
    );
  }
  function clearSelection() { setSelectedIds(new Set()); }

  async function applyBulkChanges() {
    for (const id of selectedIds) {
      const patch: Partial<Transaction> = {};
      if (bulkCategory) patch.category = bulkCategory as TransactionCategory;
      if (bulkService) patch.service = bulkService as MuiService;
      if (bulkBrand) patch.brand = bulkBrand;
      if (Object.keys(patch).length > 0) await updateTransaction(id, patch);
    }
    setBulkModalOpen(false);
    setBulkCategory(''); setBulkService(''); setBulkBrand('');
    clearSelection();
  }

  async function deleteBulk() {
    for (const id of selectedIds) await deleteTransaction(id);
    clearSelection();
    setBulkModalOpen(false);
  }

  // Toplu satış: gelir ekle her seçili marka için
  async function handleBulkSale() {
    for (const brand of saleBrands) {
      const amt = parseFloat(saleAmounts[brand] || '0');
      if (!amt) continue;
      await addTransaction({
        type: 'income',
        category: saleCategory,
        amount: amt,
        description: saleDescription || saleService || 'Toplu satış',
        date: saleDate,
        service: saleService as MuiService || undefined,
        brand,
      });
    }
    setSaleModalOpen(false);
    setSaleBrands(new Set()); setSaleAmounts({}); setSaleDescription(''); setSaleService('');
  }

  function handleSubmit() {
    if (!form.amount || !form.description) return;
    const brand = resolvedBrand(form);
    const payload = {
      type: form.type,
      category: form.category,
      amount: parseFloat(form.amount),
      description: form.description,
      note: form.note || undefined,
      remainingBalance: form.remainingBalance ? parseFloat(form.remainingBalance) : undefined,
      date: form.date,
      service: form.service || undefined,
      brand,
    };
    if (editingId) {
      updateTransaction(editingId, payload);
    } else {
      addTransaction(payload);
    }
    closeModal();
  }

  const baseCats = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const cats = baseCats; // custom cats shown separately in select

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Toplam Gelir', value: totalIncome, color: 'text-green-600 dark:text-green-400' },
          { label: 'Toplam Gider', value: totalExpense, color: 'text-red-600 dark:text-red-400' },
          {
            label: 'Net', value: totalIncome - totalExpense,
            color: totalIncome - totalExpense >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400',
          },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {label} <span className="text-gray-400">({filtered.length} işlem)</span>
            </p>
            <p className={`text-lg font-semibold font-mono mt-1 ${color}`}>{formatCurrency(value, currency)}</p>
          </Card>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-0" style={{ minWidth: '160px' }}>
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Ara..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>

        <div className="flex rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden flex-shrink-0">
          {(['all', 'income', 'expense'] as const).map((t) => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                filterType === t
                  ? t === 'income' ? 'bg-green-500 text-white' : t === 'expense' ? 'bg-red-500 text-white' : 'bg-brand-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}>
              {t === 'all' ? 'Tümü' : t === 'income' ? 'Gelir' : 'Gider'}
            </button>
          ))}
        </div>

        <FilterSelect label="Ay" value={filterMonth} onChange={setFilterMonth} options={availableMonths} />
        <FilterSelect label="Marka" value={filterBrand} onChange={setFilterBrand} options={brandFilterOptions} />
        <FilterSelect label="Hizmet" value={filterService} onChange={setFilterService}
          options={SERVICES.map((s) => ({ value: s, label: SERVICE_LABELS[s] }))} />
        <FilterSelect label="Kategori" value={filterCategory} onChange={setFilterCategory}
          options={[
            ...INCOME_CATEGORIES.map((c) => ({ value: c, label: `${CATEGORY_ICONS[c]} ${CATEGORY_LABELS[c]}` })),
            ...EXPENSE_CATEGORIES.map((c) => ({ value: c, label: `${CATEGORY_ICONS[c]} ${CATEGORY_LABELS[c]}` })),
          ]} />

        {hasFilters && (
          <button onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <X size={12} /> Temizle
          </button>
        )}

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="secondary" onClick={() => setSaleModalOpen(true)}>
            <ShoppingCart size={14} /> Toplu Satış
          </Button>
          <Button variant="primary" onClick={openAdd}>
            <Plus size={15} /> Ekle
          </Button>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/20">
          <span className="text-sm font-medium text-brand-700 dark:text-brand-300">{selectedIds.size} işlem seçili</span>
          <button onClick={() => setBulkModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 transition-colors">
            <Layers size={13} /> Toplu Değişiklik
          </button>
          <button onClick={clearSelection}
            className="ml-auto flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <X size={12} /> İptal
          </button>
        </div>
      )}

      {/* Table */}
      <Card padding="sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="pb-3 pl-1 pr-2 w-8">
                  <button onClick={toggleSelectAll} className="text-gray-400 hover:text-brand-500 transition-colors">
                    {selectedIds.size === filtered.length && filtered.length > 0
                      ? <CheckSquare size={15} className="text-brand-500" />
                      : <Square size={15} />}
                  </button>
                </th>
                {['Tarih', 'Kategori', 'Marka', 'Hizmet', 'Açıklama', 'Tutar', ''].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 pb-3 px-2 last:pr-0 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((tx) => {
                const isSel = selectedIds.has(tx.id);
                return (
                  <tr key={tx.id} className={`group transition-colors ${isSel ? 'bg-brand-50 dark:bg-brand-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                    <td className="py-2.5 pl-1 pr-2">
                      <button onClick={() => toggleSelect(tx.id)} className="text-gray-300 hover:text-brand-500 transition-colors">
                        {isSel ? <CheckSquare size={15} className="text-brand-500" /> : <Square size={15} />}
                      </button>
                    </td>
                    <td className="py-2.5 px-2 text-xs text-gray-500 whitespace-nowrap">{formatDate(tx.date)}</td>
                    <td className="py-2.5 px-2">
                      <span className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {(CATEGORY_ICONS as Record<string, string>)[tx.category] ?? '📌'} {(CATEGORY_LABELS as Record<string, string>)[tx.category] ?? tx.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-2"><BrandBadge brand={tx.brand} /></td>
                    <td className="py-2.5 px-2">
                      {tx.service
                        ? <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 whitespace-nowrap">{SERVICE_LABELS[tx.service]}</span>
                        : <span className="text-gray-300 dark:text-gray-700">—</span>}
                    </td>
                    <td className="py-2.5 px-2 text-gray-900 dark:text-white max-w-[180px] truncate">
                      {tx.description}
                      {tx.note && <span className="ml-1 text-xs text-gray-400 italic">· {tx.note}</span>}
                    </td>
                    <td className={`py-2.5 px-2 font-semibold font-mono text-sm whitespace-nowrap ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                    </td>
                    <td className="py-2.5 pr-0 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(tx)}
                          className="p-1.5 rounded text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => deleteTransaction(tx.id)}
                          className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-12">
              {hasFilters ? 'Filtreyle eşleşen işlem bulunamadı' : 'Henüz işlem yok'}
            </p>
          )}
        </div>
      </Card>

      {/* ── Bulk Edit Modal ── */}
      <Modal open={bulkModalOpen} onClose={() => setBulkModalOpen(false)} title={`Toplu Değişiklik — ${selectedIds.size} işlem`}>
        <div className="space-y-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Boş bırakılan alanlar değiştirilmez.</p>

          <div>
            <label className={LABEL_CLS}>Kategori Değiştir</label>
            <select value={bulkCategory} onChange={(e) => setBulkCategory(e.target.value)} className={INPUT_CLS}>
              <option value="">— Değiştirme —</option>
              <optgroup label="Gelir">
                {INCOME_CATEGORIES.map((c) => <option key={c} value={c}>{(CATEGORY_ICONS as any)[c]} {(CATEGORY_LABELS as any)[c]}</option>)}
              </optgroup>
              <optgroup label="Gider">
                {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{(CATEGORY_ICONS as any)[c]} {(CATEGORY_LABELS as any)[c]}</option>)}
              </optgroup>
              {customCategories.length > 0 && (
                <optgroup label="Özel">
                  {customCategories.map((c) => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
                </optgroup>
              )}
            </select>
          </div>

          <div>
            <label className={LABEL_CLS}>Hizmet Değiştir</label>
            <select value={bulkService} onChange={(e) => setBulkService(e.target.value)} className={INPUT_CLS}>
              <option value="">— Değiştirme —</option>
              {SERVICES.map((s) => <option key={s} value={s}>{SERVICE_LABELS[s]}</option>)}
              {customServices.map((c) => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
            </select>
          </div>

          <div>
            <label className={LABEL_CLS}>Marka Değiştir</label>
            <select value={bulkBrand} onChange={(e) => setBulkBrand(e.target.value)} className={INPUT_CLS}>
              <option value="">— Değiştirme —</option>
              {allBrands.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button onClick={deleteBulk}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <Trash2 size={13} /> {selectedIds.size} İşlemi Sil
            </button>
            <Button variant="secondary" className="flex-1" onClick={() => setBulkModalOpen(false)}>İptal</Button>
            <Button variant="primary" className="flex-1" onClick={applyBulkChanges}
              disabled={!bulkCategory && !bulkService && !bulkBrand}>
              <Layers size={14} /> Uygula
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Toplu Satış Modal ── */}
      <Modal open={saleModalOpen} onClose={() => setSaleModalOpen(false)} title="Toplu Satış — Birden Fazla Marka">
        <div className="space-y-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Aynı hizmeti birden fazla markaya sattıysanız her biri için gelir ekler.
          </p>

          {/* Service + Category + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>Hizmet</label>
              <select value={saleService} onChange={(e) => setSaleService(e.target.value)} className={INPUT_CLS}>
                <option value="">— Seçiniz —</option>
                {SERVICES.map((s) => <option key={s} value={s}>{SERVICE_LABELS[s]}</option>)}
                {customServices.map((c) => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL_CLS}>Kategori</label>
              <select value={saleCategory} onChange={(e) => setSaleCategory(e.target.value as TransactionCategory)} className={INPUT_CLS}>
                {INCOME_CATEGORIES.map((c) => <option key={c} value={c}>{(CATEGORY_ICONS as any)[c]} {(CATEGORY_LABELS as any)[c]}</option>)}
                {customIncomeCats.map((c) => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>Tarih</label>
              <input type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Açıklama</label>
              <input type="text" placeholder="Ortak açıklama..." value={saleDescription}
                onChange={(e) => setSaleDescription(e.target.value)} className={INPUT_CLS} />
            </div>
          </div>

          {/* Brand + amount list */}
          <div>
            <label className={LABEL_CLS}>Markalar ve Tutarlar</label>
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
              {brandFilterOptions.map((b) => {
                const checked = saleBrands.has(b.value);
                return (
                  <div key={b.value} className={`flex items-center gap-3 px-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0 ${checked ? 'bg-green-50 dark:bg-green-900/10' : ''}`}>
                    <button onClick={() => setSaleBrands((prev) => { const n = new Set(prev); n.has(b.value) ? n.delete(b.value) : n.add(b.value); return n; })}>
                      {checked ? <CheckSquare size={15} className="text-green-500" /> : <Square size={15} className="text-gray-300" />}
                    </button>
                    <span className="flex-1 text-sm text-gray-900 dark:text-white">{b.label}</span>
                    {checked && (
                      <input type="number" placeholder="Tutar" value={saleAmounts[b.value] ?? ''}
                        onChange={(e) => setSaleAmounts((prev) => ({ ...prev, [b.value]: e.target.value }))}
                        className="w-28 px-2 py-1 text-sm text-right border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500" />
                    )}
                  </div>
                );
              })}
              {brandFilterOptions.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">İşlemlerde marka verisi yok</p>
              )}
            </div>
          </div>

          {saleBrands.size > 0 && (
            <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
              Toplam: <span className="font-semibold font-mono text-green-600">
                {formatCurrency(Array.from(saleBrands).reduce((s, b) => s + (parseFloat(saleAmounts[b] || '0')), 0), currency)}
              </span>
              {' '}({saleBrands.size} marka)
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setSaleModalOpen(false)}>İptal</Button>
            <Button variant="primary" className="flex-1" onClick={handleBulkSale}
              disabled={saleBrands.size === 0 || Array.from(saleBrands).every((b) => !parseFloat(saleAmounts[b] || '0'))}>
              <ShoppingCart size={14} /> {saleBrands.size} Marka İçin Kaydet
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add / Edit Modal */}
      <Modal open={modalOpen} onClose={closeModal} title={editingId ? 'İşlemi Düzenle' : 'Yeni İşlem Ekle'}>
        <div className="space-y-4">
          {/* Type toggle */}
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            {(['income', 'expense'] as const).map((t) => (
              <button key={t}
                onClick={() => setForm({ ...form, type: t, category: t === 'income' ? 'freelance' : 'food' })}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  form.type === t
                    ? t === 'income' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}>
                {t === 'income' ? '+ Gelir' : '- Gider'}
              </button>
            ))}
          </div>

          {/* Brand + Service */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>Marka / Müşteri</label>
              <BrandInput
                value={form.brand}
                customValue={form.brandCustom}
                onChange={(v) => setForm({ ...form, brand: v, brandCustom: '' })}
                onCustomChange={(v) => setForm({ ...form, brandCustom: v })}
                allBrands={allBrands}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Hizmet</label>
              <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value as MuiService | '' })} className={INPUT_CLS}>
                <option value="">— Seçiniz —</option>
                {SERVICES.map((s) => <option key={s} value={s}>{SERVICE_LABELS[s]}</option>)}
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className={LABEL_CLS}>Kategori</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as TransactionCategory })} className={INPUT_CLS}>
              <optgroup label="Standart">
                {cats.map((c) => <option key={c} value={c}>{CATEGORY_ICONS[c as keyof typeof CATEGORY_ICONS] ?? '📌'} {CATEGORY_LABELS[c as keyof typeof CATEGORY_LABELS] ?? c}</option>)}
              </optgroup>
              {(form.type === 'income' ? customIncomeCats : customExpenseCats).length > 0 && (
                <optgroup label="Özel Kategoriler">
                  {(form.type === 'income' ? customIncomeCats : customExpenseCats).map((c) => (
                    <option key={c.key} value={c.key}>{c.icon} {c.label}</option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Amount + Date */}
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

          {/* Remaining balance — only for income */}
          {form.type === 'income' && (
            <div>
              <label className={LABEL_CLS}>Kalan Bakiye (opsiyonel)</label>
              <input type="number" placeholder="Ön ödeme ise tahsil edilmemiş tutar..." value={form.remainingBalance}
                onChange={(e) => setForm({ ...form, remainingBalance: e.target.value })} className={INPUT_CLS} />
            </div>
          )}

          {/* Description */}
          <div>
            <label className={LABEL_CLS}>Açıklama</label>
            <input type="text" placeholder="Müşteri adı, fatura no, kısa açıklama..." value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} className={INPUT_CLS} />
          </div>

          {/* Note */}
          <div>
            <label className={LABEL_CLS}>Not (opsiyonel)</label>
            <textarea rows={2} placeholder="Detay not, ödeme koşulları, referans vb." value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className={`${INPUT_CLS} resize-none`} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={closeModal}>İptal</Button>
            <Button variant="primary" className="flex-1" onClick={handleSubmit}>
              {editingId ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
