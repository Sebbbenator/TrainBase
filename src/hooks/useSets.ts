import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  createSet as createApi,
  deleteSet as deleteApi,
  listSets,
  updateSet as updateApi,
  type SetInput,
} from '@/lib/firestore/sets';
import { useAuthStore } from '@/store/auth';
import type { WorkoutSet } from '@/types';
import { Timestamp } from 'firebase/firestore';

export function useSets(sessionId: string | undefined) {
  const uid = useAuthStore((s) => s.user?.uid);
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid || !sessionId) return;
    let cancelled = false;
    setLoading(true);
    listSets(uid, sessionId)
      .then((rows) => !cancelled && setSets(rows))
      .catch((e) => toast.error(e.message ?? 'Failed to load sets'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [uid, sessionId]);

  const create = useCallback(
    async (input: SetInput) => {
      if (!uid || !sessionId) return;
      const optimistic: WorkoutSet = {
        id: `tmp-${Date.now()}`,
        ...input,
        createdAt: Timestamp.now(),
      };
      setSets((p) => [...p, optimistic]);
      try {
        const real = await createApi(uid, sessionId, input);
        setSets((p) => p.map((s) => (s.id === optimistic.id ? real : s)));
      } catch (e) {
        setSets((p) => p.filter((s) => s.id !== optimistic.id));
        toast.error((e as Error).message ?? 'Failed to add set');
      }
    },
    [uid, sessionId],
  );

  const update = useCallback(
    async (setId: string, patch: Partial<SetInput>) => {
      if (!uid || !sessionId) return;
      const prev = sets;
      setSets((p) => p.map((s) => (s.id === setId ? { ...s, ...patch } : s)));
      try {
        await updateApi(uid, sessionId, setId, patch);
      } catch (e) {
        setSets(prev);
        toast.error((e as Error).message ?? 'Failed to update set');
      }
    },
    [uid, sessionId, sets],
  );

  const remove = useCallback(
    async (setId: string) => {
      if (!uid || !sessionId) return;
      const prev = sets;
      setSets((p) => p.filter((s) => s.id !== setId));
      try {
        await deleteApi(uid, sessionId, setId);
      } catch (e) {
        setSets(prev);
        toast.error((e as Error).message ?? 'Failed to delete set');
      }
    },
    [uid, sessionId, sets],
  );

  return { sets, loading, create, update, remove };
}
