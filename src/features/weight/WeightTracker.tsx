import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Scale, X } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import clsx from 'clsx';
import { useWeightLogs } from '@/hooks/useWeightLogs';
import { SkeletonList } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { Stat } from '@/components/Stat';
import { chartTheme, ROYAL_GRADIENT_ID, RoyalAreaGradient } from '@/lib/chartTheme';
import type { WeightLog } from '@/types';

type Range = 30 | 90 | 180 | 0;

function todayLocalIso() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function WeightTracker() {
  const { logs, loading, upsert, remove } = useWeightLogs();
  const [date, setDate] = useState(todayLocalIso());
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [range, setRange] = useState<Range>(90);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) return toast.error('Enter a valid weight');
    await upsert(new Date(date), w, notes);
    toast.success('Weight saved');
    setWeight('');
    setNotes('');
  };

  const filtered = useMemo(() => {
    if (range === 0) return logs;
    const cutoff = Date.now() - range * 86400 * 1000;
    return logs.filter((l) => l.date.toMillis() >= cutoff);
  }, [logs, range]);

  const chartData = filtered.map((l) => ({
    date: format(l.date.toDate(), 'MMM d'),
    weightKg: l.weightKg,
  }));

  const stats = useMemo(() => {
    if (logs.length === 0) return null;
    const sorted = [...logs].sort((a, b) => a.date.toMillis() - b.date.toMillis());
    const first = sorted[0].weightKg;
    const last = sorted[sorted.length - 1].weightKg;
    const last7 = sorted.slice(-7);
    const avg7 = last7.reduce((s, l) => s + l.weightKg, 0) / last7.length;
    const change = last - first;
    const trend: 'up' | 'down' | 'flat' =
      last7.length >= 2 && last7[last7.length - 1].weightKg > last7[0].weightKg
        ? 'up'
        : last7.length >= 2 && last7[last7.length - 1].weightKg < last7[0].weightKg
        ? 'down'
        : 'flat';
    return { current: last, start: first, change, avg7, trend };
  }, [logs]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Body weight</h1>
        <p className="text-sm text-paper-muted mt-1">Track your progress over time.</p>
      </div>

      {/* Hero stat */}
      {stats && (
        <div className="card-hero">
          <div className="text-[11px] uppercase tracking-[0.14em] text-paper-muted font-medium mb-3">
            Current
          </div>
          <Stat
            value={stats.current.toFixed(1)}
            unit="kg"
            size="hero"
            trend={stats.trend}
          />
          <div className="mt-4 pt-4 border-t border-ink-700/40 grid grid-cols-3 gap-4">
            <Stat value={stats.start.toFixed(1)} unit="kg" label="Start" size="sm" />
            <Stat
              value={`${stats.change >= 0 ? '+' : ''}${stats.change.toFixed(1)}`}
              unit="kg"
              label="Change"
              size="sm"
            />
            <Stat value={stats.avg7.toFixed(1)} unit="kg" label="7d avg" size="sm" />
          </div>
        </div>
      )}

      {/* Log form */}
      <form className="card space-y-3" onSubmit={onSubmit}>
        <div className="text-[11px] uppercase tracking-[0.14em] text-paper-muted font-medium">
          Log entry
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Weight (kg)</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              className="input tabular"
              placeholder="0.0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="label">Notes</label>
          <input
            className="input"
            placeholder="Optional"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <button className="btn-primary w-full">Save entry</button>
      </form>

      {/* Trend chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold tracking-tight">Trend</h2>
          <div className="segmented">
            {([30, 90, 180, 0] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={clsx(
                  'segmented-item',
                  range === r && 'segmented-item-active',
                )}
              >
                {r === 0 ? 'All' : `${r}d`}
              </button>
            ))}
          </div>
        </div>
        {chartData.length < 2 ? (
          <p className="text-sm text-paper-muted py-8 text-center">
            Log at least 2 entries to see a chart.
          </p>
        ) : (
          <div className="h-52 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                <defs>
                  <RoyalAreaGradient />
                </defs>
                <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 4" vertical={false} />
                <Area
                  type="monotone"
                  dataKey="weightKg"
                  stroke={chartTheme.line}
                  strokeWidth={2.5}
                  fill={`url(#${ROYAL_GRADIENT_ID})`}
                />
                <XAxis
                  dataKey="date"
                  tick={chartTheme.axisTick}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={chartTheme.axisTick}
                  axisLine={false}
                  tickLine={false}
                  domain={['dataMin - 1', 'dataMax + 1']}
                  width={28}
                />
                <Tooltip
                  contentStyle={chartTheme.tooltip}
                  cursor={{ stroke: chartTheme.line, strokeOpacity: 0.3 }}
                  formatter={(v: number) => [`${v.toFixed(1)} kg`, 'Weight']}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* History */}
      <div>
        <h2 className="font-display font-bold tracking-tight mb-3">History</h2>
        {loading ? (
          <SkeletonList rows={3} />
        ) : logs.length === 0 ? (
          <EmptyState
            title="No entries yet"
            description="Log today's weight to start tracking."
            icon={<Scale size={24} strokeWidth={2} />}
          />
        ) : (
          <ul className="space-y-2">
            {[...logs]
              .sort((a, b) => b.date.toMillis() - a.date.toMillis())
              .map((l) => (
                <WeightRow key={l.id} log={l} onDelete={() => remove(l.id)} />
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function WeightRow({ log, onDelete }: { log: WeightLog; onDelete: () => void }) {
  return (
    <li className="card flex items-center justify-between !py-3.5 !px-4">
      <div className="flex items-center gap-4">
        <div className="font-display text-2xl font-bold tabular tracking-tight text-paper">
          {log.weightKg.toFixed(1)}
          <span className="text-sm text-paper-muted ml-1 font-medium">kg</span>
        </div>
        <div>
          <div className="text-sm font-medium text-paper">
            {format(log.date.toDate(), 'EEE, MMM d')}
          </div>
          {log.notes && (
            <div className="text-xs text-paper-dim mt-0.5">{log.notes}</div>
          )}
        </div>
      </div>
      <button
        className="text-paper-dim hover:text-red-400 transition p-2"
        onClick={() => {
          if (confirm('Delete this entry?')) onDelete();
        }}
        aria-label="Delete entry"
      >
        <X size={16} strokeWidth={2} />
      </button>
    </li>
  );
}
