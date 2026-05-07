import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { Home, Dumbbell, ClipboardList, Scale, type LucideIcon } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/auth';
import clsx from 'clsx';

const tabs: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/workouts', label: 'Workouts', icon: Dumbbell },
  { to: '/exercises', label: 'Exercises', icon: ClipboardList },
  { to: '/weight', label: 'Weight', icon: Scale },
];

export function Layout() {
  const user = useAuthStore((s) => s.user);
  const nav = useNavigate();

  const onLogout = async () => {
    await signOut(auth);
    nav('/login');
  };

  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-10 bg-ink-950/80 backdrop-blur-xl border-b border-ink-800/60">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-royal-500 shadow-[0_0_12px_2px_rgba(52,97,255,0.6)]" />
            <span className="font-display font-bold tracking-tight text-[15px]">
              TrainBase
            </span>
          </div>
          {user && (
            <button
              onClick={onLogout}
              className="text-[11px] uppercase tracking-[0.12em] text-paper-muted hover:text-paper transition"
            >
              Sign out
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-5 pb-28">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-10 pb-3 px-4 pointer-events-none">
        <div className="max-w-md mx-auto rounded-2xl bg-ink-800/85 backdrop-blur-xl border border-ink-700/80 shadow-soft pointer-events-auto">
          <div className="grid grid-cols-4">
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.to === '/'}
                className={({ isActive }) =>
                  clsx(
                    'group flex flex-col items-center py-2.5 text-[10px] uppercase tracking-[0.1em] font-medium transition relative',
                    isActive ? 'text-royal-400' : 'text-paper-dim hover:text-paper-muted',
                  )
                }
              >
                {({ isActive }) => {
                  const Icon = t.icon;
                  return (
                    <>
                      <Icon
                        size={20}
                        strokeWidth={2}
                        className={clsx(
                          'transition mb-1',
                          isActive && 'drop-shadow-[0_0_8px_rgba(91,139,255,0.7)]',
                        )}
                      />
                      <span>{t.label}</span>
                      {isActive && (
                        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-royal-400" />
                      )}
                    </>
                  );
                }}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
