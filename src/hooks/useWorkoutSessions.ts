import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  createSession as createApi,
  deleteSession as deleteApi,
  listSessions,
  updateSession as updateApi,
} from '@/lib/firestore/workoutSessions';
import { useAuthStore } from '@/store/auth';
import type { WorkoutSession } from '@/types';

export function useWorkoutSessions() {
  const uid = useAuthStore((s) => s.user?.uid);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    setLoading(true);
    listSessions(uid)
      .then((rows) => !cancelled && setSessions(rows))
      .catch((e) => toast.error(e.message ?? 'Failed to load sessions'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const create = useCallback(
    async (date: Date, notes: string) => {
      if (!uid) throw new Error('Not authenticated');
      const session = await createApi(uid, date, notes);
      setSessions((prev) => [session, ...prev]);
      return session;
    },
    [uid],
  );

  const update = useCallback(
    async (id: string, patch: Partial<Pick<WorkoutSession, 'notes' | 'date'>>) => {
      if (!uid) return;
      const prev = sessions;
      setSessions((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
      try {
        await updateApi(uid, id, patch);
      } catch (e) {
        setSessions(prev);
        toast.error((e as Error).message ?? 'Failed to update');
      }
    },
    [uid, sessions],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!uid) return;
      const prev = sessions;
      setSessions((s) => s.filter((x) => x.id !== id));
      try {
        await deleteApi(uid, id);
      } catch (e) {
        setSessions(prev);
        toast.error((e as Error).message ?? 'Failed to delete session');
      }
    },
    [uid, sessions],
  );

  return { sessions, loading, create, update, remove };
}
