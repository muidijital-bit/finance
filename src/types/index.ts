// ─── Core types ───────────────────────────────────────────────────────────────

export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  // Income
  | 'salary' | 'freelance' | 'investment' | 'other_income'
  // New expense categories
  | 'personel' | 'lisans_gider' | 'kredi_gider' | 'fatura'
  | 'yatirim_gider' | 'demirbas_alimi' | 'hizmet_gideri' | 'kredi_karti' | 'other_expense'
  // Legacy (kept for backward compat)
  | 'food' | 'transport' | 'housing' | 'health' | 'education'
  | 'entertainment' | 'shopping' | 'utilities';

export type PaymentCategory =
  | 'kredi' | 'calisan_odemesi' | 'lisans' | 'demirbas'
  | 'aidat' | 'kira' | 'sigorta' | 'abonelik' | 'vergi' | 'diger_odeme';

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
  note?: string;
  remainingBalance?: number;
  date: string;
  service?: MuiService;
  brand?: string;
  tags?: string[];
}

export interface Brand {
  id: string;
  value: string;
  label: string;
  color: string;
  isActive: boolean;
  note?: string;
}

export interface CustomCategory {
  id: string;
  type: 'income_cat' | 'expense_cat' | 'service';
  key: string;
  label: string;
  icon: string;
  color: string;
}

export interface Employee {
  id: string;
  name: string;
  position?: string;
  salary: number;
  salaryCurrency: string;
  startDate?: string;
  tcNo?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  note?: string;
}

export interface BrandNote {
  id: string;
  brand: string;
  content: string;
  createdAt: string;
}

export interface PaymentSchedule {
  id: string;
  title: string;
  amount: number;
  currency: string;
  dueDay: number;
  type: 'expense' | 'income';
  category: TransactionCategory;
  paymentCategory?: PaymentCategory;
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

export interface Loan {
  id: string;
  title: string;
  lender: string;          // banka / kurum
  principal: number;       // ana para
  totalAmount: number;     // toplam geri ödeme
  installmentCount: number;
  installmentAmount: number;
  startDate: string;       // YYYY-MM-DD (ilk taksit ayı)
  dueDay: number;          // ayın kaçında
  currency: string;
  note?: string;
  isActive: boolean;
  paidCount: number;       // ödenen taksit sayısı
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
