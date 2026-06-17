import { Skeleton } from "@repo/ui";
import { PaymentHistoryTableSkeleton } from "@/client/views/payments/PaymentHistoryTableLoadingScreen";

const CardRow = ({ labelWidth, valueWidth }: { labelWidth: string; valueWidth: string }) => (
  <div className="flex justify-between items-center py-2.5 border-b border-neutral-100 last:border-0">
    <Skeleton className={`h-3 ${labelWidth}`} />
    <Skeleton className={`h-3 ${valueWidth}`} />
  </div>
);

const InfoCard = ({
  titleWidth,
  rows,
}: {
  titleWidth: string;
  rows: [string, string][];
}) => (
  <div className="rounded-xl border border-sand-400 bg-white">
    <div className="flex items-center gap-2 p-6">
      <Skeleton className="h-4 w-4 rounded flex-none" />
      <Skeleton className={`h-4 ${titleWidth}`} />
    </div>
    <div className="px-6 pb-6">
      {rows.map(([labelW, valueW], i) => (
        <CardRow key={i} labelWidth={labelW} valueWidth={valueW} />
      ))}
    </div>
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
      <InfoCard
        titleWidth="w-28"
        rows={[["w-12", "w-28"], ["w-8", "w-12"], ["w-16", "w-40"]]}
      />
      <InfoCard
        titleWidth="w-24"
        rows={[["w-12", "w-24"], ["w-12", "w-36"], ["w-16", "w-24"]]}
      />
      <InfoCard
        titleWidth="w-20"
        rows={[["w-24", "w-20"], ["w-20", "w-36"], ["w-12", "w-28"], ["w-28", "w-16"]]}
      />
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
