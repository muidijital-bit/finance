import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction, Budget, Investment, Goal, PaymentSchedule } from '@/types';

const api = {
  get: (path: string) => fetch(path).then((r) => r.json()),
  post: (path: string, body: unknown) => fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.json()),
  put: (path: string, body: unknown) => fetch(path, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  del: (path: string) => fetch(path, { method: 'DELETE' }),
};

interface FinanceState {
  transactions: Transaction[];
  budgets: Budget[];
  investments: Investment[];
  goals: Goal[];
  paymentSchedules: PaymentSchedule[];
  currency: string;
  darkMode: boolean;
  initialized: boolean;

  init: () => Promise<void>;

  addTransaction: (t: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, t: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  rebrandTransactions: (from: string[], to: string) => Promise<void>;

  addPaymentSchedule: (p: Omit<PaymentSchedule, 'id'>) => Promise<void>;
  updatePaymentSchedule: (id: string, p: Partial<PaymentSchedule>) => Promise<void>;
  deletePaymentSchedule: (id: string) => Promise<void>;

  addBudget: (b: Omit<Budget, 'id'>) => Promise<void>;
  updateBudget: (id: string, b: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  addInvestment: (i: Omit<Investment, 'id'>) => Promise<void>;
  updateInvestment: (id: string, i: Partial<Investment>) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;

  addGoal: (g: Omit<Goal, 'id'>) => Promise<void>;
  updateGoal: (id: string, g: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  contributeToGoal: (id: string, amount: number) => Promise<void>;

  toggleDarkMode: () => void;
  setCurrency: (currency: string) => void;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: [],
      budgets: [],
      investments: [],
      goals: [],
      paymentSchedules: [],
      currency: 'TRY',
      darkMode: false,
      initialized: false,

      init: async () => {
        if (get().initialized) return;
        const [transactions, budgets, investments, goals, paymentSchedules] = await Promise.all([
          api.get('/api/transactions'),
          api.get('/api/budgets'),
          api.get('/api/investments'),
          api.get('/api/goals'),
          api.get('/api/payment-schedules'),
        ]);
        set({ transactions, budgets, investments, goals, paymentSchedules, initialized: true });
      },

      addTransaction: async (t) => {
        const { id } = await api.post('/api/transactions', t);
        set((s) => ({ transactions: [{ ...t, id }, ...s.transactions] }));
      },
      updateTransaction: async (id, t) => {
        const current = get().transactions.find((x) => x.id === id)!;
        const updated = { ...current, ...t };
        await api.put(`/api/transactions/${id}`, updated);
        set((s) => ({ transactions: s.transactions.map((x) => x.id === id ? updated : x) }));
      },
      deleteTransaction: async (id) => {
        await api.del(`/api/transactions/${id}`);
        set((s) => ({ transactions: s.transactions.filter((x) => x.id !== id) }));
      },
      rebrandTransactions: async (from, to) => {
        await api.post('/api/transactions/rebrand', { from, to });
        set((s) => ({
          transactions: s.transactions.map((x) =>
            x.brand && from.includes(x.brand) ? { ...x, brand: to } : x
          ),
        }));
      },

      addBudget: async (b) => {
        const { id } = await api.post('/api/budgets', b);
        set((s) => ({ budgets: [...s.budgets, { ...b, id }] }));
      },
      updateBudget: async (id, b) => {
        const current = get().budgets.find((x) => x.id === id)!;
        const updated = { ...current, ...b };
        await api.put(`/api/budgets/${id}`, updated);
        set((s) => ({ budgets: s.budgets.map((x) => x.id === id ? updated : x) }));
      },
      deleteBudget: async (id) => {
        await api.del(`/api/budgets/${id}`);
        set((s) => ({ budgets: s.budgets.filter((x) => x.id !== id) }));
      },

      addInvestment: async (i) => {
        const { id } = await api.post('/api/investments', i);
        set((s) => ({ investments: [...s.investments, { ...i, id }] }));
      },
      updateInvestment: async (id, i) => {
        const current = get().investments.find((x) => x.id === id)!;
        const updated = { ...current, ...i };
        await api.put(`/api/investments/${id}`, updated);
        set((s) => ({ investments: s.investments.map((x) => x.id === id ? updated : x) }));
      },
      deleteInvestment: async (id) => {
        await api.del(`/api/investments/${id}`);
        set((s) => ({ investments: s.investments.filter((x) => x.id !== id) }));
      },

      addGoal: async (g) => {
        const { id } = await api.post('/api/goals', g);
        set((s) => ({ goals: [...s.goals, { ...g, id }] }));
      },
      updateGoal: async (id, g) => {
        const current = get().goals.find((x) => x.id === id)!;
        const updated = { ...current, ...g };
        await api.put(`/api/goals/${id}`, updated);
        set((s) => ({ goals: s.goals.map((x) => x.id === id ? updated : x) }));
      },
      deleteGoal: async (id) => {
        await api.del(`/api/goals/${id}`);
        set((s) => ({ goals: s.goals.filter((x) => x.id !== id) }));
      },
      contributeToGoal: async (id, amount) => {
        const current = get().goals.find((x) => x.id === id)!;
        const updated = { ...current, currentAmount: Math.min(current.currentAmount + amount, current.targetAmount) };
        await api.put(`/api/goals/${id}`, updated);
        set((s) => ({ goals: s.goals.map((x) => x.id === id ? updated : x) }));
      },

      addPaymentSchedule: async (p) => {
        const { id } = await api.post('/api/payment-schedules', p);
        set((s) => ({ paymentSchedules: [...s.paymentSchedules, { ...p, id }] }));
      },
      updatePaymentSchedule: async (id, p) => {
        const current = get().paymentSchedules.find((x) => x.id === id)!;
        const updated = { ...current, ...p };
        await api.put(`/api/payment-schedules/${id}`, updated);
        set((s) => ({ paymentSchedules: s.paymentSchedules.map((x) => x.id === id ? updated : x) }));
      },
      deletePaymentSchedule: async (id) => {
        await api.del(`/api/payment-schedules/${id}`);
        set((s) => ({ paymentSchedules: s.paymentSchedules.filter((x) => x.id !== id) }));
      },

      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      setCurrency: (currency) => set({ currency }),
    }),
    { name: 'finance-ui', partialize: (s) => ({ darkMode: s.darkMode, currency: s.currency }) }
  )
);

// ─── Selectors ─────────────────────────────────────────────────────────────────

export function useMonthlyStats(transactions: Transaction[]) {
  const monthMap: Record<string, { income: number; expense: number }> = {};
  transactions.forEach(({ date, type, amount }) => {
    const key = date.slice(0, 7);
    if (!monthMap[key]) monthMap[key] = { income: 0, expense: 0 };
    monthMap[key][type] += amount;
  });
  return Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { income, expense }]) => ({ month, income, expense, net: income - expense }));
}

export function useBudgetProgress(budgets: Budget[], transactions: Transaction[], month: string) {
  const monthlyExpenses = transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(month))
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  return budgets.map((b) => ({
    ...b,
    spent: monthlyExpenses[b.category] || 0,
    percentage: Math.min(((monthlyExpenses[b.category] || 0) / b.limit) * 100, 100),
    overBudget: (monthlyExpenses[b.category] || 0) > b.limit,
  }));
}
