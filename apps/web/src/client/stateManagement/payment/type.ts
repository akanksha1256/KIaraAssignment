import type { FetchStateWithError } from "../../helpers/type";

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
}

export interface PaymentMethod {
  id: string;
  tenantId: string;
  label: string;
}

export type PaymentState = {
  paymentFetchState: FetchStateWithError;
  paymentList: Payment[];
  paymentMethods: PaymentMethod[];
};
