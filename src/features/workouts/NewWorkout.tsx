import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useWorkoutSessions } from '@/hooks/useWorkoutSessions';

function todayLocalIso() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function NewWorkout() {
  const { create } = useWorkoutSessions();
  const [date, setDate] = useState(todayLocalIso());
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const nav = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[NewWorkout] submitting', { date, notes });
    setSubmitting(true);
    try {
      const session = await Promise.race([
        create(new Date(date), notes),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timed out after 8s — Firestore is not responding. Check Firebase Console: is Firestore Database created? Are rules deployed?')), 8000),
        ),
      ]) as Awaited<ReturnType<typeof create>>;
      console.log('[NewWorkout] session created', session);
      toast.success('Session started');
      nav(`/workouts/${session.id}`);
    } catch (err) {
      console.error('[NewWorkout] create failed', err);
      const e = err as { code?: string; message?: string };
      toast.error(e.code ? `${e.code}: ${e.message ?? ''}` : e.message ?? 'Failed to create session');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">New session</h1>
        <p className="text-sm text-paper-muted mt-1">Log today's training.</p>
      </div>
      <form className="card-hero space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="label">Date</label>
          <input
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea
            className="input min-h-[96px] resize-none"
            placeholder="How are you feeling? Anything special about today's session?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <button className="btn-primary w-full" disabled={submitting}>
          {submitting ? 'Starting...' : 'Start session'}
        </button>
      </form>
    </div>
  );
}
