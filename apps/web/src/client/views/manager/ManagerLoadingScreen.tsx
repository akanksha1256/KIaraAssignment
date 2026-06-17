import { Skeleton } from "@repo/ui";

// Dashboard skeleton — mirrors the actual layout
export const ManagerDashboardSkeleton = () => {
  return (
    <div className="space-y-6 p-8">
      {/* Attention hero */}
      <div className="rounded-xl border border-sand-400 overflow-hidden h-[220px] grid grid-cols-2 gap-px bg-sand-400">
        <div className="bg-white p-6 space-y-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-64" />
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-12 flex-1 rounded-lg" />
            <Skeleton className="h-12 flex-1 rounded-lg" />
          </div>
        </div>
        <div className="bg-white p-6 space-y-4">
          <Skeleton className="h-3 w-24" />
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex justify-between items-center pt-3 border-t border-sand-200"
            >
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-2.5 w-36" />
              </div>
              <div className="space-y-1.5 items-end flex flex-col">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-2.5 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-sand-400 bg-white p-5 space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-[1.5fr_1fr] gap-4">
        <div className="rounded-xl border border-sand-400 bg-white p-6 space-y-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </div>
        <div className="rounded-xl border border-sand-400 bg-white p-6 space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-[160px] w-[160px] rounded-full mx-auto" />
        </div>
      </div>
      {/* Table */}
      <div className="rounded-xl border border-sand-400 bg-white overflow-hidden">
        <div className="bg-sand-100 px-5 py-3 flex gap-4">
          {[120, 80, 160, 60, 80, 100].map((w, i) => (
            <Skeleton key={i} className={`h-3 w-[${w}px]`} />
          ))}
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="px-5 py-4 border-b border-sand-200 flex gap-4 items-center">
            {[120, 80, 200, 60, 80, 100].map((w, j) => (
              <Skeleton key={j} className={`h-3 w-[${w}px]`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const LoadingState = ({ message = "Loading..." }: { message?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
      <div className="w-6 h-6 rounded-full border-2 border-coral-500 border-t-transparent animate-spin" />
      <p className="text-[14px]">{message}</p>
    </div>
  );
};
