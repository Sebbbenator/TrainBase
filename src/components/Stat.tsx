import clsx from 'clsx';
import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

type Trend = 'up' | 'down' | 'flat' | null;
type Size = 'hero' | 'md' | 'sm';

interface Props {
  value: ReactNode;
  unit?: string;
  label?: string;
  trend?: Trend;
  size?: Size;
  className?: string;
}

const sizeClass: Record<Size, string> = {
  hero: 'text-hero',
  md: 'text-stat',
  sm: 'text-2xl',
};

const unitSizeClass: Record<Size, string> = {
  hero: 'text-xl',
  md: 'text-base',
  sm: 'text-sm',
};

const TrendIcon = ({ t }: { t: Trend }) => {
  if (t === 'up') return <ArrowUp size={14} strokeWidth={2.5} />;
  if (t === 'down') return <ArrowDown size={14} strokeWidth={2.5} />;
  if (t === 'flat') return <Minus size={14} strokeWidth={2.5} />;
  return null;
};

const trendColor = (t: Trend) => {
  if (t === 'up' || t === 'down') return 'text-royal-400';
  return 'text-paper-dim';
};

export function Stat({ value, unit, label, trend = null, size = 'md', className }: Props) {
  return (
    <div className={clsx('flex flex-col', className)}>
      <div className="flex items-baseline gap-1.5">
        <span
          className={clsx(
            'font-display font-bold tabular tracking-tight text-paper leading-none',
            sizeClass[size],
          )}
        >
          {value}
        </span>
        {unit && (
          <span className={clsx('text-paper-muted font-medium', unitSizeClass[size])}>
            {unit}
          </span>
        )}
        {trend && (
          <span className={clsx('inline-flex items-center ml-1', trendColor(trend))}>
            <TrendIcon t={trend} />
          </span>
        )}
      </div>
      {label && (
        <div className="text-[11px] uppercase tracking-[0.14em] text-paper-muted mt-1.5 font-medium">
          {label}
        </div>
      )}
    </div>
  );
}
