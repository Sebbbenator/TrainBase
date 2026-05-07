import type { Timestamp } from 'firebase/firestore';

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'core'
  | 'cardio';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  createdAt: Timestamp;
}

export interface WorkoutSession {
  id: string;
  date: Timestamp;
  notes: string;
  createdAt: Timestamp;
}

export interface WorkoutSet {
  id: string;
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  rpe: number | null;
  createdAt: Timestamp;
}

export interface WeightLog {
  id: string; // dateString YYYY-MM-DD
  weightKg: number;
  notes: string;
  date: Timestamp;
  createdAt: Timestamp;
}
