import type { Payment, PaymentStatus } from "@repo/platform-types";

/** Rent is due on the 1st of each month. */
const DUE_DATE = 1;
/** Tenant has a 4-day grace window (1st–5th) before the payment becomes overdue. */
const GRACE_DAYS = 4;

const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** Last day of the grace window (inclusive) for a period month — the 20th. */
export const getDueWindowEnd = (periodMonth: string): Date => {
  const [year, month] = periodMonth.split("-").map(Number);
  return new Date(year, month - 1, DUE_DATE + GRACE_DAYS);
};

/** True when today is past the grace window (i.e. from the 21st onward). */
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
