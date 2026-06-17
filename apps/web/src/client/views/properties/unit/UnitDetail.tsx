"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePropertyDetail, usePayments, useMarkPaid, useSendReminder } from "@repo/data";
import { UnitDetailSkeleton } from "./UnitDetailLoadingScreen";
import { ErrorState } from "@/client/views/ErrorScreen";
import { EmptyState } from "@/client/views/EmptyScreen";
import { PaymentHistoryTable } from "@/client/views/payments/PaymentHistoryTable";
import { TenantCard } from "@/client/views/tenant/components/TenantCard";
import { ManagerLeaseCard } from "@/client/views/lease/ManagerLeaseCard";
import { Badge, useToast } from "@repo/ui";
import { strings } from "@repo/tokens";
import { CreditCard } from "lucide-react";
import { BackButton } from "@/client/components/BackButton";
import { UnitDetailProps } from "../helper";

const s = strings.manager.unitDetail;
const st = strings.paymentTable;


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
  if (isError)
    return <ErrorState message={(error as Error)?.message ?? s.error} onRetry={() => refetch()} />;
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
    unit.paymentStatus === "overdue"
      ? "overdue"
      : unit.paymentStatus === "outstanding"
        ? "outstanding"
        : unit.paymentStatus === "vacant"
          ? "vacant"
          : "paid";

  return (
    <div className="p-8 max-w-[1180px]">
      {/* Back */}
      <BackButton onClick={() => router.back()}>{s.backLink}</BackButton>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-[32px] font-semibold leading-[1.1] tracking-[-0.01em] text-maroon-600">
            {unit.label}
          </h1>
          <span className="text-[14px] text-muted-foreground mt-1 inline-block">
            {data.property.name}
          </span>
        </div>
        <Badge variant={statusVariant} size="lg">
          {unit.paymentStatus === "vacant"
            ? "Vacant"
            : unit.paymentStatus === "overdue"
              ? "Overdue"
              : unit.paymentStatus === "outstanding"
                ? "Outstanding"
                : "Paid"}
        </Badge>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <TenantCard tenant={unit.tenant} />
        <ManagerLeaseCard lease={unit.lease} />
      </div>

      {/* Payment history */}
      {leaseId && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-[18px] font-semibold text-espresso-900">
              Payment history
              {!paymentsLoading && (
                <span className="ml-2 text-[14px] font-normal text-muted-foreground">
                  ({payments.length})
                </span>
              )}
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
