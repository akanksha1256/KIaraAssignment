"use client";

import { useTenantProfile } from "@repo/data";
import { Avatar, SubpageTitle, MutedText, CardTitle } from "@repo/ui";
import { TenantProfileSkeleton } from "./TenantProfileLoadingScreen";
import { ErrorState } from "@/client/views/ErrorScreen";
import { EmptyState } from "@/client/views/EmptyScreen";
import { PaymentHistoryTable } from "@/client/views/payments/PaymentHistoryTable";
import { strings } from "@repo/tokens";
import { BackButton } from "@/client/components/BackButton";
import { TenantInfoCard } from "./components/TenantInfoCard";
import { TenantCurrentLeaseCard } from "../lease/TenantCurrentLeaseCard";
import { useRouter } from "next/navigation";

const s = strings.manager.tenantProfile;

interface Props {
  tenantId: string;
}

export const TenantProfile = ({ tenantId }: Props) => {
  const router = useRouter();
  const { data: profile, isLoading, isError, error, refetch } = useTenantProfile(tenantId);

  if (isLoading) return <TenantProfileSkeleton />;
  if (isError)
    return <ErrorState message={(error as Error)?.message ?? s.error} onRetry={() => refetch()} />;
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
      <BackButton onClick={() => router.back()}>{s.backLink}</BackButton>

      {/* Header */}
      <div className="flex items-center gap-5 mb-8">
        <Avatar initials={initials} size="lg" />
        <div>
          <SubpageTitle>{tenant.name}</SubpageTitle>
          <MutedText className="mt-0.5">{tenant.email}</MutedText>
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
        <PaymentHistoryTable payments={payments} count={payments.length} empty={s.payments.empty} />
      </div>
    </div>
  );
};
