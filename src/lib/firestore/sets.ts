import {
  collection,
  collectionGroup,
  addDoc,
  arrayUnion,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { MuscleGroup, WorkoutSet } from '@/types';

const setsCol = (uid: string, sessionId: string) =>
  collection(db, 'users', uid, 'workoutSessions', sessionId, 'sets');

export function subscribeSets(
  uid: string,
  sessionId: string,
  onData: (sets: WorkoutSet[]) => void,
  onError: (e: Error) => void,
): Unsubscribe {
  const q = query(setsCol(uid, sessionId), orderBy('createdAt', 'asc'));
  return onSnapshot(
    q,
    (snap) =>
      onData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WorkoutSet, 'id'>) }))),
    onError,
  );
}

export interface SetInput {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
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
  await updateDoc(doc(db, 'users', uid, 'workoutSessions', sessionId), {
    muscleGroups: arrayUnion(input.muscleGroup),
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
  const remaining = await getDocs(setsCol(uid, sessionId));
  const muscleGroups = [
    ...new Set(
      remaining.docs
        .map((d) => (d.data() as WorkoutSet).muscleGroup)
        .filter(Boolean) as MuscleGroup[],
    ),
  ];
  await updateDoc(doc(db, 'users', uid, 'workoutSessions', sessionId), { muscleGroups });
}

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
  return snap.docs
    .filter((d) => d.ref.path.startsWith(`users/${uid}/`))
    .map((d) => ({ id: d.id, ...(d.data() as Omit<WorkoutSet, 'id'>) }));
}

export async function listAllSets(uid: string): Promise<WorkoutSet[]> {
  const snap = await getDocs(collectionGroup(db, 'sets'));
  return snap.docs
    .filter((d) => d.ref.path.startsWith(`users/${uid}/`))
    .map((d) => ({ id: d.id, ...(d.data() as Omit<WorkoutSet, 'id'>) }));
}
