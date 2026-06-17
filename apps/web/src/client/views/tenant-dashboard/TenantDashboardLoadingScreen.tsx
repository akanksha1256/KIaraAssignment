import { Skeleton } from "@repo/ui";
import { PaymentHistoryTableSkeleton } from "@/client/views/payments/PaymentHistoryTableLoadingScreen";

const CardRow = ({ labelCls, valueCls }: { labelCls: string; valueCls: string }) => (
  <div className="flex justify-between items-center py-2.5 border-b border-neutral-100 last:border-0">
    <Skeleton className={labelCls} />
    <Skeleton className={valueCls} />
  </div>
);

const InfoCard = ({
  titleCls,
  children,
}: {
  titleCls: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-xl border border-sand-400 bg-white">
    <div className="flex items-center gap-2 p-6">
      <Skeleton className="h-4 w-4 rounded flex-none" />
      <Skeleton className={titleCls} />
    </div>
    <div className="px-6 pb-6">{children}</div>
  </div>
);

export const TenantDashboardSkeleton = () => (
  <div className="p-8 max-w-[1180px] mx-auto">
    {/* Page header */}
    <div className="mb-8">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-3.5 w-48 mt-2" />
    </div>

    {/* Hero: payment due card */}
    <div className="rounded-xl border border-sand-300 bg-white overflow-hidden mb-6">
      <div className="p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <Skeleton className="h-3 w-20 mb-3" />
          <Skeleton className="h-11 w-36 mb-3" />
          <Skeleton className="h-3.5 w-48" />
        </div>
        <Skeleton className="h-10 w-36 rounded-full lg:flex-none" />
      </div>
    </div>

    {/* Info cards: Property (3 rows), Manager (3 rows), Lease (4 rows) */}
    <div className="grid gap-4 lg:grid-cols-3 mb-8">
      <InfoCard titleCls="h-4 w-28">
        <CardRow labelCls="h-3 w-12" valueCls="h-3 w-28" />
        <CardRow labelCls="h-3 w-8" valueCls="h-3 w-12" />
        <CardRow labelCls="h-3 w-16" valueCls="h-3 w-40" />
      </InfoCard>
      <InfoCard titleCls="h-4 w-24">
        <CardRow labelCls="h-3 w-12" valueCls="h-3 w-24" />
        <CardRow labelCls="h-3 w-12" valueCls="h-3 w-36" />
        <CardRow labelCls="h-3 w-16" valueCls="h-3 w-24" />
      </InfoCard>
      <InfoCard titleCls="h-4 w-20">
        <CardRow labelCls="h-3 w-24" valueCls="h-3 w-20" />
        <CardRow labelCls="h-3 w-20" valueCls="h-3 w-36" />
        <CardRow labelCls="h-3 w-12" valueCls="h-3 w-28" />
        <CardRow labelCls="h-3 w-28" valueCls="h-3 w-16" />
      </InfoCard>
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
