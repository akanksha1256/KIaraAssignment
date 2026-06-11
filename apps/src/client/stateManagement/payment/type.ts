import { FetchStateWithError } from "../../helpers/type";

export interface Payment {
  id: string;
  leaseId: string;
  periodMonth: string;
  amountDue: number;
  amountPaid: number;
  status: "paid" | "overdue" | "outstanding";
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
