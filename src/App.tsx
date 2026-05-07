import { Route, Routes } from 'react-router-dom';
import { AuthGuard, AuthProvider } from '@/components/AuthGuard';
import { Layout } from '@/components/Layout';
import { LoginPage } from '@/features/auth/LoginPage';
import { Dashboard } from '@/features/dashboard/Dashboard';
import { WorkoutsList } from '@/features/workouts/WorkoutsList';
import { NewWorkout } from '@/features/workouts/NewWorkout';
import { SessionDetail } from '@/features/workouts/SessionDetail';
import { ExerciseLibrary } from '@/features/exercises/ExerciseLibrary';
import { WeightTracker } from '@/features/weight/WeightTracker';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <AuthGuard>
              <Layout />
            </AuthGuard>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="/workouts" element={<WorkoutsList />} />
          <Route path="/workouts/new" element={<NewWorkout />} />
          <Route path="/workouts/:id" element={<SessionDetail />} />
          <Route path="/exercises" element={<ExerciseLibrary />} />
          <Route path="/weight" element={<WeightTracker />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
