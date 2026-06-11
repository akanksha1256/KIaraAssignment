import type { Tenant, Lease, Payment, PaymentMethod } from "@/platform/types";
import type { FetchState, FetchStateMap } from "../types";

export type TenantState = {
  detail:         FetchStateMap<Tenant>;
  lease:          FetchStateMap<Lease>;
  payments:       FetchStateMap<Payment[]>;
  paymentMethods: FetchStateMap<PaymentMethod[]>;
  payRent:        FetchState<Payment>;
  addMethod:      FetchState<PaymentMethod>;
};
