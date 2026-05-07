import { Link } from 'react-router-dom';
import { format, isToday } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { useWorkoutSessions } from '@/hooks/useWorkoutSessions';
import { useWeightLogs } from '@/hooks/useWeightLogs';
import { Skeleton } from '@/components/Skeleton';
import { Stat } from '@/components/Stat';
import { formatDateId } from '@/lib/firestore/weightLogs';
import { RoyalAreaGradient, ROYAL_GRADIENT_ID } from '@/lib/chartTheme';

export function Dashboard() {
  const { sessions, loading: sessionsLoading } = useWorkoutSessions();
  const { logs, loading: logsLoading } = useWeightLogs();

  const todayId = formatDateId(new Date());
  const todayWeight = logs.find((l) => l.id === todayId);
  const todaySession = sessions.find((s) => isToday(s.date.toDate()));
  const lastSession = sessions[0];

  const recent7 = [...logs]
    .sort((a, b) => a.date.toMillis() - b.date.toMillis())
    .slice(-7)
    .map((l) => ({ v: l.weightKg }));

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{greeting}</h1>
        <p className="text-sm text-paper-muted mt-1">
          {format(new Date(), 'EEEE · MMMM d')}
        </p>
      </div>

      {/* Today's weight hero card */}
      <Link to="/weight" className="block">
        <div className="card-hero relative overflow-hidden">
          <div className="flex items-start justify-between mb-4">
            <span className="text-[11px] uppercase tracking-[0.14em] text-paper-muted font-medium">
              Today's weight
            </span>
            <span className="chip">
              {todayWeight ? 'Logged' : 'Not logged'}
            </span>
          </div>

          {logsLoading ? (
            <Skeleton className="h-16 w-40" />
          ) : todayWeight ? (
            <Stat
              value={todayWeight.weightKg.toFixed(1)}
              unit="kg"
              size="hero"
            />
          ) : (
            <div>
              <Stat value="—" unit="kg" size="hero" />
              <p className="text-sm text-paper-muted mt-3">Tap to log today's weight.</p>
            </div>
          )}

          {recent7.length >= 2 && (
            <div className="absolute bottom-0 inset-x-0 h-16 opacity-80 pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={recent7} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <RoyalAreaGradient />
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="#3461ff"
                    strokeWidth={2}
                    fill={`url(#${ROYAL_GRADIENT_ID})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </Link>

      {/* Today's workout */}
      <div className="card">
        <div className="flex items-start justify-between mb-3">
          <span className="text-[11px] uppercase tracking-[0.14em] text-paper-muted font-medium">
            Today's workout
          </span>
          <span className={`chip ${todaySession ? 'chip-active' : ''}`}>
            {todaySession ? 'In progress' : 'Not started'}
          </span>
        </div>

        {sessionsLoading ? (
          <Skeleton className="h-10 w-3/4" />
        ) : todaySession ? (
          <>
            <div className="font-display text-2xl font-bold tracking-tight">
              Session in progress
            </div>
            {todaySession.notes && (
              <p className="text-sm text-paper-muted mt-1.5">{todaySession.notes}</p>
            )}
            <Link
              to={`/workouts/${todaySession.id}`}
              className="btn-primary mt-4 w-full gap-2"
            >
              Open session
              <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          </>
        ) : (
          <>
            <div className="font-display text-2xl font-bold tracking-tight">
              Ready when you are
            </div>
            {lastSession && (
              <p className="text-sm text-paper-muted mt-1.5">
                Last session{' '}
                <span className="text-paper">
                  {format(lastSession.date.toDate(), 'EEE, MMM d')}
                </span>
              </p>
            )}
            <Link to="/workouts/new" className="btn-primary mt-4 w-full">
              Start a session
            </Link>
          </>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <Stat
            value={sessionsLoading ? '—' : sessions.length}
            label="Total sessions"
            size="md"
          />
        </div>
        <div className="card">
          <Stat
            value={logsLoading ? '—' : logs.length}
            label="Weight entries"
            size="md"
          />
        </div>
      </div>
    </div>
  );
}
