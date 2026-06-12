import type { FetchState, FetchStateMap } from "../types";
import type { Lease } from "../lease/type";
import type { Payment, PaymentMethod } from "../payment/type";

export type KycStatus = "verified" | "pending" | "not_submitted";

export interface Tenant {
  id:            string;
  name:          string;
  contact:       string;
  email:         string;
  kycStatus:     KycStatus;
  kycVerifiedOn: string | null;
  kycDocument:   string | null;
}

export interface TenantStanding {
  totalPayments:  number;
  onTimePayments: number;
  score:          number;
  label:          "Excellent" | "Good" | "Fair" | "Poor";
}

export interface TenantProfile {
  tenant:   Tenant;
  lease:    import("../lease/type").Lease       | null;
  unit:     import("../unit/type").Unit         | null;
  property: import("../property/type").Property | null;
  payments: import("../payment/type").Payment[];
  standing: TenantStanding | null;
}

export type TenantState = {
  detail:         FetchStateMap<Tenant>;
  lease:          FetchStateMap<Lease>;
  payments:       FetchStateMap<Payment[]>;
  paymentMethods: FetchStateMap<PaymentMethod[]>;
  payRent:        FetchState<Payment>;
  addMethod:      FetchState<PaymentMethod>;
  reminderState:  FetchState<{ leaseId: string; periodMonth: string }>;
  markPaidState:  FetchState<Payment>;
  profile:        FetchStateMap<TenantProfile>;
};
