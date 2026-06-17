import { Skeleton } from "@repo/ui";
import { PaymentHistoryTableSkeleton } from "@/client/views/payments/PaymentHistoryTableLoadingScreen";

const CardRow = ({ labelCls, valueCls }: { labelCls: string; valueCls: string }) => (
  <div className="flex justify-between items-center py-3 border-b border-sand-200 last:border-0">
    <Skeleton className={labelCls} />
    <Skeleton className={valueCls} />
  </div>
);

export const TenantProfileSkeleton = () => (
  <div className="p-8 max-w-[1180px]">
    {/* Back button */}
    <Skeleton className="h-3.5 w-24 mb-6" />

    {/* Header: Avatar + name/email */}
    <div className="flex items-center gap-5 mb-8">
      <Skeleton className="w-14 h-14 rounded-full flex-none" />
      <div className="space-y-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-3.5 w-48" />
      </div>
    </div>

    {/* Info cards */}
    <div className="grid gap-5 lg:grid-cols-5 mb-8">

      {/* TenantInfoCard - col-span-3 */}
      <div className="lg:col-span-3 rounded-xl border border-sand-400 bg-white">
        <div className="flex items-center gap-2 p-6">
          <Skeleton className="w-8 h-8 rounded-full flex-none" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* Rows: Name, Email, Contact, KYC Status, KYC Document */}
            <div className="lg:col-span-3">
              <CardRow labelCls="h-3 w-12" valueCls="h-3 w-28" />
              <CardRow labelCls="h-3 w-12" valueCls="h-3 w-40" />
              <CardRow labelCls="h-3 w-16" valueCls="h-3 w-24" />
              <CardRow labelCls="h-3 w-20" valueCls="h-3 w-20" />
              <CardRow labelCls="h-3 w-24" valueCls="h-3 w-16" />
            </div>
            {/* ScoreRing */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center gap-3">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="w-[120px] h-[120px] rounded-full" />
              <div className="flex flex-col items-center gap-1.5">
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TenantCurrentLeaseCard - col-span-2 */}
      <div className="lg:col-span-2 rounded-xl border border-sand-400 bg-white">
        <div className="flex items-center gap-2 p-6">
          <Skeleton className="w-8 h-8 rounded-full flex-none" />
          <Skeleton className="h-4 w-28" />
        </div>
        {/* Property, Unit, Monthly Rent, Lease Date, Lease Document */}
        <div className="px-6 pb-6">
          <CardRow labelCls="h-3 w-16" valueCls="h-3 w-32" />
          <CardRow labelCls="h-3 w-10" valueCls="h-3 w-16" />
          <CardRow labelCls="h-3 w-24" valueCls="h-3 w-20" />
          <CardRow labelCls="h-3 w-20" valueCls="h-3 w-36" />
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
      <PaymentHistoryTableSkeleton />
    </div>
  </div>
);
