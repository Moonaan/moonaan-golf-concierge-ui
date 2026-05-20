// ============================================================
// LoadingSkeleton — Shimmer skeleton loaders for all card types
// ============================================================

function Shimmer({ className = '' }: { className?: string }) {
  return (
    <div className={`skeleton-shimmer rounded ${className}`} />
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Shimmer className="h-48 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Shimmer className="h-6 w-3/4" />
        <Shimmer className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Shimmer className="h-5 w-16 rounded-full" />
          <Shimmer className="h-5 w-20 rounded-full" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <Shimmer className="h-6 w-24" />
          <Shimmer className="h-10 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function BookingCardSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex justify-between">
        <Shimmer className="h-6 w-48" />
        <Shimmer className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex gap-4">
        <Shimmer className="h-4 w-32" />
        <Shimmer className="h-4 w-24" />
        <Shimmer className="h-4 w-28" />
      </div>
      <Shimmer className="h-4 w-40" />
      <div className="flex gap-2 pt-2">
        <Shimmer className="h-10 w-32 rounded-lg" />
        <Shimmer className="h-10 w-28 rounded-lg" />
      </div>
    </div>
  );
}

export function AvailabilityGridSkeleton() {
  return (
    <div className="space-y-3">
      <Shimmer className="h-5 w-32" />
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <Shimmer key={i} className="h-12 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function CourseListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="page-container py-12 space-y-6">
      <Shimmer className="h-10 w-64" />
      <Shimmer className="h-5 w-96" />
      <CourseListSkeleton />
    </div>
  );
}
