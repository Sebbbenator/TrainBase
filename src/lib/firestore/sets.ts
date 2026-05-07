import {
  collection,
  collectionGroup,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { WorkoutSet } from '@/types';

const setsCol = (uid: string, sessionId: string) =>
  collection(db, 'users', uid, 'workoutSessions', sessionId, 'sets');

export async function listSets(uid: string, sessionId: string): Promise<WorkoutSet[]> {
  const snap = await getDocs(query(setsCol(uid, sessionId), orderBy('createdAt', 'asc')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WorkoutSet, 'id'>) }));
}

export interface SetInput {
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  rpe: number | null;
}

export async function createSet(
  uid: string,
  sessionId: string,
  input: SetInput,
): Promise<WorkoutSet> {
  const ref = await addDoc(setsCol(uid, sessionId), {
    ...input,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, ...input, createdAt: Timestamp.now() };
}

export async function updateSet(
  uid: string,
  sessionId: string,
  setId: string,
  patch: Partial<SetInput>,
): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'workoutSessions', sessionId, 'sets', setId), patch);
}

export async function deleteSet(uid: string, sessionId: string, setId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'workoutSessions', sessionId, 'sets', setId));
}

/**
 * Cross-session query: find all sets for a given exercise (used for sparkline history).
 * Requires a Firestore composite index on (exerciseId asc, createdAt asc) for the
 * `sets` collection group; Firestore will prompt to create it on first run.
 */
export async function listSetsByExercise(
  uid: string,
  exerciseId: string,
): Promise<WorkoutSet[]> {
  const snap = await getDocs(
    query(
      collectionGroup(db, 'sets'),
      where('exerciseId', '==', exerciseId),
      orderBy('createdAt', 'asc'),
    ),
  );
  // Filter to only this user's sets (collectionGroup spans all users)
  return snap.docs
    .filter((d) => d.ref.path.startsWith(`users/${uid}/`))
    .map((d) => ({ id: d.id, ...(d.data() as Omit<WorkoutSet, 'id'>) }));
}
