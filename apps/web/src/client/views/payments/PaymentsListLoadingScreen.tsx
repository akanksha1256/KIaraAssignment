import { Skeleton } from "@repo/ui";

export const PaymentsListSkeleton = () => (
  <div className="p-8 max-w-[1180px] space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-4 w-56" />
    </div>
    <div className="rounded-xl border border-sand-400 bg-white overflow-hidden">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="px-5 py-4 border-t border-sand-200 first:border-t-0 flex items-center gap-4">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-16 ml-auto" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-6 w-6 rounded" />
        </div>
      ))}
    </div>
  </div>
);
