"use client";

import { useState } from "react";
import { useTenantDashboard } from "@repo/data";
import { TenantDashboardSkeleton } from "./TenantDashboardLoadingScreen";
import { ErrorState } from "@/client/views/ErrorScreen";
import { EmptyState } from "@/client/views/EmptyScreen";
import { PaymentHistoryTable } from "@/client/views/payments/PaymentHistoryTable";
import { PropertyInfoCard } from "./PropertyInfoCard";
import { ManagerInfoCard } from "./ManagerInfoCard";
import { LeaseDetailsCard } from "./LeaseDetailsCard";
import { PayRentModal } from "./PayRentModal";
import { Badge, SectionTitle, MutedText, LeadText, CardTitle, Button } from "@repo/ui";
import { CreditCard, AlertCircle, CheckCircle2 } from "lucide-react";
import { strings } from "@repo/tokens";
import { formatPeriodMonth } from "@repo/ui";

const s = strings.tenant.dashboard;

interface Props {
  tenantId: string;
}

export const TenantDashboard = ({ tenantId }: Props) => {
  const { data, isLoading, isError, error, refetch } = useTenantDashboard(tenantId);
  const [payingPeriodMonth, setPayingPeriodMonth] = useState<string | null>(null);

  if (isLoading) return <TenantDashboardSkeleton />;
  if (isError)
    return <ErrorState message={(error as Error)?.message ?? s.error} onRetry={() => refetch()} />;
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
    <div className="p-8 max-w-[1180px] mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <SectionTitle>{s.heading(tenantName)}</SectionTitle>
        <MutedText className="mt-1">
          {unit ? `${property?.name ?? ""} · ${unit.label}` : s.subheading}
        </MutedText>
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
          <div className="p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle
                  className={`h-4 w-4 ${heroPayment.status === "overdue" ? "text-destructive" : "text-warning"}`}
                />
                <span
                  className={`t-overline ${heroPayment.status === "overdue" ? "text-destructive" : "text-warning"}`}
                >
                  {heroPayment.status === "overdue" ? s.hero.overdue : s.hero.outstanding}
                </span>
              </div>
              <div className="t-money text-espresso-900">
                ${heroPayment.amountDue.toLocaleString()}
              </div>
              <LeadText className="mt-2 text-espresso-700">
                {s.hero.dueFor(formatPeriodMonth(heroPayment.periodMonth))}
                {heroPayment.status === "overdue" && s.hero.pastDue}
              </LeadText>
            </div>
            <Button
              onClick={() => setPayingPeriodMonth(heroPayment.periodMonth)}
              className="inline-flex items-center gap-2 h-10 px-6 rounded-full bg-coral-500 text-white text-[14px] font-medium hover:bg-coral-600 transition-colors shadow-sm lg:flex-none"
            >
              <CreditCard className="h-4 w-4" />
              {s.hero.payNow}
            </Button>
          </div>
        </section>
      ) : allClear ? (
        <section className="rounded-xl border border-teal-200 bg-gradient-to-br from-teal-100 to-white p-6 mb-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center flex-none">
            <CheckCircle2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <LeadText className="font-semibold text-teal-700">{s.hero.allClearTitle}</LeadText>
            <MutedText className="mt-0.5">{s.hero.allClearDescription}</MutedText>
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
          <CardTitle>
            {s.paymentHistoryTitle}
            <MutedText className="ml-2 inline font-normal">({payments.length})</MutedText>
          </CardTitle>
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
