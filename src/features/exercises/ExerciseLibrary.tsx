import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import {
  Activity,
  ClipboardList,
  Dumbbell,
  Footprints,
  Heart,
  Hexagon,
  Mountain,
  Shield,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useExercises } from '@/hooks/useExercises';
import { SkeletonList } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import type { MuscleGroup } from '@/types';

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

const schema = z.object({
  name: z.string().min(2),
  muscleGroup: z.enum([
    'chest',
    'back',
    'legs',
    'shoulders',
    'biceps',
    'triceps',
    'core',
    'cardio',
  ]),
});
type Form = z.infer<typeof schema>;

const groupIcon: Record<MuscleGroup, LucideIcon> = {
  chest: Heart,
  back: Shield,
  legs: Footprints,
  shoulders: Mountain,
  biceps: Dumbbell,
  triceps: Zap,
  core: Hexagon,
  cardio: Activity,
};

export function ExerciseLibrary() {
  const { exercises, loading, create, remove } = useExercises();
  const [filter, setFilter] = useState<MuscleGroup | 'all'>('all');
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { muscleGroup: 'chest' },
  });

  const onSubmit = async (data: Form) => {
    try {
      await create(data.name, data.muscleGroup);
      toast.success('Exercise added');
      reset();
      setShowForm(false);
    } catch {
      /* handled in hook */
    }
  };

  const filtered =
    filter === 'all' ? exercises : exercises.filter((e) => e.muscleGroup === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Exercises</h1>
          <p className="text-sm text-paper-muted mt-1">
            {exercises.length} in your library
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : '+ New'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="card-hero space-y-3">
          <div>
            <label className="label">Name</label>
            <input className="input" {...register('name')} placeholder="e.g. Bench Press" />
            {errors.name && (
              <p className="text-xs text-red-400 mt-1.5">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="label">Muscle group</label>
            <select className="input capitalize" {...register('muscleGroup')}>
              {MUSCLE_GROUPS.map((g) => (
                <option key={g} value={g} className="capitalize">
                  {g}
                </option>
              ))}
            </select>
          </div>
          <button className="btn-primary w-full">Save</button>
        </form>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {(['all', ...MUSCLE_GROUPS] as const).map((g) => (
          <button
            key={g}
            onClick={() => setFilter(g)}
            className={clsx('chip capitalize', filter === g && 'chip-active')}
          >
            {g}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonList rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No exercises yet"
          description="Add exercises to start logging sets."
          icon={<ClipboardList size={24} strokeWidth={2} />}
          cta={
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              Add your first exercise
            </button>
          }
        />
      ) : (
        <ul className="space-y-2">
          {filtered.map((e) => (
            <li
              key={e.id}
              className="card flex items-center justify-between !py-3.5 !px-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-royal-500/10 border border-royal-500/30 flex items-center justify-center text-royal-400">
                  {(() => {
                    const Icon = groupIcon[e.muscleGroup];
                    return <Icon size={18} strokeWidth={2} />;
                  })()}
                </div>
                <div>
                  <div className="font-medium text-paper">{e.name}</div>
                  <div className="text-[11px] uppercase tracking-[0.12em] text-paper-dim mt-0.5">
                    {e.muscleGroup}
                  </div>
                </div>
              </div>
              <button
                className="text-paper-dim hover:text-red-400 transition p-2"
                onClick={() => {
                  if (confirm(`Delete "${e.name}"?`)) remove(e.id);
                }}
                aria-label="Delete"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
