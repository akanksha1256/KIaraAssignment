import type { Payment, PaymentStatus } from "@repo/platform-types";

const DUE_DAY = 5;

const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** Last calendar day of the rent due window (inclusive) for a period month. */
export const getDueWindowEnd = (periodMonth: string): Date => {
  const [year, month] = periodMonth.split("-").map(Number);
  return new Date(year, month - 1, DUE_DAY);
};

/** True when today is past the due window (i.e. from the 6th onward). */
export const isOverdue = (periodMonth: string, now: Date = new Date()): boolean =>
  startOfDay(now) > startOfDay(getDueWindowEnd(periodMonth));

/** Whole days past the due window end; 0 while still within the due window. */
export const daysOverdue = (periodMonth: string, now: Date = new Date()): number => {
  if (!isOverdue(periodMonth, now)) return 0;
  const dueEnd = startOfDay(getDueWindowEnd(periodMonth));
  const today = startOfDay(now);
  return Math.floor((today.getTime() - dueEnd.getTime()) / (1000 * 60 * 60 * 24));
};

export const resolvePaymentStatus = (
  payment: Pick<Payment, "status" | "amount_paid" | "amount_due" | "period_month">,
  now: Date = new Date(),
): PaymentStatus => {
  if (payment.status === "paid" || payment.amount_paid >= payment.amount_due) return "paid";
  return isOverdue(payment.period_month, now) ? "overdue" : "outstanding";
};

export const withResolvedStatus = (payment: Payment, now?: Date): Payment => ({
  ...payment,
  status: resolvePaymentStatus(payment, now),
});

export const resolvePayments = (payments: Payment[], now?: Date): Payment[] =>
  payments.map((p) => withResolvedStatus(p, now));
