import { useEffect, type ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Navigate, useLocation } from 'react-router-dom';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/auth';
import { Skeleton } from './Skeleton';

export function AuthProvider({ children }: { children: ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, [setUser, setLoading]);
  return <>{children}</>;
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthStore();
  const location = useLocation();
  if (loading) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}
