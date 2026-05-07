import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Exercise, MuscleGroup } from '@/types';

const col = () => collection(db, 'exercises');

export async function listExercises(): Promise<Exercise[]> {
  const snap = await getDocs(query(col(), orderBy('name')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Exercise, 'id'>) }));
}

export async function createExercise(name: string, muscleGroup: MuscleGroup): Promise<Exercise> {
  const ref = await addDoc(col(), {
    name: name.trim(),
    muscleGroup,
    createdAt: serverTimestamp(),
  });
  return {
    id: ref.id,
    name: name.trim(),
    muscleGroup,
    createdAt: Timestamp.now(),
  };
}

export async function deleteExercise(id: string): Promise<void> {
  await deleteDoc(doc(db, 'exercises', id));
}
