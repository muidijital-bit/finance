// ─── Core types ───────────────────────────────────────────────────────────────

export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'salary' | 'freelance' | 'investment' | 'other_income'
  | 'food' | 'transport' | 'housing' | 'health' | 'education'
  | 'entertainment' | 'shopping' | 'utilities' | 'other_expense';

export type MuiService =
  | 'dijital_pazarlama' | 'web_tasarim' | 'backlink' | 'promosyon'
  | 'grafik_tasarim' | 'video_produksiyon' | 'icerik_tasarim'
  | 'kurumsal_kimlik' | 'marka_olusturma' | 'danismanlik' | 'diger';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  date: string;
  service?: MuiService;
  brand?: string;
  tags?: string[];
}

export interface PaymentSchedule {
  id: string;
  title: string;
  amount: number;
  currency: string;
  dueDay: number;       // ayın kaçında (1-31)
  type: 'expense' | 'income';
  category: TransactionCategory;
  service?: MuiService;
  isActive: boolean;
  note?: string;
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
