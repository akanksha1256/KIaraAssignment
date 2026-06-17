"use client";

import { DataTable, CardTitle, MutedText } from "@repo/ui";
import { EmptyState } from "@/client/views/EmptyScreen";
import { strings } from "@repo/tokens";
import type { PaymentHistoryTableProps } from "@repo/data";
import { buildPaymentRow } from "./components/BuildPaymentRow";
import { PaymentHistoryTableSkeleton } from "./PaymentHistoryTableLoadingScreen";
import { CreditCard as CreditCardIcon } from "lucide-react";

const s = strings.paymentTable;

export const PaymentHistoryTable = ({
  payments,
  loading,
  count,
  empty,
  emptyDescription,
  actions,
  tenantActions,
  flashStates,
}: PaymentHistoryTableProps) => {
  const header = count !== undefined ? (
    <div className="flex items-center gap-2 mb-4">
      <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
      <CardTitle>{s.heading}</CardTitle>
      {!loading && <MutedText className="font-normal">({count})</MutedText>}
    </div>
  ) : null;

  if (loading) return <>{header}<PaymentHistoryTableSkeleton /></>;

  if (payments.length === 0)
    return (
      <>
        {header}
        <EmptyState
          title={empty ?? s.emptyTitle}
          description={emptyDescription ?? s.emptyDescription}
          icon="payment"
        />
      </>
    );

  const hasActions = !!actions;
  const hasTenantActions = !!tenantActions;
  const hasExtraCol = hasActions || hasTenantActions;

  const columns = [
    { label: s.colPeriod, align: "left" as const, sortable: true },
    { label: s.colDue, align: "right" as const, sortable: true },
    { label: s.colPaid, align: "right" as const, sortable: true },
    { label: s.colDate, align: "right" as const, sortable: true },
    { label: s.colMethod, align: "right" as const, sortable: true },
    { label: s.colStatus, align: "right" as const, sortable: true },
    ...(hasExtraCol ? [{ label: "", align: "right" as const }] : []),
  ];

  return (
    <>
      {header}
      <DataTable
        columns={columns}
        rows={payments.map((p) => ({
          key: p.id,
          urgent: p.status === "overdue",
          flashState: flashStates?.[p.periodMonth] ?? null,
          cells: buildPaymentRow(p, actions, tenantActions),
        }))}
      />
    </>
  );
};
