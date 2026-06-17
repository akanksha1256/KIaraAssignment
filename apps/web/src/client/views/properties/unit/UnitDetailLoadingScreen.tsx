import { Skeleton } from "@repo/ui";

export const UnitDetailSkeleton = () => (
  <div className="p-8 max-w-[1180px] space-y-8">
    <Skeleton className="h-4 w-28" />
    <div className="flex items-center justify-between">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-6 w-24 rounded-full" />
    </div>
    <div className="flex gap-5">
      <div className="w-[35%] rounded-xl border border-sand-400 bg-white p-5 space-y-3">
        <Skeleton className="h-4 w-24" />
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </div>
      <div className="flex-1 rounded-xl border border-sand-400 bg-white p-5 space-y-3">
        <Skeleton className="h-4 w-24" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </div>
    </div>
    <div className="rounded-xl border border-sand-400 bg-white overflow-hidden">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="px-5 py-4 border-b border-sand-200 flex gap-4 items-center">
          {[70, 80, 80, 90, 100, 70, 40].map((w, j) => (
            <Skeleton key={j} className={`h-3 w-[${w}px]`} />
          ))}
        </div>
      ))}
    </div>
  </div>
);
