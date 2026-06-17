import { Skeleton } from "@repo/ui";

export const TenantDashboardSkeleton = () => (
  <div className="p-8 max-w-[1180px] mx-auto space-y-8">
    <div className="space-y-2">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-4 w-36" />
    </div>
    <div className="rounded-xl border border-sand-400 bg-white p-6 space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-10 w-36" />
      <Skeleton className="h-4 w-48" />
    </div>
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-sand-400 bg-white p-5 space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </div>
    <div className="rounded-xl border border-sand-400 bg-white overflow-hidden">
      {[1, 2, 3].map((i) => (
        <div key={i} className="px-5 py-4 border-b border-sand-200 flex gap-4 items-center">
          {[70, 80, 80, 90, 100, 70, 80].map((w, j) => (
            <Skeleton key={j} className={`h-3 w-[${w}px]`} />
          ))}
        </div>
      ))}
    </div>
  </div>
);
