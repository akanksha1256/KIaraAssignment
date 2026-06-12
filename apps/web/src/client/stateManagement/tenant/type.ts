import type { FetchStateWithError } from "../../helpers/type";

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

export type TenantEntry = {
  fetchState: FetchStateWithError;
  data:       TenantProfile | null;
};

export type TenantState = {
  tenantDataById: Record<string, TenantEntry>;
};
