import type { PaymentStatus } from "@repo/data";
import { PaymentStatusValues } from "@repo/data";

export const getStatusVariant = (status: PaymentStatus): "paid" | "overdue" | "outstanding" =>
  status === PaymentStatusValues.PAID
    ? "paid"
    : status === PaymentStatusValues.OVERDUE
      ? "overdue"
      : "outstanding";

export const getStatusLabel = (status: PaymentStatus): string =>
  status === PaymentStatusValues.PAID
    ? "Paid"
    : status === PaymentStatusValues.OVERDUE
      ? "Overdue"
      : "Outstanding";
