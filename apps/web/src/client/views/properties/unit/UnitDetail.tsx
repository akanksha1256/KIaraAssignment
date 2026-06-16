"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePropertyDetail, usePayments, useMarkPaid, useSendReminder } from "@repo/data";
import { Skeleton } from "@repo/ui";
import { ErrorState } from "@/client/views/ErrorScreen";
import { EmptyState } from "@/client/views/EmptyScreen";
import { PaymentHistoryTable } from "@/client/views/payments/PaymentHistoryTable";
import { TenantCard } from "@/client/views/tenant/TenantCard";
import { ManagerLeaseCard } from "@/client/views/lease/ManagerLeaseCard";
import { Badge, useToast } from "@repo/ui";
import { strings } from "@repo/tokens";
import { ArrowLeft, CreditCard } from "lucide-react";
import { UnitDetailProps } from "../helper";

const s = strings.manager.unitDetail;
const st = strings.paymentTable;

function UnitDetailSkeleton() {
  return (
    <div className="p-8 max-w-[1180px] space-y-8">
      <Skeleton className="h-4 w-28" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="flex gap-5">
        <div className="w-[35%] rounded-xl border border-sand-400 bg-white p-5 space-y-3">
          <Skeleton className="h-4 w-24" />
          {[1, 2].map((i) => <Skeleton key={i} className="h-3 w-full" />)}
        </div>
        <div className="flex-1 rounded-xl border border-sand-400 bg-white p-5 space-y-3">
          <Skeleton className="h-4 w-24" />
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-3 w-full" />)}
        </div>
      </div>
      <div className="rounded-xl border border-sand-400 bg-white overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="px-5 py-4 border-b border-sand-200 flex gap-4 items-center">
            {[70, 80, 80, 90, 100, 70, 40].map((w, j) => (
              <Skeleton key={j} className={`h-3 w-[${w}px]`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export const UnitDetail = ({ propertyId, unitId }: UnitDetailProps) => {
  const router = useRouter();
  const { showToast } = useToast();

  const { data, isLoading, isError, error, refetch } = usePropertyDetail(propertyId);
  const unit = data?.units.find((u) => u.id === unitId) ?? null;
  const leaseId = unit?.lease?.id;

  const { data: payments = [], isLoading: paymentsLoading } = usePayments(leaseId);

  const [processingPeriodMonth, setProcessingPeriodMonth] = useState<string | null>(null);
  const [sendingReminderPeriodMonth, setSendingReminderPeriodMonth] = useState<string | null>(null);
  const [flashStates, setFlashStates] = useState<Record<string, "success" | "error" | null>>({});

  const markPaid = useMarkPaid(leaseId ?? "");
  const sendReminder = useSendReminder(leaseId ?? "");

  if (isLoading) return <UnitDetailSkeleton />;
  if (isError) return <ErrorState message={(error as Error)?.message ?? s.error} onRetry={() => refetch()} />;
  if (!unit) return <EmptyState title={s.emptyTitle} description={s.emptyDescription} />;

  const tenantName = unit.tenant?.name ?? "Tenant";

  const triggerFlash = (periodMonth: string, state: "success" | "error") => {
    setFlashStates((prev) => ({ ...prev, [periodMonth]: state }));
    setTimeout(() => {
      setFlashStates((prev) => ({ ...prev, [periodMonth]: null }));
    }, 1200);
  };

  const handleMarkPaid = (periodMonth: string) => {
    if (!leaseId) return;
    setProcessingPeriodMonth(periodMonth);
    markPaid.mutate(
      { periodMonth },
      {
        onSuccess: () => {
          triggerFlash(periodMonth, "success");
          showToast("Payment marked as paid successfully.", "success");
        },
        onError: (err) => {
          triggerFlash(periodMonth, "error");
          showToast((err as Error).message ?? "Failed to mark payment as paid.", "error");
        },
        onSettled: () => setProcessingPeriodMonth(null),
      },
    );
  };

  const handleSendReminder = (periodMonth: string) => {
    if (!leaseId) return;
    setSendingReminderPeriodMonth(periodMonth);
    sendReminder.mutate(
      { periodMonth },
      {
        onSuccess: () => showToast(st.actions.reminderToast(tenantName), "success"),
        onError: (err) => showToast((err as Error).message ?? "Failed to send reminder.", "error"),
        onSettled: () => setSendingReminderPeriodMonth(null),
      },
    );
  };

  const statusVariant =
    unit.paymentStatus === "overdue" ? "overdue"
    : unit.paymentStatus === "outstanding" ? "outstanding"
    : unit.paymentStatus === "vacant" ? "vacant"
    : "paid";

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="font-mono text-[13px] font-medium text-muted-foreground bg-sand-200 px-2.5 py-1 rounded mb-2 inline-block">
            {unit.label}
          </span>
          <h1 className="font-serif text-[32px] font-semibold leading-[1.1] tracking-[-0.01em] text-maroon-600 mt-1">
            {unit.tenant?.name ?? "Vacant Unit"}
          </h1>
        </div>
        <Badge variant={statusVariant} size="lg">
          {unit.paymentStatus === "vacant" ? "Vacant"
            : unit.paymentStatus === "overdue" ? "Overdue"
            : unit.paymentStatus === "outstanding" ? "Outstanding"
            : "Paid"}
        </Badge>
      </div>

      {/* Info cards */}
      <div className="flex items-stretch gap-5 mb-8">
        <div className="w-[35%]">
          <TenantCard tenant={unit.tenant} />
        </div>
        <div className="flex-1">
          <ManagerLeaseCard lease={unit.lease} />
        </div>
      </div>

      {/* Payment history */}
      {leaseId && (
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
            loading={paymentsLoading}
            empty={s.payments.empty}
            flashStates={flashStates}
            actions={{
              onReminder: handleSendReminder,
              onMarkPaid: handleMarkPaid,
              processingPeriodMonth,
              sendingReminderPeriodMonth,
            }}
          />
        </div>
      )}

      {!leaseId && (
        <EmptyState
          title="No lease on this unit"
          description="Add a lease to start tracking payments."
          icon="payment"
        />
      )}
    </div>
  );
};
