'use client';

export const runtime = 'edge';

import { useMemo } from 'react';
import Link from 'next/link';
import { useFinanceStore } from '@/store/useFinanceStore';
import Card from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { BRANDS, BRAND_MAP } from '@/lib/utils';
import { TrendingUp, ArrowRight, Calendar, Receipt } from 'lucide-react';

export default function BrandsPage() {
  const { transactions, currency } = useFinanceStore();

  const brandStats = useMemo(() => {
    // Group income transactions by brand
    const map = new Map<string, { total: number; months: Set<string>; count: number; lastDate: string }>();

    transactions.forEach((t) => {
      if (t.type !== 'income' || !t.brand) return;
      const key = t.brand;
      if (!map.has(key)) map.set(key, { total: 0, months: new Set(), count: 0, lastDate: '' });
      const s = map.get(key)!;
      s.total += t.amount;
      s.months.add(t.date.slice(0, 7));
      s.count += 1;
      if (!s.lastDate || t.date > s.lastDate) s.lastDate = t.date;
    });

    return Array.from(map.entries())
      .map(([brand, s]) => ({
        brand,
        label: BRAND_MAP[brand]?.label ?? brand,
        color: BRAND_MAP[brand]?.color ?? '#9ca3af',
        total: s.total,
        monthCount: s.months.size,
        txCount: s.count,
        avgPerMonth: s.total / s.months.size,
        lastDate: s.lastDate,
      }))
      .sort((a, b) => b.total - a.total);
  }, [transactions]);

  if (brandStats.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">Henüz markalı işlem yok. İşlemler sayfasından marka etiketleyin.</p>
      </div>
    );
  }

  const topTotal = brandStats[0]?.total ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {brandStats.length} marka · toplam gelire göre sıralı
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {brandStats.map((b, i) => (
          <Card key={b.brand} className="flex flex-col gap-3 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: b.color }}
                >
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{b.label}</p>
                  <p className="text-xs text-gray-400">{b.txCount} işlem</p>
                </div>
              </div>
              <div
                className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: b.color + '18', color: b.color }}
              >
                #{i + 1}
              </div>
            </div>

            {/* Revenue bar */}
            <div>
              <div className="flex items-end justify-between mb-1.5">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <TrendingUp size={11} /> Toplam Gelir
                </span>
                <span className="text-base font-bold font-mono text-gray-900 dark:text-white">
                  {formatCurrency(b.total, currency)}
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(b.total / topTotal) * 100}%`, backgroundColor: b.color }}
                />
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {b.monthCount} ay
              </span>
              <span className="flex items-center gap-1">
                <Receipt size={11} />
                Ort. {formatCurrency(b.avgPerMonth, currency)}/ay
              </span>
            </div>

            {/* Action */}
            <Link
              href={`/brands/${b.brand}`}
              className="mt-auto flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors"
              style={{ backgroundColor: b.color + '12', color: b.color }}
            >
              Detay görüntüle
              <ArrowRight size={13} />
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
