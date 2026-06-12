"use client";

import { useState } from "react";
import { usePropertyDetail } from "@repo/data";
import { usePayments } from "@repo/data";
import { useMarkPaid } from "@repo/data";
import { useSendReminder } from "@repo/data";
import { LoadingState } from "@/client/views/LoadingScreen";
import { ErrorState } from "@/client/views/ErrorScreen";
import { EmptyState } from "@/client/views/EmptyScreen";
import { PaymentHistoryTable } from "@/client/views/payments/PaymentHistoryTable";
import { strings } from "@repo/tokens";
import { CreditCard as CreditCardIcon } from "lucide-react";
import { MainHeader } from "@repo/ui";
import { TenantCard } from "@/client/views/tenant/TenantCard";
import { ManagerLeaseCard } from "@/client/views/lease/ManagerLeaseCard";
import { useToast } from "@repo/ui";
import { UnitDetailProps } from "../helper";
import { statusConfig } from "@repo/ui";

const s = strings.manager.unitDetail;
const st = strings.paymentTable;

export const UnitDetail = ({ propertyId, unitId }: UnitDetailProps) => {
  const { showToast } = useToast();

  const { data, isLoading, isError, error, refetch } = usePropertyDetail(propertyId);
  const unit = data?.units.find((u) => u.id === unitId) ?? null;
  const leaseId = unit?.lease?.id;

  const { data: payments = [], isLoading: paymentsLoading } = usePayments(leaseId);

  const [processingPeriodMonth, setProcessingPeriodMonth] = useState<string | null>(null);
  const [sendingReminderPeriodMonth, setSendingReminderPeriodMonth] = useState<string | null>(null);

  const markPaid = useMarkPaid(leaseId ?? "");
  const sendReminder = useSendReminder(leaseId ?? "");

  if (isLoading) return <LoadingState message={s.loading} />;
  if (isError)
    return <ErrorState message={(error as Error)?.message ?? s.error} onRetry={() => refetch()} />;
  if (!unit) return <EmptyState title={s.emptyTitle} description={s.emptyDescription} />;

  const { bg, text } = statusConfig[unit.paymentStatus];
  const tenantName = unit.tenant?.name ?? "Tenant";

  const handleMarkPaid = (periodMonth: string) => {
    if (!leaseId) return;
    setProcessingPeriodMonth(periodMonth);
    markPaid.mutate(
      { periodMonth },
      {
        onSuccess: () => {
          showToast("Payment marked as paid successfully.", "success");
        },
        onError: (err) => {
          showToast((err as Error).message ?? "Failed to mark payment as paid.", "error");
        },
        onSettled: () => {
          setProcessingPeriodMonth(null);
        },
      },
    );
  };

  const handleSendReminder = (periodMonth: string) => {
    if (!leaseId) return;
    setSendingReminderPeriodMonth(periodMonth);
    sendReminder.mutate(
      { periodMonth },
      {
        onSuccess: () => {
          showToast(st.actions.reminderToast(tenantName), "success");
        },
        onError: (err) => {
          showToast((err as Error).message ?? "Failed to send reminder.", "error");
        },
        onSettled: () => {
          setSendingReminderPeriodMonth(null);
        },
      },
    );
  };

  return (
    <div className="space-y-8">
      <MainHeader label={s.backLink} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">{unit.label}</h1>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${bg} ${text}`}
        >
          {s.statusPill[unit.paymentStatus]}
        </span>
      </div>

      <div className="flex items-stretch gap-6">
        <div className="w-[35%]">
          <TenantCard tenant={unit.tenant} />
        </div>
        <div className="w-[65%]">
          <ManagerLeaseCard lease={unit.lease} />
        </div>
      </div>

      {leaseId && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <CreditCardIcon className="h-4 w-4 text-neutral-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
              {s.payments.heading(payments.length)}
            </h2>
          </div>
          <PaymentHistoryTable
            payments={payments}
            loading={paymentsLoading}
            empty={s.payments.empty}
            actions={{
              onReminder: handleSendReminder,
              onMarkPaid: handleMarkPaid,
              processingPeriodMonth,
              sendingReminderPeriodMonth,
            }}
          />
        </div>
      )}
    </div>
  );
};
