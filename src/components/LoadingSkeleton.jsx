export function CardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden animate-pulse">
      <div className="aspect-video bg-secondary" />
      <div className="p-6 space-y-3">
        <div className="h-6 bg-secondary rounded w-2/3" />
        <div className="h-4 bg-secondary rounded w-1/2" />
      </div>
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-card rounded-xl border border-border p-4 animate-pulse">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-secondary rounded w-1/3" />
              <div className="h-4 bg-secondary rounded w-1/2" />
            </div>
            <div className="w-8 h-8 bg-secondary rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse">
          <div className="h-10 w-10 bg-secondary rounded-lg mb-3" />
          <div className="h-8 bg-secondary rounded w-2/3 mb-2" />
          <div className="h-4 bg-secondary rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}