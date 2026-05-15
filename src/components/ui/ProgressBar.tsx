interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  height?: number;
  showLabel?: boolean;
}

export default function ProgressBar({ value, color = '#22c55e', height = 6, showLabel = false }: ProgressBarProps) {
  const pct = Math.min(Math.max(value, 0), 100);
  const isDanger = pct >= 90;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden" style={{ height }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: isDanger ? '#ef4444' : color }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-mono font-medium text-gray-500 dark:text-gray-400 w-10 text-right">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}
