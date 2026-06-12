import type { FetchState, FetchStateMap } from "../types";

export type PaymentStatus = "paid" | "outstanding" | "overdue";

export interface Payment {
  id: string;
  leaseId: string;
  periodMonth: string;
  amountDue: number;
  amountPaid: number;
  status: PaymentStatus;
  paidDate: string | null;
  method: string | null;
  lastRemindedOn: string | null;
}

export interface PaymentMethod {
  id: string;
  tenantId: string;
  label: string;
}

export type PaymentSliceState = {
  paymentsByLeaseId:        FetchStateMap<Payment[]>;
  paymentMethodsByTenantId: FetchStateMap<PaymentMethod[]>;
  payRent:                  FetchState<Payment>;
  addMethod:                FetchState<PaymentMethod>;
  reminderState:            FetchState<Payment>;
  markPaidState:            FetchState<Payment>;
};
