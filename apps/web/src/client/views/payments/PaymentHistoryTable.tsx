"use client";

import { DataTable } from "@/client/commonComponents/DataTable";
import { RowMenu } from "@/client/commonComponents/RowMenu";
import { EmptyState } from "@/client/views/EmptyScreen";
import { LoadingState } from "@/client/views/LoadingScreen";
import { strings } from "@/client/designSystems/strings";
import type { Payment } from "@/client/stateManagement/payment/type";
import type { TableCell } from "@/client/commonComponents/DataTable";

const s = strings.paymentTable;

const STATUS_CONFIG = {
  paid: { bg: "bg-success-50", text: "text-success-700" },
  outstanding: { bg: "bg-warning-50", text: "text-warning-700" },
  overdue: { bg: "bg-danger-50", text: "text-danger-700" },
} as const;

export interface PaymentTableActions {
  onReminder: (periodMonth: string) => void;
  onMarkPaid: (periodMonth: string) => void;
  isProcessing: boolean;
}

interface Props {
  payments: Payment[];
  loading?: boolean;
  empty?: string;
  actions?: PaymentTableActions;
}

function buildRow(
  payment: Payment,
  actions?: PaymentTableActions,
): TableCell[] {
  const cfg = STATUS_CONFIG[payment.status] ?? STATUS_CONFIG.outstanding;

  const statusCell: TableCell = {
    content: (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text}`}
      >
        {s.statusPill[payment.status]}
      </span>
    ),
    className: "whitespace-nowrap text-right px-5 py-4",
  };

  const baseCells: TableCell[] = [
    {
      content: payment.periodMonth,
      className:
        "whitespace-nowrap px-5 py-4 text-sm font-mono text-neutral-600",
    },
    {
      content: `$${payment.amountDue.toLocaleString()}`,
      className:
        "whitespace-nowrap px-5 py-4 text-right text-sm text-neutral-700",
    },
    {
      content:
        payment.amountPaid > 0
          ? `$${payment.amountPaid.toLocaleString()}`
          : s.notPaid,
      className:
        "whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-neutral-900",
    },
    {
      content: payment.paidDate ?? s.notPaid,
      className:
        "whitespace-nowrap px-5 py-4 text-right text-sm text-neutral-500",
    },
    {
      content: payment.method ?? s.notPaid,
      className:
        "whitespace-nowrap px-5 py-4 text-right text-sm text-neutral-500",
    },
    statusCell,
  ];

  if (!actions) return baseCells;

  const menuItems =
    payment.status === "paid"
      ? []
      : [
          ...(payment.status === "overdue"
            ? [
                {
                  label: s.actions.sendReminder,
                  onClick: () => actions.onReminder(payment.periodMonth),
                  disabled: actions.isProcessing,
                },
              ]
            : []),
          {
            label: s.actions.markPaid,
            onClick: () => actions.onMarkPaid(payment.periodMonth),
            disabled: actions.isProcessing,
          },
        ];

  return [
    ...baseCells,
    {
      content: menuItems.length > 0 ? <RowMenu items={menuItems} /> : null,
      className: "whitespace-nowrap px-5 py-4 text-right",
    },
  ];
}

export function PaymentHistoryTable({
  payments,
  loading,
  empty,
  actions,
}: Props) {
  if (loading) return <LoadingState message="Loading payments…" />;
  if (payments.length === 0)
    return (
      <EmptyState title={empty ?? "No payments recorded"} description="" />
    );

  const hasActions = !!actions;

  const columns = [
    {
      label: s.colPeriod,
      align: "left" as const,
      className: hasActions ? "w-[12%]" : "w-[15%]",
    },
    {
      label: s.colDue,
      align: "right" as const,
      className: hasActions ? "w-[13%]" : "w-[16%]",
    },
    {
      label: s.colPaid,
      align: "right" as const,
      className: hasActions ? "w-[13%]" : "w-[16%]",
    },
    {
      label: s.colDate,
      align: "right" as const,
      className: hasActions ? "w-[16%]" : "w-[19%]",
    },
    {
      label: s.colMethod,
      align: "right" as const,
      className: hasActions ? "w-[20%]" : "w-[19%]",
    },
    {
      label: s.colStatus,
      align: "right" as const,
      className: hasActions ? "w-[18%]" : "w-[15%]",
    },
    ...(hasActions
      ? [{ label: "", align: "right" as const, className: "w-[5%]" }]
      : []),
  ];

  return (
    <DataTable
      columns={columns}
      rows={payments.map((p) => ({ key: p.id, cells: buildRow(p, actions) }))}
    />
  );
}
