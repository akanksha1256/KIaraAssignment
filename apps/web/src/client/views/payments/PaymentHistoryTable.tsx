"use client";

import { DataTable } from "@repo/ui";
import { RowMenu } from "@repo/ui";
import { EmptyState } from "@/client/views/EmptyScreen";
import { LoadingState } from "@/client/views/LoadingScreen";
import { strings } from "@repo/tokens";
import type { Payment } from "@repo/data";
import type { TableCell } from "@repo/ui";
import { formatDate, formatPeriodMonth } from "@repo/ui";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const s = strings.paymentTable;

const STATUS_CONFIG = {
  paid: { bg: "bg-success-50", text: "text-success-700" },
  outstanding: { bg: "bg-warning-50", text: "text-warning-700" },
  overdue: { bg: "bg-danger-50", text: "text-danger-700" },
} as const;

export interface PaymentTableActions {
  onReminder: (periodMonth: string) => void;
  onMarkPaid: (periodMonth: string) => void;
  processingPeriodMonth: string | null;
  sendingReminderPeriodMonth: string | null;
}

export interface TenantPaymentActions {
  onPayRent: (periodMonth: string) => void;
  payButtonLabel: string;
}

interface Props {
  payments: Payment[];
  loading?: boolean;
  empty?: string;
  emptyDescription?: string;
  actions?: PaymentTableActions;
  tenantActions?: TenantPaymentActions;
}

function buildRow(
  payment: Payment,
  actions?: PaymentTableActions,
  tenantActions?: TenantPaymentActions,
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
      content: formatPeriodMonth(payment.periodMonth),
      className: "whitespace-nowrap px-5 py-4 text-sm font-mono text-neutral-600",
    },
    {
      content: `$${payment.amountDue.toLocaleString()}`,
      className: "whitespace-nowrap px-5 py-4 text-right text-sm text-neutral-700",
    },
    {
      content: payment.amountPaid > 0 ? `$${payment.amountPaid.toLocaleString()}` : s.notPaid,
      className: "whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-neutral-900",
    },
    {
      content: payment.paidDate ? formatDate(payment.paidDate) : s.notPaid,
      className: "whitespace-nowrap px-5 py-4 text-right text-sm text-neutral-500",
    },
    {
      content: payment.method ?? s.notPaid,
      className: "whitespace-nowrap px-5 py-4 text-right text-sm text-neutral-500",
    },
    statusCell,
  ];

  if (!actions && tenantActions) {
    const canPay = payment.status === "outstanding" || payment.status === "overdue";
    return [
      ...baseCells,
      {
        content: canPay ? (
          <div className="flex justify-end">
            <button
              onClick={() => tenantActions.onPayRent(payment.periodMonth)}
              className="rounded-lg bg-brand-400 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
            >
              {tenantActions.payButtonLabel}
            </button>
          </div>
        ) : null,
        className: "whitespace-nowrap px-5 py-4 text-right",
      },
    ];
  }

  if (!actions) return baseCells;

  const isThisRowProcessing = actions.processingPeriodMonth === payment.periodMonth;
  const isThisRowSendingReminder = actions.sendingReminderPeriodMonth === payment.periodMonth;
  const anyRowProcessing =
    actions.processingPeriodMonth !== null || actions.sendingReminderPeriodMonth !== null;

  const remindedAt = payment.lastRemindedOn ? dayjs.utc(payment.lastRemindedOn) : null;
  const reminderWithin24h = remindedAt !== null && dayjs.utc().diff(remindedAt, "hour") < 24;

  const reminderSublabel = reminderWithin24h
    ? `${s.actions.lastReminderSent} ${remindedAt!.local().format("D MMM YYYY, h:mm A")}`
    : undefined;

  const menuItems =
    payment.status === "paid"
      ? []
      : [
          ...(payment.status === "overdue"
            ? [
                {
                  label: s.actions.sendReminder,
                  sublabel: reminderSublabel,
                  onClick: () => actions.onReminder(payment.periodMonth),
                  disabled: anyRowProcessing || reminderWithin24h,
                  loading: isThisRowSendingReminder,
                },
              ]
            : []),
          {
            label: s.actions.markPaid,
            onClick: () => actions.onMarkPaid(payment.periodMonth),
            disabled: anyRowProcessing,
            loading: isThisRowProcessing,
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

export function PaymentHistoryTable({ payments, loading, empty, emptyDescription, actions, tenantActions }: Props) {
  if (loading) return <LoadingState message="Loading payments…" />;
  if (payments.length === 0)
    return <EmptyState title={empty ?? "No payments recorded"} description={emptyDescription} />;

  const hasActions = !!actions;
  const hasTenantActions = !!tenantActions;

  const hasExtraCol = hasActions || hasTenantActions;

  const columns = [
    {
      label: s.colPeriod,
      align: "left" as const,
      className: hasExtraCol ? "w-[12%]" : "w-[15%]",
    },
    {
      label: s.colDue,
      align: "right" as const,
      className: hasExtraCol ? "w-[13%]" : "w-[16%]",
    },
    {
      label: s.colPaid,
      align: "right" as const,
      className: hasExtraCol ? "w-[13%]" : "w-[16%]",
    },
    {
      label: s.colDate,
      align: "right" as const,
      className: hasExtraCol ? "w-[16%]" : "w-[19%]",
    },
    {
      label: s.colMethod,
      align: "right" as const,
      className: hasExtraCol ? "w-[20%]" : "w-[19%]",
    },
    {
      label: s.colStatus,
      align: "right" as const,
      className: hasExtraCol ? "w-[16%]" : "w-[15%]",
    },
    ...(hasExtraCol ? [{ label: "", align: "right" as const, className: "w-[7%]" }] : []),
  ];

  return (
    <DataTable
      columns={columns}
      rows={payments.map((p) => ({
        key: p.id,
        cells: buildRow(p, actions, tenantActions),
      }))}
    />
  );
}
