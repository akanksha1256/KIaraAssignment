"use client";

import { useState } from "react";
import { useTenantDashboard } from "@repo/data";
import { Skeleton } from "@repo/ui";
import { ErrorState } from "@/client/views/ErrorScreen";
import { EmptyState } from "@/client/views/EmptyScreen";
import { PaymentHistoryTable } from "@/client/views/payments/PaymentHistoryTable";
import { PropertyInfoCard } from "./PropertyInfoCard";
import { ManagerInfoCard } from "./ManagerInfoCard";
import { LeaseDetailsCard } from "./LeaseDetailsCard";
import { PayRentModal } from "./PayRentModal";
import { Badge } from "@repo/ui";
import { CreditCard, AlertCircle, CheckCircle2 } from "lucide-react";
import { strings } from "@repo/tokens";
import { formatPeriodMonth } from "@repo/ui";

const s = strings.tenant.dashboard;

function TenantDashboardSkeleton() {
  return (
    <div className="p-8 max-w-[1180px] space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-36" />
      </div>
      <div className="rounded-xl border border-sand-400 bg-white p-6 space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-sand-400 bg-white p-5 space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-sand-400 bg-white overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="px-5 py-4 border-b border-sand-200 flex gap-4 items-center">
            {[70, 80, 80, 90, 100, 70, 80].map((w, j) => (
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

export const TenantDashboard = ({ tenantId }: Props) => {
  const { data, isLoading, isError, error, refetch } = useTenantDashboard(tenantId);
  const [payingPeriodMonth, setPayingPeriodMonth] = useState<string | null>(null);

  if (isLoading) return <TenantDashboardSkeleton />;
  if (isError)
    return (
      <ErrorState
        message={(error as Error)?.message ?? "Failed to load dashboard."}
        onRetry={() => refetch()}
      />
    );
  if (!data) return <EmptyState title={s.emptyTitle} description={s.emptyDescription} />;

  const { dashboard, payments } = data;
  const { tenantName, lease, unit, property } = dashboard;

  const pendingPayment = payingPeriodMonth
    ? (payments.find((p) => p.periodMonth === payingPeriodMonth) ?? null)
    : null;

  // Find the most urgent payment
  const overduePayments = payments.filter((p) => p.status === "overdue");
  const outstandingPayments = payments.filter((p) => p.status === "outstanding");
  const heroPayment = overduePayments[0] ?? outstandingPayments[0] ?? null;
  const allClear = payments.length > 0 && payments.every((p) => p.status === "paid");

  return (
    <div className="p-8 max-w-[1180px]">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-serif text-[36px] font-semibold leading-[1.1] tracking-[-0.01em] text-maroon-600">
          {s.heading(tenantName)}
        </h1>
        <p className="text-muted-foreground mt-1">
          {unit ? `${property?.name ?? ""} · ${unit.label}` : "Your rental dashboard"}
        </p>
      </div>

      {/* Hero: amount due / all-clear */}
      {heroPayment ? (
        <section
          aria-label="Payment due"
          className={`rounded-xl border overflow-hidden mb-6 ${
            heroPayment.status === "overdue"
              ? "border-destructive/25 bg-gradient-to-br from-destructive-bg to-white"
              : "border-warning/25 bg-gradient-to-br from-[#FBF1DD] to-white"
          }`}
        >
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className={`h-4 w-4 ${heroPayment.status === "overdue" ? "text-destructive" : "text-warning"}`} />
              <span className={`t-overline ${heroPayment.status === "overdue" ? "text-destructive" : "text-warning"}`}>
                {heroPayment.status === "overdue" ? "Payment overdue" : "Payment outstanding"}
              </span>
            </div>
            <div className="t-money text-espresso-900">
              ${heroPayment.amountDue.toLocaleString()}
            </div>
            <p className="text-espresso-700 mt-2 text-[15px]">
              Due for <strong>{formatPeriodMonth(heroPayment.periodMonth)}</strong>
              {heroPayment.status === "overdue" && " — this payment is past due."}
            </p>
            <button
              onClick={() => setPayingPeriodMonth(heroPayment.periodMonth)}
              className="inline-flex items-center gap-2 h-10 px-6 rounded-full bg-coral-500 text-white text-[14px] font-medium hover:bg-coral-600 transition-colors shadow-sm mt-5"
            >
              <CreditCard className="h-4 w-4" />
              Pay rent now
            </button>
          </div>
        </section>
      ) : allClear ? (
        <section className="rounded-xl border border-teal-200 bg-gradient-to-br from-teal-100 to-white p-6 mb-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center flex-none">
            <CheckCircle2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-teal-700">All payments up to date</p>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              You have no outstanding or overdue payments.
            </p>
          </div>
        </section>
      ) : null}

      {/* Info cards */}
      <div className="grid gap-4 lg:grid-cols-3 mb-8">
        <PropertyInfoCard property={property} unit={unit} />
        <ManagerInfoCard property={property} />
        <LeaseDetailsCard lease={lease} />
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
        <PaymentHistoryTable
          payments={payments}
          empty={s.payments.empty}
          emptyDescription={s.payments.emptyDescription}
          tenantActions={
            lease
              ? {
                  onPayRent: (periodMonth) => setPayingPeriodMonth(periodMonth),
                  payButtonLabel: s.payments.payButton,
                }
              : undefined
          }
        />
      </div>

      {payingPeriodMonth && pendingPayment && lease && (
        <PayRentModal
          tenantId={tenantId}
          leaseId={lease.id}
          periodMonth={payingPeriodMonth}
          amountDue={pendingPayment.amountDue}
          onClose={() => setPayingPeriodMonth(null)}
        />
      )}
    </div>
  );
};
