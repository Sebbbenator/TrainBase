import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useExercises } from '@/hooks/useExercises';
import type { Exercise, MuscleGroup } from '@/types';

interface Props {
  value: Exercise | null;
  onChange: (e: Exercise) => void;
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  'chest',
  'back',
  'legs',
  'shoulders',
  'biceps',
  'triceps',
  'core',
  'cardio',
];

export function ExercisePicker({ value, onChange }: Props) {
  const { exercises, create } = useExercises();
  const [q, setQ] = useState('');
  const [creatingGroup, setCreatingGroup] = useState<MuscleGroup>('chest');

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return exercises.slice(0, 20);
    return exercises.filter((e) => e.name.toLowerCase().includes(term)).slice(0, 20);
  }, [exercises, q]);

  const exact = exercises.find((e) => e.name.toLowerCase() === q.trim().toLowerCase());

  const onCreate = async () => {
    if (!q.trim()) return;
    try {
      const e = await create(q.trim(), creatingGroup);
      onChange(e);
      setQ(e.name);
      toast.success('Exercise created');
    } catch {
      /* handled */
    }
  };

  return (
    <div>
      <label className="label">Exercise</label>
      <input
        className="input"
        placeholder="Search or create..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {value && (
        <div className="text-xs text-paper-muted mt-1.5">
          Selected: <span className="text-royal-400 font-medium">{value.name}</span>
        </div>
      )}

      {q && (
        <div className="mt-2 max-h-44 overflow-y-auto border border-ink-700 rounded-xl bg-ink-900">
          {filtered.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => {
                onChange(e);
                setQ(e.name);
              }}
              className="w-full text-left px-3.5 py-2.5 text-sm hover:bg-ink-800 flex justify-between items-center transition"
            >
              <span className="text-paper">{e.name}</span>
              <span className="text-[10px] uppercase tracking-[0.12em] text-paper-dim">
                {e.muscleGroup}
              </span>
            </button>
          ))}
          {!exact && q.trim().length >= 2 && (
            <div className="px-3 py-2.5 border-t border-ink-700 flex items-center gap-2">
              <select
                className="input flex-1 !py-2"
                value={creatingGroup}
                onChange={(e) => setCreatingGroup(e.target.value as MuscleGroup)}
              >
                {MUSCLE_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn-primary !text-xs !px-3 !py-2"
                onClick={onCreate}
              >
                + Create
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
