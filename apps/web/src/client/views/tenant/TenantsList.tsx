"use client";

import { useRouter } from "next/navigation";
import { useAllTenants } from "@repo/data";
import { ErrorState } from "@/client/views/ErrorScreen";
import { EmptyState } from "@/client/views/EmptyScreen";
import { Badge, SectionTitle, MutedText } from "@repo/ui";
import { TenantsListSkeleton } from "./TenantsListLoadingScreen";
import { strings } from "@repo/tokens";
import type { TenantListItem } from "@repo/data";
import { ShieldCheck, Clock, ShieldOff, ChevronRight } from "lucide-react";

const s = strings.manager.tenantsList;

const KYC_ICON: Record<string, React.ReactNode> = {
  verified: <ShieldCheck className="h-3.5 w-3.5" />,
  pending: <Clock className="h-3.5 w-3.5" />,
  not_submitted: <ShieldOff className="h-3.5 w-3.5" />,
};

const KYC_CLASS: Record<string, string> = {
  verified: "text-teal-700 bg-teal-50 border border-teal-200",
  pending: "text-warning bg-amber-50 border border-amber-200",
  not_submitted: "text-muted-foreground bg-sand-100 border border-sand-300",
};

const KYC_LABEL: Record<string, string> = {
  verified: "Verified",
  pending: "Pending",
  not_submitted: "Not submitted",
};

const TenantRow = ({ item }: { item: TenantListItem }) => {
  const router = useRouter();
  const { tenant, lease, unit, property, paymentStatus } = item;
  const kycClass = KYC_CLASS[tenant.kycStatus] ?? KYC_CLASS.not_submitted;

  return (
    <tr
      onClick={() => router.push(`/manager/tenants/${tenant.id}`)}
      className="border-t border-sand-200 hover:bg-coral-50/50 cursor-pointer transition-colors group"
    >
      {/* Avatar + name */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral-500 to-maroon-600 text-white grid place-items-center text-[12px] font-semibold flex-none select-none">
            {tenant.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <div className="text-[13.5px] font-semibold text-espresso-900 leading-tight">
              {tenant.name}
            </div>
            <div className="text-[12px] text-muted-foreground">{tenant.email}</div>
          </div>
        </div>
      </td>

      {/* Property / unit */}
      <td className="px-5 py-3.5">
        {property && unit ? (
          <div>
            <div className="text-[13px] font-medium text-espresso-900">{property.name}</div>
            <div className="text-[12px] text-muted-foreground font-mono">{unit.label}</div>
          </div>
        ) : (
          <MutedText className="italic">{s.noActiveLease}</MutedText>
        )}
      </td>

      {/* Rent */}
      <td className="px-5 py-3.5 text-right">
        {lease ? (
          <span className="text-[13px] font-semibold tabular-nums">
            ${lease.monthlyRent.toLocaleString()}
            <span className="text-muted-foreground font-normal text-[11px]">/mo</span>
          </span>
        ) : (
          <span className="text-espresso-300 text-[13px]">—</span>
        )}
      </td>

      {/* Payment status */}
      <td className="px-5 py-3.5 text-right">
        <div className="flex justify-end">
          <Badge
            variant={
              paymentStatus === "overdue"
                ? "overdue"
                : paymentStatus === "outstanding"
                  ? "outstanding"
                  : paymentStatus === "paid"
                    ? "paid"
                    : "vacant"
            }
            size="sm"
          >
            {paymentStatus === "vacant"
              ? "No lease"
              : paymentStatus === "overdue"
                ? "Overdue"
                : paymentStatus === "outstanding"
                  ? "Outstanding"
                  : "Paid"}
          </Badge>
        </div>
      </td>

      {/* KYC */}
      <td className="px-5 py-3.5 text-right">
        <div className="flex justify-end">
          <span
            className={`inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full ${kycClass}`}
          >
            {KYC_ICON[tenant.kycStatus]}
            {KYC_LABEL[tenant.kycStatus]}
          </span>
        </div>
      </td>

      {/* Chevron */}
      <td className="px-4 py-3.5 text-right w-10">
        <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:text-maroon-600 transition-colors" />
      </td>
    </tr>
  );
}


export const TenantsList = () => {
  const { data, isLoading, isError, error, refetch } = useAllTenants();

  if (isLoading) return <TenantsListSkeleton />;
  if (isError)
    return <ErrorState message={(error as Error)?.message ?? s.error} onRetry={() => refetch()} />;
  if (!data)
    return <EmptyState title={s.emptyTitle} description={s.emptyDescription} icon="inbox" />;

  const overdueCount = data.filter((t) => t.paymentStatus === "overdue").length;
  const pendingKyc = data.filter((t) => t.tenant.kycStatus !== "verified").length;

  return (
    <div className="p-8 max-w-[1180px]">
      <div className="mb-8">
        <SectionTitle>{s.title}</SectionTitle>
        <MutedText className="mt-1">
          {data.length} tenant{data.length !== 1 ? "s" : ""}
          {overdueCount > 0 && (
            <>
              {" "}
              · <span className="text-destructive font-medium">{overdueCount} overdue</span>
            </>
          )}
          {pendingKyc > 0 && <> · {pendingKyc} KYC pending</>}
        </MutedText>
      </div>

      {data.length === 0 ? (
        <EmptyState title={s.emptyTitle} description={s.emptyDescription} icon="inbox" />
      ) : (
        <div className="rounded-xl border border-sand-400 bg-white overflow-x-auto shadow-sm">
          <table className="w-full table-fixed min-w-[700px]">
            <colgroup>
              <col style={{ width: "28%" }} />
              <col style={{ width: "22%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "17%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "40px" }} />
            </colgroup>
            <thead>
              <tr className="bg-sand-100 border-b border-sand-400">
                <th className="px-5 py-3 text-left text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  Tenant
                </th>
                <th className="px-5 py-3 text-left text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  Property / Unit
                </th>
                <th className="px-5 py-3 text-right text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  Rent/mo
                </th>
                <th className="px-5 py-3 text-right text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  Payment
                </th>
                <th className="px-5 py-3 text-right text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  KYC
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <TenantRow key={item.tenant.id} item={item} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
