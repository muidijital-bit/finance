'use client';

export const runtime = 'edge';

import { useState } from 'react';
import { Plus, Trash2, PlusCircle } from 'lucide-react';
import { useFinanceStore } from '@/store/useFinanceStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ProgressBar from '@/components/ui/ProgressBar';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Goal } from '@/types';

const ICONS = ['✈️', '🛡️', '💻', '🏠', '🚗', '📚', '💍', '🎓', '🌴', '💰'];
const COLORS = ['#3b82f6', '#22c55e', '#8b5cf6', '#f97316', '#ef4444', '#eab308', '#06b6d4', '#ec4899'];

const defaultForm: Omit<Goal, 'id'> = {
  name: '',
  targetAmount: 0,
  currentAmount: 0,
  deadline: '',
  color: COLORS[0],
  icon: ICONS[0],
};

export default function GoalsPage() {
  const { goals, addGoal, deleteGoal, contributeToGoal, currency } = useFinanceStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [contributeModal, setContributeModal] = useState<Goal | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');
  const [form, setForm] = useState(defaultForm);

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);

  function handleSubmit() {
    if (!form.name || !form.targetAmount || !form.deadline) return;
    addGoal(form);
    setForm(defaultForm);
    setModalOpen(false);
  }

  function handleContribute() {
    if (!contributeModal || !contributeAmount) return;
    contributeToGoal(contributeModal.id, parseFloat(contributeAmount));
    setContributeModal(null);
    setContributeAmount('');
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400">Toplam Hedef</p>
          <p className="text-xl font-semibold font-mono mt-1 text-gray-900 dark:text-white">{formatCurrency(totalTarget, currency)}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400">Toplam Birikim</p>
          <p className="text-xl font-semibold font-mono mt-1 text-green-600 dark:text-green-400">{formatCurrency(totalSaved, currency)}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400">Tamamlanan</p>
          <p className="text-xl font-semibold font-mono mt-1 text-brand-600 dark:text-brand-400">
            {goals.filter((g) => g.currentAmount >= g.targetAmount).length}/{goals.length}
          </p>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Hedeflerim</h2>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          <Plus size={14} /> Hedef Ekle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((g) => {
          const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
          const remaining = g.targetAmount - g.currentAmount;
          const completed = g.currentAmount >= g.targetAmount;
          const daysLeft = Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000);

          return (
            <Card key={g.id} className="group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${g.color}20` }}
                  >
                    {g.icon}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{g.name}</p>
                    <p className="text-xs text-gray-400">
                      {completed ? '✅ Tamamlandı' : daysLeft > 0 ? `${daysLeft} gün kaldı` : 'Süre doldu'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteGoal(g.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-red-500 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                  <span className="font-mono">{formatCurrency(g.currentAmount, currency)}</span>
                  <span className="font-mono">{formatCurrency(g.targetAmount, currency)}</span>
                </div>
                <ProgressBar value={pct} color={g.color} height={8} />
                <p className="text-xs text-gray-400 mt-1.5 text-right font-mono">{Math.round(pct)}%</p>
              </div>

              {!completed && (
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-400">{formatCurrency(remaining, currency)} kaldı</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setContributeModal(g)}
                  >
                    <PlusCircle size={14} /> Ekle
                  </Button>
                </div>
              )}

              {completed && (
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium text-center">🎉 Hedefe ulaşıldı!</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {goals.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-gray-400 text-sm">Henüz hedef eklenmedi.</p>
          <Button variant="primary" size="sm" className="mt-3" onClick={() => setModalOpen(true)}>
            <Plus size={14} /> İlk Hedefini Ekle
          </Button>
        </Card>
      )}

      {/* Add Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Yeni Hedef Ekle">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Hedef Adı</label>
            <input
              type="text"
              placeholder="Tatil Fonu"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Hedef Tutar (₺)</label>
              <input
                type="number"
                value={form.targetAmount || ''}
                onChange={(e) => setForm({ ...form, targetAmount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mevcut Birikim (₺)</label>
              <input
                type="number"
                value={form.currentAmount || ''}
                onChange={(e) => setForm({ ...form, currentAmount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Hedef Tarihi</label>
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">İkon</label>
            <div className="flex gap-2 flex-wrap">
              {ICONS.map((ic) => (
                <button key={ic} onClick={() => setForm({ ...form, icon: ic })}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${form.icon === ic ? 'bg-brand-100 dark:bg-brand-900 ring-2 ring-brand-500' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Renk</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button key={c} onClick={() => setForm({ ...form, color: c })}
                  className="w-8 h-8 rounded-full border-2 transition-all"
                  style={{ backgroundColor: c, borderColor: form.color === c ? '#1f2937' : 'transparent' }} />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>İptal</Button>
            <Button variant="primary" className="flex-1" onClick={handleSubmit}>Kaydet</Button>
          </div>
        </div>
      </Modal>

      {/* Contribute Modal */}
      <Modal open={!!contributeModal} onClose={() => setContributeModal(null)} title={`${contributeModal?.icon} ${contributeModal?.name} — Birikim Ekle`}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Eklenecek Tutar (₺)</label>
            <input
              type="number"
              placeholder="0"
              value={contributeAmount}
              onChange={(e) => setContributeAmount(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setContributeModal(null)}>İptal</Button>
            <Button variant="primary" className="flex-1" onClick={handleContribute}>Ekle</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
