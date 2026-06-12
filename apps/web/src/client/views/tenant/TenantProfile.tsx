"use client";

import { useTenantProfile } from "@repo/data";
import { LoadingState } from "@/client/views/LoadingScreen";
import { ErrorState } from "@/client/views/ErrorScreen";
import { EmptyState } from "@/client/views/EmptyScreen";
import { PaymentHistoryTable } from "@/client/views/payments/PaymentHistoryTable";
import { strings } from "@repo/tokens";
import { CreditCard as CreditCardIcon } from "lucide-react";
import { MainHeader } from "@repo/ui";
import { TenantInfoCard } from "./TenantInfoCard";
import { TenantCurrentLeaseCard } from "../lease/TenantCurrentLeaseCard";

const s = strings.manager.tenantProfile;

interface Props {
  tenantId: string;
}

export const TenantProfile = ({ tenantId }: Props) => {
  const { data: profile, isLoading, isError, error, refetch } = useTenantProfile(tenantId);

  if (isLoading) return <LoadingState message={s.loading} />;
  if (isError)
    return <ErrorState message={(error as Error)?.message ?? s.error} onRetry={() => refetch()} />;
  if (!profile) return <EmptyState title={s.emptyTitle} description={s.emptyDescription} />;

  const { tenant, lease, unit, property, payments, standing } = profile;

  return (
    <div className="space-y-8">
      <MainHeader label={s.backLink} />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <TenantInfoCard tenant={tenant} standing={standing} />
        </div>
        <div className="lg:col-span-2">
          <TenantCurrentLeaseCard lease={lease} unit={unit} property={property} />
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <CreditCardIcon className="h-4 w-4 text-neutral-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
            {s.payments.heading(payments.length)}
          </h2>
        </div>
        <PaymentHistoryTable payments={payments} empty={s.payments.empty} />
      </div>
    </div>
  );
};
