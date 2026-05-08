import { useEffect, useState } from 'react';
import { listAllSets } from '@/lib/firestore/sets';
import { useAuthStore } from '@/store/auth';

export function usePRs() {
  const uid = useAuthStore((s) => s.user?.uid);
  const [prs, setPrs] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    listAllSets(uid)
      .then((sets) => {
        if (cancelled) return;
        const map = new Map<string, number>();
        for (const s of sets) {
          const cur = map.get(s.exerciseId) ?? 0;
          if (s.weightKg > cur) map.set(s.exerciseId, s.weightKg);
        }
        setPrs(map);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [uid]);

  return prs;
}
