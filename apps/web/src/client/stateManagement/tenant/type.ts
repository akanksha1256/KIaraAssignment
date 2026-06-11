import type { FetchState, FetchStateMap } from "../types";
import type { Lease } from "../lease/type";
import type { Payment, PaymentMethod } from "../payment/type";

export interface Tenant {
  id:      string;
  name:    string;
  contact: string;
}

export interface TenantStanding {
  totalPayments:  number;
  onTimePayments: number;
  score:          number;
  label:          "Excellent" | "Good" | "Fair" | "Poor";
}

export type TenantState = {
  detail:         FetchStateMap<Tenant>;
  lease:          FetchStateMap<Lease>;
  payments:       FetchStateMap<Payment[]>;
  paymentMethods: FetchStateMap<PaymentMethod[]>;
  payRent:        FetchState<Payment>;
  addMethod:      FetchState<PaymentMethod>;
};
