import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import clsx from 'clsx';
import { ChevronRight, Dumbbell } from 'lucide-react';
import { useWorkoutSessions } from '@/hooks/useWorkoutSessions';
import { useExercises } from '@/hooks/useExercises';
import { SkeletonList } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import type { MuscleGroup } from '@/types';

const MUSCLE_GROUPS: (MuscleGroup | 'all')[] = [
  'all',
  'chest',
  'back',
  'legs',
  'shoulders',
  'biceps',
  'triceps',
  'core',
  'cardio',
];

export function WorkoutsList() {
  const { sessions, loading } = useWorkoutSessions();
  const { exercises } = useExercises();
  const [exerciseFilter, setExerciseFilter] = useState<string>('');
  const [groupFilter, setGroupFilter] = useState<MuscleGroup | 'all'>('all');

  const grouped = useMemo(() => {
    const map = new Map<string, typeof sessions>();
    for (const s of sessions) {
      const k = format(s.date.toDate(), 'MMMM yyyy');
      const arr = map.get(k) ?? [];
      arr.push(s);
      map.set(k, arr);
    }
    return Array.from(map.entries());
  }, [sessions]);

  const filteredGrouped = useMemo(() => {
    if (groupFilter === 'all' && !exerciseFilter) return grouped;
    const term = exerciseFilter.toLowerCase();
    return grouped
      .map(([k, arr]) => [k, arr.filter((s) => s.notes.toLowerCase().includes(term))] as const)
      .filter(([, arr]) => arr.length > 0);
  }, [grouped, exerciseFilter, groupFilter]);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Workouts</h1>
          <p className="text-sm text-paper-muted mt-1">
            {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'} ·{' '}
            {exercises.length} exercises
          </p>
        </div>
        <Link to="/workouts/new" className="btn-primary">
          + New
        </Link>
      </div>

      <div className="space-y-3">
        <input
          className="input"
          placeholder="Filter by notes..."
          value={exerciseFilter}
          onChange={(e) => setExerciseFilter(e.target.value)}
        />
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {MUSCLE_GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setGroupFilter(g)}
              className={clsx('chip capitalize', groupFilter === g && 'chip-active')}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <SkeletonList rows={4} />
      ) : sessions.length === 0 ? (
        <EmptyState
          title="No workouts yet"
          description="Start tracking your training. Each session you log builds your history."
          icon={<Dumbbell size={24} strokeWidth={2} />}
          cta={
            <Link to="/workouts/new" className="btn-primary">
              Start your first session
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          {filteredGrouped.map(([month, list]) => (
            <div key={month}>
              <h2 className="text-[11px] uppercase tracking-[0.14em] text-paper-muted font-medium mb-3">
                {month}
              </h2>
              <ul className="space-y-2">
                {list.map((s) => (
                  <li key={s.id}>
                    <Link
                      to={`/workouts/${s.id}`}
                      className="card flex items-center gap-4 hover:border-royal-500/40 transition"
                    >
                      <div className="flex flex-col items-center justify-center min-w-[56px] py-1 px-3 rounded-xl bg-ink-900 border border-ink-700/60">
                        <div className="font-display text-2xl font-bold tabular tracking-tight leading-none text-paper">
                          {format(s.date.toDate(), 'd')}
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.14em] text-paper-muted mt-1">
                          {format(s.date.toDate(), 'MMM')}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-paper">
                          {format(s.date.toDate(), 'EEEE')}
                        </div>
                        {s.notes ? (
                          <div className="text-sm text-paper-muted truncate mt-0.5">
                            {s.notes}
                          </div>
                        ) : (
                          <div className="text-sm text-paper-dim mt-0.5">No notes</div>
                        )}
                      </div>
                      <ChevronRight size={20} className="text-paper-dim" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
