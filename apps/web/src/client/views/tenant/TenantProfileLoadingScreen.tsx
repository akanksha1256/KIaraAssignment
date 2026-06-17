import { Skeleton } from "@repo/ui";

export const TenantProfileSkeleton = () => (
  <div className="p-8 max-w-[1180px] space-y-8">
    <Skeleton className="h-4 w-28" />
    <div className="space-y-2">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-4 w-32" />
    </div>
    <div className="grid grid-cols-5 gap-5">
      <div className="col-span-3 rounded-xl border border-sand-400 bg-white p-5 space-y-3">
        <Skeleton className="h-4 w-28" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </div>
      <div className="col-span-2 rounded-xl border border-sand-400 bg-white p-5 space-y-3">
        <Skeleton className="h-4 w-24" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </div>
    </div>
    <div className="rounded-xl border border-sand-400 bg-white overflow-hidden">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="px-5 py-4 border-b border-sand-200 flex gap-4 items-center">
          {[70, 80, 80, 90, 100, 70].map((w, j) => (
            <Skeleton key={j} className={`h-3 w-[${w}px]`} />
          ))}
        </div>
      ))}
    </div>
  </div>
);
