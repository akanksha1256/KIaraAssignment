import { Skeleton } from "@repo/ui";

// Dashboard skeleton - mirrors the actual layout
export const ManagerDashboardSkeleton = () => {
  return (
    <div className="space-y-6 p-4 md:p-8 max-w-[1180px]">
      {/* Page header */}
      <div className="mb-8">
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Attention hero — stacks on mobile, side-by-side on md+ */}
      <div className="rounded-xl border border-sand-400 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-px bg-sand-400">
        <div className="bg-white p-5 md:p-6 space-y-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-10 w-40 md:w-48" />
          <Skeleton className="h-4 w-full max-w-[260px]" />
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-12 flex-1 rounded-lg" />
            <Skeleton className="h-12 flex-1 rounded-lg" />
          </div>
        </div>
        <div className="bg-white p-5 md:p-6 space-y-3">
          <Skeleton className="h-3 w-24" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center pt-3 border-t border-sand-200">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-2.5 w-36" />
              </div>
              <div className="flex flex-col items-end space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-2.5 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stat cards — 2 cols on mobile, 4 on lg+ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Charts — stacked on mobile, side-by-side on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-4">
        <div className="rounded-xl border border-sand-400 bg-white p-5 md:p-6 space-y-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-48 md:h-[200px] w-full rounded-lg" />
        </div>
        <div className="rounded-xl border border-sand-400 bg-white p-5 md:p-6 space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-36 w-36 md:h-40 md:w-40 rounded-full mx-auto" />
        </div>
      </div>

      {/* Properties link button */}
      <Skeleton className="h-[60px] w-full rounded-xl" />
    </div>
  );
};

export const LoadingState = ({ message: _message }: { message?: string }) => (
  <div className="flex flex-col gap-3 py-10 px-6 max-w-xs mx-auto">
    <Skeleton className="h-4 w-48" />
    <Skeleton className="h-3 w-64" />
    <Skeleton className="h-3 w-40" />
  </div>
);
