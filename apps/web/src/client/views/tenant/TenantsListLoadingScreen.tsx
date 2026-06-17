import { Skeleton } from "@repo/ui";

export const TenantsListSkeleton = () => (
  <div className="p-8 max-w-[1180px] space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-9 w-36" />
      <Skeleton className="h-4 w-48" />
    </div>
    <div className="rounded-xl border border-sand-400 bg-white overflow-hidden">
      <div className="bg-sand-100 px-5 py-3 flex gap-4">
        {[160, 140, 80, 100, 100].map((w, i) => (
          <Skeleton key={i} className={`h-3 w-[${w}px]`} />
        ))}
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="px-5 py-4 border-t border-sand-200 flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-full flex-none" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-3 w-24 ml-auto" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);
