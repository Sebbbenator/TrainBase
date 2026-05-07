import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { WeightLog } from '@/types';

const col = (uid: string) => collection(db, 'users', uid, 'weightLogs');

export function formatDateId(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function listWeightLogs(uid: string): Promise<WeightLog[]> {
  const snap = await getDocs(query(col(uid), orderBy('date', 'asc')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WeightLog, 'id'>) }));
}

export async function upsertWeightLog(
  uid: string,
  date: Date,
  weightKg: number,
  notes: string,
): Promise<WeightLog> {
  const id = formatDateId(date);
  const dateTs = Timestamp.fromDate(date);
  const ref = doc(db, 'users', uid, 'weightLogs', id);
  await setDoc(
    ref,
    { weightKg, notes, date: dateTs, createdAt: serverTimestamp() },
    { merge: true },
  );
  return { id, weightKg, notes, date: dateTs, createdAt: Timestamp.now() };
}

export async function deleteWeightLog(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'weightLogs', id));
}
