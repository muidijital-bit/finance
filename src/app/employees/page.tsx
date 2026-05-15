'use client';

export const runtime = 'edge';

import { useState, useMemo } from 'react';
import { Plus, Trash2, Pencil, ToggleLeft, ToggleRight, Search, Phone, Mail, User, Briefcase, DollarSign } from 'lucide-react';
import { useFinanceStore } from '@/store/useFinanceStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Employee } from '@/types';

const INPUT_CLS = 'w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500';
const LABEL_CLS = 'block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5';

type FormState = {
  name: string;
  position: string;
  salary: string;
  salaryCurrency: string;
  startDate: string;
  tcNo: string;
  phone: string;
  email: string;
  note: string;
};

const defaultForm: FormState = {
  name: '', position: '', salary: '', salaryCurrency: 'TRY',
  startDate: '', tcNo: '', phone: '', email: '', note: '',
};

export default function EmployeesPage() {
  const { employees, addEmployee, updateEmployee, deleteEmployee, currency } = useFinanceStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'passive'>('all');

  const filtered = useMemo(() => employees.filter((e) => {
    if (filterActive === 'active' && !e.isActive) return false;
    if (filterActive === 'passive' && e.isActive) return false;
    if (search) {
      const q = search.toLowerCase();
      return e.name.toLowerCase().includes(q) || (e.position ?? '').toLowerCase().includes(q);
    }
    return true;
  }), [employees, search, filterActive]);

  const totalSalary = useMemo(() =>
    employees.filter((e) => e.isActive).reduce((s, e) => s + e.salary, 0),
    [employees]);

  const activeCount = employees.filter((e) => e.isActive).length;

  function openAdd() {
    setEditingId(null);
    setForm(defaultForm);
    setModalOpen(true);
  }

  function openEdit(e: Employee) {
    setEditingId(e.id);
    setForm({
      name: e.name,
      position: e.position ?? '',
      salary: String(e.salary),
      salaryCurrency: e.salaryCurrency,
      startDate: e.startDate ?? '',
      tcNo: e.tcNo ?? '',
      phone: e.phone ?? '',
      email: e.email ?? '',
      note: e.note ?? '',
    });
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(),
      position: form.position || undefined,
      salary: parseFloat(form.salary) || 0,
      salaryCurrency: form.salaryCurrency,
      startDate: form.startDate || undefined,
      tcNo: form.tcNo || undefined,
      phone: form.phone || undefined,
      email: form.email || undefined,
      isActive: true,
      note: form.note || undefined,
    };
    if (editingId) {
      await updateEmployee(editingId, payload);
    } else {
      await addEmployee(payload);
    }
    setModalOpen(false);
    setEditingId(null);
  }

  async function toggleActive(e: Employee) {
    await updateEmployee(e.id, { isActive: !e.isActive });
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400">Aktif Çalışan</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{activeCount}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400">Toplam Çalışan</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{employees.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400">Aylık Personel Gideri</p>
          <p className="text-xl font-semibold font-mono mt-1 text-red-600 dark:text-red-400">
            {formatCurrency(totalSalary, currency)}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1" style={{ minWidth: '160px' }}>
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="İsim veya pozisyon ara..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          {(['all', 'active', 'passive'] as const).map((f) => (
            <button key={f} onClick={() => setFilterActive(f)}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                filterActive === f ? 'bg-brand-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}>
              {f === 'all' ? 'Tümü' : f === 'active' ? 'Aktif' : 'Pasif'}
            </button>
          ))}
        </div>
        <Button variant="primary" onClick={openAdd} className="ml-auto flex-shrink-0">
          <Plus size={15} /> Çalışan Ekle
        </Button>
      </div>

      {/* Employee cards */}
      {filtered.length === 0 ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400 text-sm">
            {employees.length === 0 ? 'Henüz çalışan kaydı yok.' : 'Filtreyle eşleşen çalışan bulunamadı.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((e) => (
            <Card key={e.id} className={`flex flex-col gap-3 ${!e.isActive ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
                    <User size={18} className="text-brand-600 dark:text-brand-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{e.name}</p>
                    {e.position && <p className="text-xs text-gray-400 truncate">{e.position}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => toggleActive(e)} className="p-1 text-gray-400 hover:text-brand-500 transition-colors">
                    {e.isActive ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}
                  </button>
                  <button onClick={() => openEdit(e)} className="p-1 text-gray-400 hover:text-brand-500 transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => deleteEmployee(e.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <DollarSign size={12} className="text-gray-400 flex-shrink-0" />
                  <span className="font-semibold font-mono text-red-600 dark:text-red-400">
                    {formatCurrency(e.salary, e.salaryCurrency)}<span className="text-gray-400 font-normal">/ay</span>
                  </span>
                </div>
                {e.startDate && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Briefcase size={12} className="text-gray-400 flex-shrink-0" />
                    <span>İşe başlama: {formatDate(e.startDate)}</span>
                  </div>
                )}
                {e.phone && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Phone size={12} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{e.phone}</span>
                  </div>
                )}
                {e.email && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Mail size={12} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{e.email}</span>
                  </div>
                )}
                {e.note && (
                  <p className="text-xs text-gray-400 italic truncate">{e.note}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditingId(null); }}
        title={editingId ? 'Çalışanı Düzenle' : 'Yeni Çalışan Ekle'}>
        <div className="space-y-4">
          {/* Name + Position */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>Ad Soyad *</label>
              <input type="text" placeholder="Ahmet Yılmaz" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} className={INPUT_CLS} autoFocus />
            </div>
            <div>
              <label className={LABEL_CLS}>Pozisyon / Unvan</label>
              <input type="text" placeholder="Grafik Tasarımcı" value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })} className={INPUT_CLS} />
            </div>
          </div>

          {/* Salary */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>Aylık Maaş</label>
              <input type="number" placeholder="0" value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Para Birimi</label>
              <select value={form.salaryCurrency} onChange={(e) => setForm({ ...form, salaryCurrency: e.target.value })} className={INPUT_CLS}>
                {['TRY', 'USD', 'EUR'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Start Date + TC */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>İşe Başlama Tarihi</label>
              <input type="date" value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>TC / Vergi No</label>
              <input type="text" placeholder="00000000000" value={form.tcNo}
                onChange={(e) => setForm({ ...form, tcNo: e.target.value })} className={INPUT_CLS} />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>Telefon</label>
              <input type="tel" placeholder="+90 5xx xxx xx xx" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>E-posta</label>
              <input type="email" placeholder="ornek@firma.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} className={INPUT_CLS} />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className={LABEL_CLS}>Not</label>
            <textarea rows={2} placeholder="Sözleşme detayı, departman vb." value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className={`${INPUT_CLS} resize-none`} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => { setModalOpen(false); setEditingId(null); }}>İptal</Button>
            <Button variant="primary" className="flex-1" onClick={handleSubmit} disabled={!form.name.trim()}>
              {editingId ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
