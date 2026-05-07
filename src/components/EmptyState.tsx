import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
  title: string;
  description?: string;
  cta?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, cta, icon }: Props) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-4">
      <div className="relative mb-5">
        <div className="absolute inset-0 bg-royal-500/10 border border-royal-500/30 rounded-full blur-sm" />
        <div className="relative w-16 h-16 rounded-full bg-royal-500/10 border border-royal-500/30 flex items-center justify-center text-royal-400">
          {icon ?? <Sparkles size={24} strokeWidth={2} />}
        </div>
      </div>
      <h3 className="text-lg font-display font-bold tracking-tight text-paper">{title}</h3>
      {description && (
        <p className="text-sm text-paper-muted mt-2 max-w-sm">{description}</p>
      )}
      {cta && <div className="mt-5">{cta}</div>}
    </div>
  );
}
