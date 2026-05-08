import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import {
  createSession as createApi,
  deleteSession as deleteApi,
  updateSession as updateApi,
} from '@/lib/firestore/workoutSessions';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/auth';
import type { WorkoutSession } from '@/types';

export function useWorkoutSessions() {
  const uid = useAuthStore((s) => s.user?.uid);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    const q = query(collection(db, 'users', uid, 'workoutSessions'), orderBy('date', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setSessions(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WorkoutSession, 'id'>) })),
        );
        setLoading(false);
      },
      (e) => toast.error(e.message ?? 'Failed to load sessions'),
    );
    return unsub;
  }, [uid]);

  const create = useCallback(
    async (date: Date, notes: string) => {
      if (!uid) throw new Error('Not authenticated');
      return createApi(uid, date, notes);
    },
    [uid],
  );

  const update = useCallback(
    async (id: string, patch: Partial<Pick<WorkoutSession, 'notes' | 'date'>>) => {
      if (!uid) return;
      try {
        await updateApi(uid, id, patch);
      } catch (e) {
        toast.error((e as Error).message ?? 'Failed to update session');
      }
    },
    [uid],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!uid) return;
      try {
        await deleteApi(uid, id);
      } catch (e) {
        toast.error((e as Error).message ?? 'Failed to delete session');
      }
    },
    [uid],
  );

  return { sessions, loading, create, update, remove };
}
