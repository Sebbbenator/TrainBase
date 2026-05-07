import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  deleteWeightLog as deleteApi,
  listWeightLogs,
  upsertWeightLog as upsertApi,
} from '@/lib/firestore/weightLogs';
import { useAuthStore } from '@/store/auth';
import type { WeightLog } from '@/types';

export function useWeightLogs() {
  const uid = useAuthStore((s) => s.user?.uid);
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    setLoading(true);
    listWeightLogs(uid)
      .then((rows) => !cancelled && setLogs(rows))
      .catch((e) => toast.error(e.message ?? 'Failed to load weight logs'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const upsert = useCallback(
    async (date: Date, weightKg: number, notes: string) => {
      if (!uid) return;
      const prev = logs;
      try {
        const real = await upsertApi(uid, date, weightKg, notes);
        setLogs((p) => {
          const next = p.filter((l) => l.id !== real.id);
          next.push(real);
          next.sort((a, b) => a.date.toMillis() - b.date.toMillis());
          return next;
        });
      } catch (e) {
        setLogs(prev);
        toast.error((e as Error).message ?? 'Failed to save weight');
      }
    },
    [uid, logs],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!uid) return;
      const prev = logs;
      setLogs((p) => p.filter((l) => l.id !== id));
      try {
        await deleteApi(uid, id);
      } catch (e) {
        setLogs(prev);
        toast.error((e as Error).message ?? 'Failed to delete weight log');
      }
    },
    [uid, logs],
  );

  return { logs, loading, upsert, remove };
}
