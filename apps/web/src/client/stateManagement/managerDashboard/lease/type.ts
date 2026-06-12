import type { FetchStateMap } from "../../types";

export interface Lease {
  id: string;
  unitId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  terms: string;
  leaseDocument: string | null;
}

export type LeaseState = {
  leaseById: FetchStateMap<Lease>;
};
