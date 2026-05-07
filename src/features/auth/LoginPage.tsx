import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/auth';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'At least 6 characters'),
});
type Form = z.infer<typeof schema>;

export function LoginPage() {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [submitting, setSubmitting] = useState(false);
  const { user, loading } = useAuthStore();
  const nav = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  if (!loading && user) return <Navigate to="/" replace />;

  const onSubmit = async (data: Form) => {
    setSubmitting(true);
    try {
      if (tab === 'login') {
        await signInWithEmailAndPassword(auth, data.email, data.password);
      } else {
        await createUserWithEmailAndPassword(auth, data.email, data.password);
      }
      nav('/');
    } catch (e) {
      toast.error((e as Error).message ?? 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-royal-500 shadow-[0_0_16px_3px_rgba(52,97,255,0.7)]" />
          <span className="font-display font-bold tracking-tight text-lg">TrainBase</span>
        </div>

        <div className="card-hero">
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {tab === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-sm text-paper-muted mt-1 mb-6">
            {tab === 'login' ? 'Sign in to continue training.' : 'Set up your personal log.'}
          </p>

          <div className="segmented w-full mb-6">
            {(['login', 'signup'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={clsx(
                  'segmented-item flex-1',
                  tab === t && 'segmented-item-active',
                )}
              >
                {t === 'login' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-red-400 mt-1.5">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-red-400 mt-1.5">{errors.password.message}</p>
              )}
            </div>
            <button className="btn-primary w-full" disabled={submitting}>
              {submitting ? '...' : tab === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
