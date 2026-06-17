"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePropertyDetail, usePayments, useMarkPaid, useSendReminder } from "@repo/data";
import { UnitDetailSkeleton } from "./UnitDetailLoadingScreen";
import { ErrorState } from "@/client/views/ErrorScreen";
import { EmptyState } from "@/client/views/EmptyScreen";
import { PaymentHistoryTable } from "@/client/views/payments/PaymentHistoryTable";
import { TenantCard } from "@/client/views/properties/unit/components/TenantCard";
import { ManagerLeaseCard } from "@/client/views/properties/unit/components/ManagerLeaseCard";
import { useToast } from "@repo/ui";
import { strings } from "@repo/tokens";
import { BackButton } from "@/client/components/BackButton";
import { UnitDetailHeader } from "./components/UnitDetailHeader";
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
  if (!data || !unit) return <EmptyState title={s.emptyTitle} description={s.emptyDescription} />;

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

  return (
    <div className="p-8 max-w-[1180px]">
      <BackButton onClick={() => router.back()}>{s.backLink}</BackButton>

      <UnitDetailHeader
        label={unit.label}
        propertyName={data.property.name}
        paymentStatus={unit.paymentStatus}
      />

      {/* Info cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <TenantCard tenant={unit.tenant} />
        <ManagerLeaseCard lease={unit.lease} />
      </div>

      {/* Payment history */}
      {leaseId && (
        <div>
          <PaymentHistoryTable
            payments={payments}
            loading={paymentsLoading}
            count={payments.length}
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
          title={s.payments.noLeaseTitle}
          description={s.payments.noLeaseDescription}
          icon="payment"
        />
      )}
    </div>
  );
};
