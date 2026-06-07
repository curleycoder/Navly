import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('skeleton', className)}
    />
  )
}

export function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10" aria-busy="true" aria-label="Loading dashboard">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-72" />
        </div>
        <Skeleton className="h-5 w-28" />
      </div>

      {/* Profile summary cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-subtle bg-surface-card p-5">
          <Skeleton className="mb-2 h-4 w-28" />
          <Skeleton className="h-6 w-44" />
        </div>
        <div className="rounded-2xl border border-subtle bg-surface-card p-5">
          <Skeleton className="mb-2 h-4 w-20" />
          <Skeleton className="h-6 w-36" />
        </div>
      </div>

      {/* Score tracker placeholder */}
      <div className="mb-8 rounded-3xl border border-subtle bg-surface-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="flex flex-col items-center gap-4 lg:w-[350px]">
            <Skeleton className="h-48 w-48 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-subtle p-4">
                <Skeleton className="mb-3 h-4 w-28" />
                <Skeleton className="mb-2 h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <Skeleton className="mb-4 h-4 w-28" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-subtle bg-surface-card p-5">
              <div className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
