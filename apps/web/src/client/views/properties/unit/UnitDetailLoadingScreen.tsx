import { Skeleton } from "@repo/ui";
import { PaymentHistoryTableSkeleton } from "@/client/views/payments/PaymentHistoryTableLoadingScreen";

const CardRow = ({ labelCls, valueCls }: { labelCls: string; valueCls: string }) => (
  <div className="flex justify-between items-center py-3 border-b border-sand-200 last:border-0">
    <Skeleton className={labelCls} />
    <Skeleton className={valueCls} />
  </div>
);

export const UnitDetailSkeleton = () => (
  <div className="p-8 max-w-[1180px]">
    {/* Back button */}
    <Skeleton className="h-3.5 w-24 mb-6" />

    {/* Header: unit label + property name / status badge */}
    <div className="flex items-center justify-between mb-8">
      <div className="space-y-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-3.5 w-32" />
      </div>
      <Skeleton className="h-8 w-24 rounded-full" />
    </div>

    {/* Info cards */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">

      {/* TenantCard */}
      <div className="rounded-xl border border-sand-400 bg-white">
        <div className="flex items-center gap-2 p-6">
          <Skeleton className="w-8 h-8 rounded-full flex-none" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="px-6 pb-6">
          <CardRow labelCls="h-3 w-12" valueCls="h-3 w-28" />
          <CardRow labelCls="h-3 w-12" valueCls="h-3 w-40" />
          <CardRow labelCls="h-3 w-16" valueCls="h-3 w-24" />
          <div className="pt-3">
            <Skeleton className="h-3.5 w-24" />
          </div>
        </div>
      </div>

      {/* ManagerLeaseCard */}
      <div className="rounded-xl border border-sand-400 bg-white">
        <div className="flex items-center gap-2 p-6">
          <Skeleton className="w-8 h-8 rounded-full flex-none" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="px-6 pb-6">
          <CardRow labelCls="h-3 w-24" valueCls="h-3 w-20" />
          <CardRow labelCls="h-3 w-20" valueCls="h-3 w-36" />
          <CardRow labelCls="h-3 w-12" valueCls="h-3 w-28" />
          <CardRow labelCls="h-3 w-28" valueCls="h-3 w-16" />
        </div>
      </div>
    </div>

    {/* Payment history */}
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-36" />
      </div>
      <PaymentHistoryTableSkeleton withActions />
    </div>
  </div>
);
