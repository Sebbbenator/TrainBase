# TrainBase

Personal fitness tracker — workouts (sets/reps) and body weight progress. React + Vite + Firebase.

## Setup

```bash
npm install
cp .env.example .env   # fill in your Firebase web config
npm run dev
```

## Firebase

1. Create a project at https://console.firebase.google.com
2. Enable **Authentication → Email/Password**.
3. Enable **Firestore** (in Native mode).
4. Copy your web app config into `.env` (vars listed in `.env.example`).
5. Recommended Firestore security rules (single-user app):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /exercises/{doc=**} {
      allow read, write: if request.auth != null;
    }
    match /users/{uid}/{doc=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

6. Deploy a composite index for the exercise-history sparkline:
   - Collection group: `sets`
   - Fields: `exerciseId` (asc), `createdAt` (asc)
   Firestore will print a one-click link the first time the query runs.

## Seed exercises

```bash
# Download a service account key and save it to ./service-account.json
npm run seed
```

## Stack

- React 18 + Vite + TypeScript
- Firebase Auth + Firestore (with persistent local cache)
- Zustand (auth/session state)
- React Hook Form + Zod
- Recharts
- React Router v6
- Tailwind CSS
- react-hot-toast
