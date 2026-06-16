"use client";

import { useTenantProfile } from "@repo/data";
import { Skeleton } from "@repo/ui";
import { ErrorState } from "@/client/views/ErrorScreen";
import { EmptyState } from "@/client/views/EmptyScreen";
import { PaymentHistoryTable } from "@/client/views/payments/PaymentHistoryTable";
import { strings } from "@repo/tokens";
import { CreditCard, ArrowLeft } from "lucide-react";
import { TenantInfoCard } from "./TenantInfoCard";
import { TenantCurrentLeaseCard } from "../lease/TenantCurrentLeaseCard";
import { useRouter } from "next/navigation";

const s = strings.manager.tenantProfile;

function TenantProfileSkeleton() {
  return (
    <div className="p-8 max-w-[1180px] space-y-8">
      <Skeleton className="h-4 w-28" />
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="grid grid-cols-5 gap-5">
        <div className="col-span-3 rounded-xl border border-sand-400 bg-white p-5 space-y-3">
          <Skeleton className="h-4 w-28" />
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-3 w-full" />)}
        </div>
        <div className="col-span-2 rounded-xl border border-sand-400 bg-white p-5 space-y-3">
          <Skeleton className="h-4 w-24" />
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-3 w-full" />)}
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
}

interface Props {
  tenantId: string;
}

export const TenantProfile = ({ tenantId }: Props) => {
  const router = useRouter();
  const { data: profile, isLoading, isError, error, refetch } = useTenantProfile(tenantId);

  if (isLoading) return <TenantProfileSkeleton />;
  if (isError) return <ErrorState message={(error as Error)?.message ?? s.error} onRetry={() => refetch()} />;
  if (!profile) return <EmptyState title={s.emptyTitle} description={s.emptyDescription} />;

  const { tenant, lease, unit, property, payments, standing } = profile;

  const initials = tenant.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="p-8 max-w-[1180px]">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-maroon-600 hover:bg-sand-100 px-2.5 py-1 rounded-full transition-colors -ml-2.5 mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {s.backLink}
      </button>

      {/* Header */}
      <div className="flex items-center gap-5 mb-8">
        <div className="w-14 h-14 rounded-full bg-maroon-500 flex items-center justify-center text-white text-[18px] font-semibold flex-none">
          {initials}
        </div>
        <div>
          <h1 className="font-serif text-[32px] font-semibold leading-[1.1] tracking-[-0.01em] text-maroon-600">
            {tenant.name}
          </h1>
          <p className="text-muted-foreground mt-0.5">{tenant.email}</p>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid gap-5 lg:grid-cols-5 mb-8">
        <div className="lg:col-span-3">
          <TenantInfoCard tenant={tenant} standing={standing} />
        </div>
        <div className="lg:col-span-2">
          <TenantCurrentLeaseCard lease={lease} unit={unit} property={property} />
        </div>
      </div>

      {/* Payment history */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-[18px] font-semibold text-espresso-900">
            Payment history
            <span className="ml-2 text-[14px] font-normal text-muted-foreground">({payments.length})</span>
          </h2>
        </div>
        <PaymentHistoryTable payments={payments} empty={s.payments.empty} />
      </div>
    </div>
  );
};
