'use client';

export const runtime = 'edge';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFinanceStore } from '@/store/useFinanceStore';
import Card from '@/components/ui/Card';
import { formatCurrency, formatDate, BRAND_MAP, SERVICE_LABELS, MONTHS_TR } from '@/lib/utils';
import { ArrowLeft, TrendingUp, Calendar, Receipt, AlertCircle, CheckCircle2 } from 'lucide-react';

function getMonthRange(dates: string[]): string[] {
  if (dates.length === 0) return [];
  const sorted = [...dates].sort();
  const start = sorted[0].slice(0, 7);
  const now = new Date();
  const end = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const months: string[] = [];
  let [y, m] = start.split('-').map(Number);
  const [ey, em] = end.split('-').map(Number);
  while (y < ey || (y === ey && m <= em)) {
    months.push(`${y}-${String(m).padStart(2, '0')}`);
    m++;
    if (m > 12) { m = 1; y++; }
  }
  return months;
}

export default function BrandDetailPage() {
  const { brand } = useParams<{ brand: string }>();
  const router = useRouter();
  const { transactions, currency } = useFinanceStore();

  const info = BRAND_MAP[brand];

  const brandTxs = useMemo(
    () => transactions.filter((t) => t.brand === brand && t.type === 'income').sort((a, b) => a.date.localeCompare(b.date)),
    [transactions, brand]
  );

  const allMonths = useMemo(() => getMonthRange(brandTxs.map((t) => t.date)), [brandTxs]);

  // Group transactions by month
  const byMonth = useMemo(() => {
    const map = new Map<string, typeof brandTxs>();
    brandTxs.forEach((t) => {
      const key = t.date.slice(0, 7);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    });
    return map;
  }, [brandTxs]);

  const totalRevenue = brandTxs.reduce((s, t) => s + t.amount, 0);
  const paidMonths = byMonth.size;
  const unpaidMonths = allMonths.length - paidMonths;
  const avgPerMonth = paidMonths > 0 ? totalRevenue / paidMonths : 0;

  const labelText = info?.label ?? decodeURIComponent(brand);
  const color = info?.color ?? '#9ca3af';

  if (brandTxs.length === 0) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
          <ArrowLeft size={16} /> Geri
        </button>
        <p className="text-center text-gray-400 py-16 text-sm">Bu marka için gelir işlemi bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500">
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: color }}>
            {labelText.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">{labelText}</h1>
            <p className="text-xs text-gray-400">{brandTxs.length} işlem · {allMonths.length} aylık dönem</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"><TrendingUp size={11} /> Toplam Gelir</p>
          <p className="text-lg font-bold font-mono mt-1 text-gray-900 dark:text-white">{formatCurrency(totalRevenue, currency)}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"><Receipt size={11} /> Aylık Ortalama</p>
          <p className="text-lg font-bold font-mono mt-1 text-gray-900 dark:text-white">{formatCurrency(avgPerMonth, currency)}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"><CheckCircle2 size={11} className="text-green-500" /> Ödenen Ay</p>
          <p className="text-lg font-bold font-mono mt-1 text-green-600 dark:text-green-400">{paidMonths}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"><AlertCircle size={11} className="text-red-400" /> Ödenmeyen Ay</p>
          <p className="text-lg font-bold font-mono mt-1 text-red-500 dark:text-red-400">{unpaidMonths}</p>
        </Card>
      </div>

      {/* Monthly payment table */}
      <Card padding="sm">
        <div className="flex items-center justify-between px-2 pb-3 mb-1 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar size={15} style={{ color }} /> Aylık Ödeme Tablosu
          </h2>
          <span className="text-xs text-gray-400">{allMonths[0]} — {allMonths[allMonths.length - 1]}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 pb-2 pl-2 w-28">Ay</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 pb-2 px-2">İşlemler</th>
                <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 pb-2 pr-2">Toplam</th>
                <th className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 pb-2 w-20">Durum</th>
              </tr>
            </thead>
            <tbody>
              {[...allMonths].reverse().map((month) => {
                const txList = byMonth.get(month);
                const paid = !!txList && txList.length > 0;
                const monthTotal = txList?.reduce((s, t) => s + t.amount, 0) ?? 0;
                const [y, mo] = month.split('-');
                const monthLabel = `${MONTHS_TR[parseInt(mo) - 1]} ${y}`;

                return (
                  <tr key={month}
                    className={`border-b border-gray-50 dark:border-gray-800/50 ${paid ? '' : 'opacity-50'}`}>
                    <td className="py-2.5 pl-2">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{monthLabel}</span>
                    </td>
                    <td className="py-2.5 px-2">
                      {paid ? (
                        <div className="flex flex-col gap-1">
                          {txList!.map((tx) => (
                            <div key={tx.id} className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-gray-600 dark:text-gray-400">{formatDate(tx.date)}</span>
                              {tx.service && (
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300">
                                  {SERVICE_LABELS[tx.service]}
                                </span>
                              )}
                              <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[160px]">{tx.description}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300 dark:text-gray-600 italic">— ödeme alınmadı</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-2 text-right">
                      {paid ? (
                        <span className="font-semibold font-mono text-sm text-green-600 dark:text-green-400 whitespace-nowrap">
                          +{formatCurrency(monthTotal, currency)}
                        </span>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-2 text-center">
                      {paid ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                          <CheckCircle2 size={13} /> Ödendi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                          <AlertCircle size={13} className="text-gray-300" /> Boş
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
