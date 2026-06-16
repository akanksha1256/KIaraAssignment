"use client";

import { DataTable, Badge, RowMenu } from "@repo/ui";
import { EmptyState } from "@/client/views/EmptyScreen";
import { Skeleton } from "@repo/ui";
import { strings } from "@repo/tokens";
import type { Payment } from "@repo/data";
import type { TableCell } from "@repo/ui";
import { formatDate, formatPeriodMonth } from "@repo/ui";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const s = strings.paymentTable;

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
  flashStates?: Record<string, "success" | "error" | null>;
}

function buildRow(
  payment: Payment,
  actions?: PaymentTableActions,
  tenantActions?: TenantPaymentActions,
): TableCell[] {
  const statusVariant =
    payment.status === "paid" ? "paid"
    : payment.status === "overdue" ? "overdue"
    : "outstanding";

  const statusLabel =
    payment.status === "paid" ? "Paid"
    : payment.status === "overdue" ? "Overdue"
    : "Outstanding";

  const statusCell: TableCell = {
    content: (
      <div className="flex justify-end">
        <Badge variant={statusVariant}>{statusLabel}</Badge>
      </div>
    ),
    className: "whitespace-nowrap text-right",
  };

  const baseCells: TableCell[] = [
    {
      content: (
        <span className="font-mono text-[13px] font-medium text-espresso-700 bg-sand-100 px-2 py-0.5 rounded">
          {formatPeriodMonth(payment.periodMonth)}
        </span>
      ),
      className: "whitespace-nowrap",
    },
    {
      content: (
        <span className="tabular-nums text-[14px] text-espresso-700">
          ${payment.amountDue.toLocaleString()}
        </span>
      ),
      className: "whitespace-nowrap text-right",
    },
    {
      content: payment.amountPaid > 0 ? (
        <span className="tabular-nums text-[14px] font-semibold text-espresso-900">
          ${payment.amountPaid.toLocaleString()}
        </span>
      ) : (
        <span className="text-espresso-300 text-[14px]">{s.notPaid}</span>
      ),
      className: "whitespace-nowrap text-right",
    },
    {
      content: payment.paidDate ? (
        <span className="text-[13px] text-muted-foreground tabular-nums">
          {formatDate(payment.paidDate)}
        </span>
      ) : (
        <span className="text-espresso-300 text-[13px]">{s.notPaid}</span>
      ),
      className: "whitespace-nowrap text-right",
    },
    {
      content: payment.method ? (
        <span className="text-[13px] text-muted-foreground">{payment.method}</span>
      ) : (
        <span className="text-espresso-300 text-[13px]">{s.notPaid}</span>
      ),
      className: "whitespace-nowrap text-right",
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
              className="inline-flex items-center h-8 px-4 rounded-full bg-coral-500 text-white text-[13px] font-medium hover:bg-coral-600 transition-colors"
            >
              {tenantActions.payButtonLabel}
            </button>
          </div>
        ) : null,
        className: "whitespace-nowrap text-right",
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
      className: "whitespace-nowrap text-right",
    },
  ];
}

export function PaymentHistoryTable({
  payments,
  loading,
  empty,
  emptyDescription,
  actions,
  tenantActions,
  flashStates,
}: Props) {
  if (loading) {
    return (
      <div className="rounded-xl border border-sand-400 bg-white overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="px-5 py-4 border-b border-sand-200 flex gap-4 items-center">
            {[70, 80, 80, 90, 100, 70].map((w, j) => (
              <Skeleton key={j} className={`h-3 w-[${w}px]`} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (payments.length === 0)
    return <EmptyState title={empty ?? "No payments recorded"} description={emptyDescription} icon="payment" />;

  const hasActions = !!actions;
  const hasTenantActions = !!tenantActions;
  const hasExtraCol = hasActions || hasTenantActions;

  const columns = [
    { label: s.colPeriod,  align: "left"  as const },
    { label: s.colDue,     align: "right" as const },
    { label: s.colPaid,    align: "right" as const },
    { label: s.colDate,    align: "right" as const },
    { label: s.colMethod,  align: "right" as const },
    { label: s.colStatus,  align: "right" as const },
    ...(hasExtraCol ? [{ label: "", align: "right" as const }] : []),
  ];

  return (
    <DataTable
      columns={columns}
      rows={payments.map((p) => ({
        key: p.id,
        urgent: p.status === "overdue",
        flashState: flashStates?.[p.periodMonth] ?? null,
        cells: buildRow(p, actions, tenantActions),
      }))}
    />
  );
}
