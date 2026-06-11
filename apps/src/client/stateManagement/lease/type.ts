import { FetchStateWithError } from "../../helpers/type";

export interface Lease {
  id: string;
  unitId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  terms: string;
}

export type LeaseState = {
  leaseFetchState: FetchStateWithError;
  leaseList: Lease[];
};
