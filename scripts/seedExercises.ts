/**
 * Seed common exercises into Firestore using Firebase Admin SDK.
 *
 * Setup:
 *   1. Download a service account key from Firebase Console → Project Settings → Service accounts
 *   2. Save it as `service-account.json` at the repo root (gitignored)
 *   3. Run: pnpm seed   (or `npm run seed`)
 */
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SERVICE_ACCOUNT_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ?? './service-account.json';

const serviceAccount = JSON.parse(readFileSync(resolve(SERVICE_ACCOUNT_PATH), 'utf-8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

type Seed = { name: string; muscleGroup: string };

const exercises: Seed[] = [
  // Chest
  { name: 'Bench Press', muscleGroup: 'chest' },
  { name: 'Incline Dumbbell Press', muscleGroup: 'chest' },
  { name: 'Push Up', muscleGroup: 'chest' },
  { name: 'Cable Fly', muscleGroup: 'chest' },
  // Back
  { name: 'Deadlift', muscleGroup: 'back' },
  { name: 'Pull Up', muscleGroup: 'back' },
  { name: 'Barbell Row', muscleGroup: 'back' },
  { name: 'Lat Pulldown', muscleGroup: 'back' },
  { name: 'Seated Cable Row', muscleGroup: 'back' },
  // Legs
  { name: 'Back Squat', muscleGroup: 'legs' },
  { name: 'Front Squat', muscleGroup: 'legs' },
  { name: 'Romanian Deadlift', muscleGroup: 'legs' },
  { name: 'Leg Press', muscleGroup: 'legs' },
  { name: 'Walking Lunge', muscleGroup: 'legs' },
  { name: 'Leg Curl', muscleGroup: 'legs' },
  { name: 'Calf Raise', muscleGroup: 'legs' },
  // Shoulders
  { name: 'Overhead Press', muscleGroup: 'shoulders' },
  { name: 'Dumbbell Shoulder Press', muscleGroup: 'shoulders' },
  { name: 'Lateral Raise', muscleGroup: 'shoulders' },
  { name: 'Face Pull', muscleGroup: 'shoulders' },
  // Biceps
  { name: 'Barbell Curl', muscleGroup: 'biceps' },
  { name: 'Hammer Curl', muscleGroup: 'biceps' },
  { name: 'Preacher Curl', muscleGroup: 'biceps' },
  // Triceps
  { name: 'Tricep Pushdown', muscleGroup: 'triceps' },
  { name: 'Skull Crusher', muscleGroup: 'triceps' },
  { name: 'Overhead Tricep Extension', muscleGroup: 'triceps' },
  // Core
  { name: 'Plank', muscleGroup: 'core' },
  { name: 'Hanging Leg Raise', muscleGroup: 'core' },
  { name: 'Cable Crunch', muscleGroup: 'core' },
  // Cardio
  { name: 'Treadmill Run', muscleGroup: 'cardio' },
  { name: 'Stationary Bike', muscleGroup: 'cardio' },
  { name: 'Rowing Machine', muscleGroup: 'cardio' },
];

async function main() {
  const col = db.collection('exercises');
  const existing = await col.get();
  const existingNames = new Set(existing.docs.map((d) => d.data().name as string));

  let added = 0;
  for (const ex of exercises) {
    if (existingNames.has(ex.name)) continue;
    await col.add({ ...ex, createdAt: Timestamp.now() });
    added += 1;
    console.log(`+ ${ex.name}`);
  }
  console.log(`\nDone. Added ${added} new exercises (${exercises.length - added} skipped as duplicates).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
