import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Check, Dumbbell, Pencil, Timer, X } from 'lucide-react';
import clsx from 'clsx';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useSets } from '@/hooks/useSets';
import { useAuthStore } from '@/store/auth';
import { ExercisePicker } from './ExercisePicker';
import { Skeleton, SkeletonList } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { getSession, deleteSession, updateSession } from '@/lib/firestore/workoutSessions';
import { listSetsByExercise } from '@/lib/firestore/sets';
import { chartTheme, RoyalAreaGradient } from '@/lib/chartTheme';
import { Timestamp } from 'firebase/firestore';
import type { Exercise, WorkoutSession, WorkoutSet } from '@/types';

const REST_PRESETS = [60, 90, 120, 180] as const;

function formatRest(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function todayLocalIso(d: Date) {
  const copy = new Date(d);
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().slice(0, 10);
}

export function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const uid = useAuthStore((s) => s.user?.uid);
  const nav = useNavigate();

  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const { sets, loading: setsLoading, create, update, remove } = useSets(id);

  // --- set form ---
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [reps, setReps] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [rpe, setRpe] = useState('');

  // --- rest timer ---
  const [restDuration, setRestDuration] = useState(90);
  const [restRemaining, setRestRemaining] = useState<number | null>(null);

  // --- session editing ---
  const [editing, setEditing] = useState(false);
  const [editDate, setEditDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!uid || !id) return;
    setSessionLoading(true);
    getSession(uid, id)
      .then(setSession)
      .catch((e) => toast.error(e.message ?? 'Failed to load session'))
      .finally(() => setSessionLoading(false));
  }, [uid, id]);

  useEffect(() => {
    if (session) {
      setEditDate(todayLocalIso(session.date.toDate()));
      setEditNotes(session.notes);
    }
  }, [session]);

  // countdown tick
  useEffect(() => {
    if (restRemaining === null || restRemaining <= 0) {
      if (restRemaining === 0) {
        toast('Rest done!', { icon: '🔔' });
        setRestRemaining(null);
      }
      return;
    }
    const t = setTimeout(() => setRestRemaining((r) => (r !== null ? r - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [restRemaining]);

  const groupedSets = useMemo(() => {
    const map = new Map<string, WorkoutSet[]>();
    for (const s of sets) {
      const arr = map.get(s.exerciseId) ?? [];
      arr.push(s);
      map.set(s.exerciseId, arr);
    }
    return Array.from(map.entries());
  }, [sets]);

  const nextSetNumber = exercise
    ? sets.filter((s) => s.exerciseId === exercise.id).length + 1
    : 1;

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exercise) return toast.error('Select an exercise');
    const r = parseInt(reps, 10);
    const w = parseFloat(weightKg);
    if (!r || r < 1) return toast.error('Reps must be ≥ 1');
    if (isNaN(w) || w < 0) return toast.error('Weight must be ≥ 0');
    const rpeVal = rpe ? parseFloat(rpe) : null;
    if (rpeVal !== null && (rpeVal < 1 || rpeVal > 10)) return toast.error('RPE 1–10');

    try {
      await create({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        muscleGroup: exercise.muscleGroup,
        setNumber: nextSetNumber,
        reps: r,
        weightKg: w,
        rpe: rpeVal,
      });
      setReps('');
      setWeightKg('');
      setRpe('');
      setRestRemaining(restDuration);
    } catch {
      // error already toasted in hook
    }
  };

  const onSaveEdit = async () => {
    if (!uid || !id || !session) return;
    setSaving(true);
    try {
      const newDate = Timestamp.fromDate(new Date(editDate));
      await updateSession(uid, id, { date: newDate, notes: editNotes });
      setSession({ ...session, date: newDate, notes: editNotes });
      setEditing(false);
      toast.success('Session updated');
    } catch (e) {
      toast.error((e as Error).message ?? 'Failed to update session');
    } finally {
      setSaving(false);
    }
  };

  const onDeleteSession = async () => {
    if (!uid || !id) return;
    if (!confirm('Delete this entire session and all sets?')) return;
    try {
      await deleteSession(uid, id);
      toast.success('Session deleted');
      nav('/workouts');
    } catch (e) {
      toast.error((e as Error).message ?? 'Failed to delete');
    }
  };

  if (sessionLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  if (!session) return <EmptyState title="Session not found" />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        {editing ? (
          <div className="flex-1 space-y-2 mr-3">
            <input
              type="date"
              className="input"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
            />
            <input
              className="input"
              placeholder="Notes"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                className="btn-primary !text-xs !px-3 !py-2 gap-1.5"
                onClick={onSaveEdit}
                disabled={saving}
              >
                <Check size={13} strokeWidth={2.5} />
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                className="btn-ghost !text-xs !px-3 !py-2"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-paper-muted font-medium">
              {format(session.date.toDate(), 'EEEE')}
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight mt-1">
              {format(session.date.toDate(), 'MMM d, yyyy')}
            </h1>
            {session.notes && (
              <p className="text-sm text-paper-muted mt-2">{session.notes}</p>
            )}
          </div>
        )}

        {!editing && (
          <div className="flex items-center gap-3">
            <button
              className="text-paper-dim hover:text-paper transition p-1"
              onClick={() => setEditing(true)}
              aria-label="Edit session"
            >
              <Pencil size={15} strokeWidth={2} />
            </button>
            <button
              className="text-[11px] uppercase tracking-[0.12em] text-paper-dim hover:text-red-400 transition"
              onClick={onDeleteSession}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card !p-4">
          <div className="font-display text-2xl font-bold tabular tracking-tight">
            {sets.length}
          </div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-paper-muted mt-1">
            Sets logged
          </div>
        </div>
        <div className="card !p-4">
          <div className="font-display text-2xl font-bold tabular tracking-tight">
            {groupedSets.length}
          </div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-paper-muted mt-1">
            Exercises
          </div>
        </div>
      </div>

      {/* Add set form */}
      <form className="card-hero space-y-3" onSubmit={onAdd}>
        <div className="flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-[0.14em] text-paper-muted font-medium">
            Add set
          </div>
          {/* Rest duration presets */}
          <div className="flex items-center gap-1.5">
            <Timer size={13} className="text-paper-dim" strokeWidth={2} />
            <div className="flex gap-1">
              {REST_PRESETS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRestDuration(s)}
                  className={clsx(
                    'text-[10px] px-2 py-1 rounded-lg transition',
                    restDuration === s
                      ? 'bg-royal-500/20 text-royal-400 border border-royal-500/40'
                      : 'text-paper-dim hover:text-paper-muted',
                  )}
                >
                  {s}s
                </button>
              ))}
            </div>
          </div>
        </div>

        <ExercisePicker value={exercise} onChange={setExercise} />

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="label">Set #</label>
            <input className="input tabular text-center" value={nextSetNumber} disabled />
          </div>
          <div>
            <label className="label">Reps</label>
            <input
              className="input tabular text-center"
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Weight (kg)</label>
            <input
              className="input tabular text-center"
              type="number"
              inputMode="decimal"
              step="0.5"
              placeholder="0"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="label">RPE (optional, 1–10)</label>
          <input
            className="input tabular"
            type="number"
            inputMode="decimal"
            step="0.5"
            min={1}
            max={10}
            placeholder="—"
            value={rpe}
            onChange={(e) => setRpe(e.target.value)}
          />
        </div>
        <button className="btn-primary w-full">+ Add set</button>
      </form>

      {/* Rest timer */}
      {restRemaining !== null && (
        <div className="card flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Timer size={18} className="text-royal-400" strokeWidth={2} />
            <div>
              <div className="font-display text-2xl font-bold tabular tracking-tight text-royal-400">
                {formatRest(restRemaining)}
              </div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-paper-muted mt-0.5">
                Rest
              </div>
            </div>
          </div>
          <button
            className="text-paper-dim hover:text-paper transition p-2"
            onClick={() => setRestRemaining(null)}
            aria-label="Dismiss timer"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Sets list */}
      {setsLoading ? (
        <SkeletonList rows={2} />
      ) : groupedSets.length === 0 ? (
        <EmptyState
          title="No sets yet"
          description="Use the form above to log your first set."
          icon={<Dumbbell size={24} strokeWidth={2} />}
        />
      ) : (
        <div className="space-y-3">
          {groupedSets.map(([exId, list]) => (
            <ExerciseSetGroup
              key={exId}
              exerciseId={exId}
              sets={list}
              onUpdate={update}
              onRemove={remove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface GroupProps {
  exerciseId: string;
  sets: WorkoutSet[];
  onUpdate: (id: string, patch: Partial<WorkoutSet>) => void;
  onRemove: (id: string) => void;
}

function ExerciseSetGroup({ exerciseId, sets, onUpdate, onRemove }: GroupProps) {
  const uid = useAuthStore((s) => s.user?.uid);
  const [history, setHistory] = useState<WorkoutSet[] | null>(null);
  const exerciseName = sets[0]?.exerciseName ?? '';

  useEffect(() => {
    if (!uid) return;
    listSetsByExercise(uid, exerciseId)
      .then(setHistory)
      .catch(() => setHistory([]));
  }, [uid, exerciseId]);

  const chartData = useMemo(() => {
    if (!history) return [];
    const byDay = new Map<string, number>();
    for (const s of history) {
      const day = format(s.createdAt.toDate(), 'yyyy-MM-dd');
      byDay.set(day, Math.max(byDay.get(day) ?? 0, s.weightKg));
    }
    return Array.from(byDay.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, weightKg]) => ({ date, weightKg }));
  }, [history]);

  const gradId = `grad-${exerciseId}`;

  return (
    <div className="card !p-0 overflow-hidden">
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <h3 className="font-display text-lg font-bold tracking-tight">{exerciseName}</h3>
        <span className="chip">
          {sets.length} {sets.length === 1 ? 'set' : 'sets'}
        </span>
      </div>

      {chartData.length > 1 && (
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <RoyalAreaGradient id={gradId} />
              </defs>
              <Area
                type="monotone"
                dataKey="weightKg"
                stroke={chartTheme.line}
                strokeWidth={2}
                fill={`url(#${gradId})`}
              />
              <XAxis dataKey="date" hide />
              <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip
                contentStyle={chartTheme.tooltip}
                formatter={(v: number) => [`${v} kg`, 'Top set']}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <table className="w-full text-sm tabular">
        <thead>
          <tr className="text-[10px] uppercase tracking-[0.14em] text-paper-muted">
            <th className="text-left pl-5 py-2 font-medium">#</th>
            <th className="text-left py-2 font-medium">Reps</th>
            <th className="text-left py-2 font-medium">kg</th>
            <th className="text-left py-2 font-medium">RPE</th>
            <th className="pr-5"></th>
          </tr>
        </thead>
        <tbody>
          {sets.map((s) => (
            <tr key={s.id} className="border-t border-ink-700/40">
              <td className="pl-5 py-3 text-paper-muted">{s.setNumber}</td>
              <td className="py-2.5">
                <input
                  className="input !py-1.5 !px-2 !text-sm w-14 tabular"
                  type="number"
                  defaultValue={s.reps}
                  onBlur={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (v && v !== s.reps) onUpdate(s.id, { reps: v });
                  }}
                />
              </td>
              <td className="py-2.5">
                <input
                  className="input !py-1.5 !px-2 !text-sm w-16 tabular"
                  type="number"
                  step="0.5"
                  defaultValue={s.weightKg}
                  onBlur={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v) && v !== s.weightKg) onUpdate(s.id, { weightKg: v });
                  }}
                />
              </td>
              <td className="py-2.5">
                <input
                  className="input !py-1.5 !px-2 !text-sm w-12 tabular"
                  type="number"
                  step="0.5"
                  defaultValue={s.rpe ?? ''}
                  onBlur={(e) => {
                    const raw = e.target.value;
                    const v = raw === '' ? null : parseFloat(raw);
                    if (v !== s.rpe) onUpdate(s.id, { rpe: v });
                  }}
                />
              </td>
              <td className="pr-5 py-2.5 text-right">
                <button
                  className="text-paper-dim hover:text-red-400 transition p-1.5"
                  onClick={() => onRemove(s.id)}
                  aria-label="Remove set"
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
