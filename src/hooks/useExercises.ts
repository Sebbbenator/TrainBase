import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import {
  createExercise as createApi,
  deleteExercise as deleteApi,
} from '@/lib/firestore/exercises';
import { db } from '@/lib/firebase';
import type { Exercise, MuscleGroup } from '@/types';

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'exercises'), orderBy('name'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setExercises(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Exercise, 'id'>) })),
        );
        setLoading(false);
      },
      (e) => toast.error(e.message ?? 'Failed to load exercises'),
    );
    return unsub;
  }, []);

  const create = useCallback(async (name: string, muscleGroup: MuscleGroup) => {
    try {
      return await createApi(name, muscleGroup);
    } catch (e) {
      toast.error((e as Error).message ?? 'Failed to create exercise');
      throw e;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await deleteApi(id);
    } catch (e) {
      toast.error((e as Error).message ?? 'Failed to delete exercise');
    }
  }, []);

  return { exercises, loading, create, remove };
}
