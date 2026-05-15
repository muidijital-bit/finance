// ─── Core types ───────────────────────────────────────────────────────────────

export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'salary' | 'freelance' | 'investment' | 'other_income'
  | 'food' | 'transport' | 'housing' | 'health' | 'education'
  | 'entertainment' | 'shopping' | 'utilities' | 'other_expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  date: string; // ISO date string
  tags?: string[];
}

export interface Budget {
  id: string;
  category: TransactionCategory;
  limit: number;
  period: 'monthly' | 'yearly';
  color: string;
}

export interface Investment {
  id: string;
  name: string;
  symbol: string;
  type: 'stock' | 'crypto' | 'fund' | 'bond' | 'real_estate' | 'deposit' | 'other';
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  currency: string;
  date: string;
  interestRate?: number;  // yıllık faiz oranı (%), deposit tipi için
  maturityDate?: string;  // vade tarihi, deposit tipi için
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  color: string;
  icon: string;
}

// ─── Derived / computed types ──────────────────────────────────────────────────

export interface MonthlyStats {
  month: string; // 'YYYY-MM'
  income: number;
  expense: number;
  net: number;
}

export interface CategoryBreakdown {
  category: TransactionCategory;
  amount: number;
  percentage: number;
  count: number;
}

// ─── UI helpers ────────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}
