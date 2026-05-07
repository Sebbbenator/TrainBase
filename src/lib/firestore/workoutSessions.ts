import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { WorkoutSession } from '@/types';

const col = (uid: string) => collection(db, 'users', uid, 'workoutSessions');

export async function listSessions(uid: string): Promise<WorkoutSession[]> {
  const snap = await getDocs(query(col(uid), orderBy('date', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WorkoutSession, 'id'>) }));
}

export async function getSession(uid: string, id: string): Promise<WorkoutSession | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'workoutSessions', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<WorkoutSession, 'id'>) };
}

export async function createSession(
  uid: string,
  date: Date,
  notes: string,
): Promise<WorkoutSession> {
  const dateTs = Timestamp.fromDate(date);
  const ref = await addDoc(col(uid), {
    date: dateTs,
    notes,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, date: dateTs, notes, createdAt: Timestamp.now() };
}

export async function updateSession(
  uid: string,
  id: string,
  patch: Partial<Pick<WorkoutSession, 'notes' | 'date'>>,
): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'workoutSessions', id), patch);
}

export async function deleteSession(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'workoutSessions', id));
}
