import { TransactionCategory, MuiService } from '@/types';

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

export const SERVICE_LABELS: Record<MuiService, string> = {
  dijital_pazarlama: 'Dijital Pazarlama',
  web_tasarim: 'Web Tasarım',
  backlink: 'Backlink',
  promosyon: 'Promosyon',
  grafik_tasarim: 'Grafik Tasarım',
  video_produksiyon: 'Video Prodüksiyon',
  icerik_tasarim: 'İçerik Tasarım',
  kurumsal_kimlik: 'Kurumsal Kimlik',
  marka_olusturma: 'Marka Oluşturma',
  danismanlik: 'Danışmanlık',
  diger: 'Diğer',
};

export const SERVICE_COLORS: Record<MuiService, string> = {
  dijital_pazarlama: '#5F17EC',
  web_tasarim: '#3b82f6',
  backlink: '#06b6d4',
  promosyon: '#f97316',
  grafik_tasarim: '#ec4899',
  video_produksiyon: '#ef4444',
  icerik_tasarim: '#8b5cf6',
  kurumsal_kimlik: '#14b8a6',
  marka_olusturma: '#eab308',
  danismanlik: '#22c55e',
  diger: '#9ca3af',
};

// Predefined brands/clients — yeni marka eklemek için buraya eklenir
export const BRANDS: { value: string; label: string; color: string }[] = [
  { value: 'durmaz_invest',       label: 'Durmaz Invest',           color: '#0ea5e9' },
  { value: 'endadent',            label: 'Enda Dent',               color: '#ef4444' },
  { value: 'sare_havuz',          label: 'Sare Havuz',              color: '#3b82f6' },
  { value: 'bmotors',             label: 'Bmotors',                 color: '#f97316' },
  { value: 'namedent',            label: 'Namedent',                color: '#8b5cf6' },
  { value: 'modern_havuz',        label: 'Modern Havuz',            color: '#06b6d4' },
  { value: 'ecozero',             label: 'Ecozero',                 color: '#22c55e' },
  { value: 'gozde_dursun',        label: 'Gözde Dursun',           color: '#ec4899' },
  { value: 'egemen_parlar_prive', label: 'Egemen Parlar Prive',     color: '#a855f7' },
  { value: 'egemen_parlar',       label: 'Egemen Parlar',           color: '#7c3aed' },
  { value: 'meka_petrol',         label: 'MEKA Petrol',             color: '#eab308' },
  { value: 'cankaya_yangin',      label: 'Çankaya Yangın',          color: '#dc2626' },
  { value: 'neseli_tir',          label: 'Neşeli Tir',              color: '#64748b' },
  { value: 'neseli_otomotiv',     label: 'Neşeli Otomotiv',         color: '#475569' },
  { value: 'greenart_peyzaj',     label: 'GreenArt Peyzaj',         color: '#16a34a' },
  { value: 'bahri_bulbul',        label: 'Bahri Bülbül',            color: '#0891b2' },
  { value: 'dev_havuz',           label: 'Dev Havuz',               color: '#2563eb' },
  { value: 'home_yapi',           label: 'Home Yapı',               color: '#92400e' },
  { value: 'koray',               label: 'Koray',                   color: '#059669' },
  { value: 'tarkan',              label: 'Tarkan',                  color: '#b45309' },
  { value: 'ismail',              label: 'İsmail',                  color: '#0f766e' },
  { value: 'meltem_yilmaz',       label: 'Meltem Yılmaz',           color: '#db2777' },
  { value: 'bihter',              label: 'Bihter',                  color: '#e11d48' },
  { value: 'slimfast',            label: 'Slimfast',                color: '#65a30d' },
  { value: 'hilal_pekgoz',        label: 'Hilal Pekgöz',            color: '#c026d3' },
  { value: 'impro_muhendislik',   label: 'İmpro Mühendislik',       color: '#1d4ed8' },
  { value: 'eva_elektronik',      label: 'Eva Elektronik',          color: '#0e7490' },
  { value: 'eva_muhendislik',     label: 'Eva Mühendislik',         color: '#0369a1' },
  { value: 'eva',                 label: 'Eva',                     color: '#0284c7' },
  { value: 'elektromed',          label: 'Elektromed',              color: '#4f46e5' },
  { value: 'aol_sigorta',         label: 'AOL Sigorta',             color: '#7c2d12' },
  { value: 'murat_atmaca',        label: 'Murat Atmaca',            color: '#15803d' },
  { value: 'trambolinpark',       label: 'Trambolinpark',           color: '#9333ea' },
  { value: 'bites_savunma',       label: 'BİTes Savunma',           color: '#374151' },
  { value: 'bega_savunma',        label: 'Bega Savunma',            color: '#1f2937' },
  { value: 'tupras',              label: 'Tüpraş',                  color: '#b91c1c' },
  { value: 'welmet',              label: 'Welmet',                  color: '#6d28d9' },
  { value: 'sarnic',              label: 'Sarnıç',                  color: '#78350f' },
  { value: 'polo_mar',            label: 'Polo Mar',                color: '#164e63' },
  { value: 'suluada',             label: 'Suluada',                 color: '#1e40af' },
  { value: 'sari_papyon',         label: 'Sarı Papyon Organizasyon',color: '#a16207' },
  { value: 'seramik_huseyin',     label: 'Seramik Hüseyin Bey',     color: '#92400e' },
  { value: '2p_artsatelier',      label: '2P Artsatelier',          color: '#be185d' },
  { value: 'a2_kuafor',           label: 'A2 Kuaför',               color: '#7e22ce' },
  { value: 'eymen_bugra',         label: 'Eymen & Buğra',           color: '#1e3a5f' },
  { value: 'eco2',                label: 'ECO2',                    color: '#166534' },
  { value: 'eco_surdurulebilirlik', label: 'Eco Sürdürülebilirlik', color: '#14532d' },
  { value: 'celal_kaptan',        label: 'Celal Kaptan',            color: '#7f1d1d' },
  { value: 'aspava',              label: 'Aspava',                  color: '#713f12' },
  { value: 'mert',                label: 'Mert',                    color: '#1c1917' },
  { value: 'muimedya',            label: 'muimedya',                color: '#5F17EC' },
  { value: 'diger',               label: 'Diğer',                   color: '#9ca3af' },
];

export const BRAND_MAP: Record<string, { label: string; color: string }> = Object.fromEntries(
  BRANDS.map((b) => [b.value, { label: b.label, color: b.color }])
);

export const MONTHS_TR = [
  'Ocak','Şubat','Mart','Nisan','Mayıs','Haziran',
  'Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'
];

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

export function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function clsx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
