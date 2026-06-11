import type { Tenant, Lease, Payment, PaymentMethod } from "@repo/types";
import type { FetchState, FetchStateMap } from "../types";

export interface TenantState {
  detail:         FetchStateMap<Tenant>;
  lease:          FetchStateMap<Lease>;
  payments:       FetchStateMap<Payment[]>;
  paymentMethods: FetchStateMap<PaymentMethod[]>;
  payRent:        FetchState<Payment>;
  addMethod:      FetchState<PaymentMethod>;
}
