interface Props {
  className?: string;
}
export function Skeleton({ className = 'h-4 w-full' }: Props) {
  return <div className={`skeleton ${className}`} />;
}

export function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}
