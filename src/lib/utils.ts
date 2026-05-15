import { TransactionCategory } from '@/types';

export function formatCurrency(amount: number, currency = 'TRY'): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  salary: 'Maaş',
  freelance: 'Serbest Çalışma',
  investment: 'Yatırım Geliri',
  other_income: 'Diğer Gelir',
  food: 'Yemek',
  transport: 'Ulaşım',
  housing: 'Konut',
  health: 'Sağlık',
  education: 'Eğitim',
  entertainment: 'Eğlence',
  shopping: 'Alışveriş',
  utilities: 'Faturalar',
  other_expense: 'Diğer Gider',
};

export const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  salary: '#22c55e',
  freelance: '#3b82f6',
  investment: '#8b5cf6',
  other_income: '#06b6d4',
  food: '#f97316',
  transport: '#eab308',
  housing: '#ef4444',
  health: '#ec4899',
  education: '#14b8a6',
  entertainment: '#6366f1',
  shopping: '#f43f5e',
  utilities: '#78716c',
  other_expense: '#9ca3af',
};

export const CATEGORY_ICONS: Record<TransactionCategory, string> = {
  salary: '💼',
  freelance: '💻',
  investment: '📈',
  other_income: '💰',
  food: '🍽️',
  transport: '🚗',
  housing: '🏠',
  health: '🏥',
  education: '📚',
  entertainment: '🎬',
  shopping: '🛍️',
  utilities: '💡',
  other_expense: '📦',
};

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

export function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function clsx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
