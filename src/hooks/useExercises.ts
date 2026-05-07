import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  createExercise as createExerciseApi,
  deleteExercise as deleteExerciseApi,
  listExercises,
} from '@/lib/firestore/exercises';
import type { Exercise, MuscleGroup } from '@/types';

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listExercises()
      .then((rows) => {
        if (!cancelled) setExercises(rows);
      })
      .catch((e) => toast.error(e.message ?? 'Failed to load exercises'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const create = useCallback(async (name: string, muscleGroup: MuscleGroup) => {
    const optimistic: Exercise = {
      id: `tmp-${Date.now()}`,
      name,
      muscleGroup,
      // @ts-expect-error optimistic placeholder
      createdAt: { toDate: () => new Date() },
    };
    setExercises((prev) => [...prev, optimistic].sort((a, b) => a.name.localeCompare(b.name)));
    try {
      const real = await createExerciseApi(name, muscleGroup);
      setExercises((prev) =>
        prev.map((e) => (e.id === optimistic.id ? real : e)).sort((a, b) => a.name.localeCompare(b.name)),
      );
      return real;
    } catch (e) {
      setExercises((prev) => prev.filter((x) => x.id !== optimistic.id));
      toast.error((e as Error).message ?? 'Failed to create exercise');
      throw e;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    const prev = exercises;
    setExercises((p) => p.filter((e) => e.id !== id));
    try {
      await deleteExerciseApi(id);
    } catch (e) {
      setExercises(prev);
      toast.error((e as Error).message ?? 'Failed to delete exercise');
    }
  }, [exercises]);

  return { exercises, loading, create, remove };
}
