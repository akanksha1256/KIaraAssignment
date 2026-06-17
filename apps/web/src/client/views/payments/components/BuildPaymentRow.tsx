import { Badge, RowMenu, BodyText, MutedText, Button } from "@repo/ui";
import type { TableCell } from "@repo/ui";
import { formatDate, formatPeriodMonth } from "@repo/ui";
import { strings } from "@repo/tokens";
import type { Payment, PaymentTableActions, TenantPaymentActions } from "@repo/data";
import { PaymentStatusValues } from "@repo/data";
import { getStatusLabel } from "../helper";
import { formatDateTime, hoursSince } from "@repo/ui";

const s = strings.paymentTable;

const STATUS_RANK: Record<string, number> = {
  [PaymentStatusValues.OVERDUE]: 0,
  [PaymentStatusValues.OUTSTANDING]: 1,
  [PaymentStatusValues.PAID]: 2,
};

export const buildPaymentRow = (
  payment: Payment,
  actions?: PaymentTableActions,
  tenantActions?: TenantPaymentActions,
): TableCell[] => {
  const statusLabel = getStatusLabel(payment.status);

  const statusCell: TableCell = {
    content: (
      <div className="flex justify-end">
        <Badge variant={payment.status}>{statusLabel}</Badge>
      </div>
    ),
    className: "whitespace-nowrap text-right",
  };

  const baseCells: TableCell[] = [
    {
      content: (
        <MutedText className="text-espresso-700 font-medium font-mono bg-sand-100 px-2 py-0.5 rounded inline-block">
          {formatPeriodMonth(payment.periodMonth)}
        </MutedText>
      ),
      className: "whitespace-nowrap",
      sortValue: payment.periodMonth,
    },
    {
      content: (
        <BodyText className="tabular-nums inline-block">
          ${payment.amountDue.toLocaleString()}
        </BodyText>
      ),
      className: "whitespace-nowrap text-right",
      sortValue: payment.amountDue,
    },
    {
      content: payment.paidDate ? (
        <MutedText className="tabular-nums">{formatDate(payment.paidDate)}</MutedText>
      ) : (
        <MutedText className="text-espresso-500">{s.notPaid}</MutedText>
      ),
      className: "whitespace-nowrap text-right",
      sortValue: payment.paidDate ?? "",
    },
    {
      content: payment.method ? (
        <MutedText>{payment.method}</MutedText>
      ) : (
        <MutedText className="text-espresso-500">{s.notPaid}</MutedText>
      ),
      className: "whitespace-nowrap text-right",
      sortValue: payment.method ?? "",
    },
    { ...statusCell, sortValue: STATUS_RANK[payment.status] ?? 99 },
  ];

  if (!actions && tenantActions) {
    const canPay =
      payment.status === PaymentStatusValues.OUTSTANDING ||
      payment.status === PaymentStatusValues.OVERDUE;
    return [
      ...baseCells,
      {
        content: canPay ? (
          <div className="flex justify-end">
            <Button size="sm" onClick={() => tenantActions.onPayRent(payment.periodMonth)}>
              {tenantActions.payButtonLabel}
            </Button>
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

  const reminderWithin24h = !!payment.lastRemindedOn && hoursSince(payment.lastRemindedOn) < 24;
  const reminderSublabel =
    reminderWithin24h && payment.lastRemindedOn
      ? `${s.actions.lastReminderSent} ${formatDateTime(payment.lastRemindedOn)}`
      : undefined;

  const menuItems =
    payment.status === PaymentStatusValues.PAID
      ? []
      : [
          ...(payment.status === PaymentStatusValues.OVERDUE
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
};
