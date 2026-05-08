import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import {
  createSet as createApi,
  deleteSet as deleteApi,
  updateSet as updateApi,
  type SetInput,
} from '@/lib/firestore/sets';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/auth';
import type { WorkoutSet } from '@/types';

export function useSets(sessionId: string | undefined) {
  const uid = useAuthStore((s) => s.user?.uid);
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid || !sessionId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(
      collection(db, 'users', uid, 'workoutSessions', sessionId, 'sets'),
      orderBy('createdAt', 'asc'),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setSets(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WorkoutSet, 'id'>) })));
        setLoading(false);
      },
      (e) => toast.error(e.message ?? 'Failed to load sets'),
    );
    return unsub;
  }, [uid, sessionId]);

  const create = useCallback(
    async (input: SetInput) => {
      if (!uid || !sessionId) return;
      try {
        await createApi(uid, sessionId, input);
      } catch (e) {
        toast.error((e as Error).message ?? 'Failed to add set');
        throw e;
      }
    },
    [uid, sessionId],
  );

  const update = useCallback(
    async (setId: string, patch: Partial<SetInput>) => {
      if (!uid || !sessionId) return;
      try {
        await updateApi(uid, sessionId, setId, patch);
      } catch (e) {
        toast.error((e as Error).message ?? 'Failed to update set');
      }
    },
    [uid, sessionId],
  );

  const remove = useCallback(
    async (setId: string) => {
      if (!uid || !sessionId) return;
      try {
        await deleteApi(uid, sessionId, setId);
      } catch (e) {
        toast.error((e as Error).message ?? 'Failed to delete set');
      }
    },
    [uid, sessionId],
  );

  return { sets, loading, create, update, remove };
}
