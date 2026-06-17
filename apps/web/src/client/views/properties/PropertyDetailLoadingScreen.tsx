import { Skeleton } from "@repo/ui";

export const PropertyDetailSkeleton = () => (
  <div className="p-8 max-w-[1180px] space-y-8">
    <Skeleton className="h-4 w-28" />
    <div className="space-y-2">
      <Skeleton className="h-9 w-72" />
      <Skeleton className="h-4 w-52" />
    </div>
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
    <div className="rounded-xl border border-sand-400 bg-white p-5 space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-3 w-full rounded-full" />
      <div className="flex gap-4">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-3 w-20" />)}
      </div>
    </div>
    <div className="rounded-xl border border-sand-400 bg-white overflow-hidden">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="px-5 py-4 border-b border-sand-200 flex gap-4 items-center">
          {[60, 120, 80, 140, 70, 80].map((w, j) => (
            <Skeleton key={j} className={`h-3 w-[${w}px]`} />
          ))}
        </div>
      ))}
    </div>
  </div>
);
