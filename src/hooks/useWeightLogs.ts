import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import {
  deleteWeightLog as deleteApi,
  upsertWeightLog as upsertApi,
} from '@/lib/firestore/weightLogs';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/auth';
import type { WeightLog } from '@/types';

export function useWeightLogs() {
  const uid = useAuthStore((s) => s.user?.uid);
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    const q = query(collection(db, 'users', uid, 'weightLogs'), orderBy('date', 'asc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setLogs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WeightLog, 'id'>) })));
        setLoading(false);
      },
      (e) => toast.error(e.message ?? 'Failed to load weight logs'),
    );
    return unsub;
  }, [uid]);

  const upsert = useCallback(
    async (date: Date, weightKg: number, notes: string) => {
      if (!uid) return;
      try {
        await upsertApi(uid, date, weightKg, notes);
      } catch (e) {
        toast.error((e as Error).message ?? 'Failed to save weight');
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
        toast.error((e as Error).message ?? 'Failed to delete weight log');
      }
    },
    [uid],
  );

  return { logs, loading, upsert, remove };
}
