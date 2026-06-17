import { Skeleton } from "@repo/ui";

export const PaymentHistoryTableSkeleton = () => (
  <div className="rounded-xl border border-sand-400 bg-white overflow-hidden">
    {[1, 2, 3].map((i) => (
      <div key={i} className="px-5 py-4 border-b border-sand-200 flex gap-4 items-center">
        {[70, 80, 80, 90, 100, 70].map((w, j) => (
          <Skeleton key={j} className={`h-3 w-[${w}px]`} />
        ))}
      </div>
    ))}
  </div>
);
