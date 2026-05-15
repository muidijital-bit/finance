import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

const paddings = { sm: 'p-4', md: 'p-5', lg: 'p-6' };

export default function Card({ children, className = '', padding = 'md' }: CardProps) {
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 ${paddings[padding]} ${className}`}>
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: number;
  icon?: ReactNode;
  color?: 'green' | 'red' | 'blue' | 'purple' | 'gray';
}

const colorMap = {
  green: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
  red: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
  blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
  purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
  gray: 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800',
};

export function StatCard({ label, value, sub, trend, icon, color = 'gray' }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white font-mono">{value}</p>
          {sub && (
            <p className={`text-xs mt-1 ${trend !== undefined ? (trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400') : 'text-gray-400'}`}>
              {trend !== undefined && (trend >= 0 ? '↑ ' : '↓ ')}{sub}
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-2.5 rounded-lg ${colorMap[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
