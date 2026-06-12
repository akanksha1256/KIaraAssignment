import type { FetchStateWithError } from "../../helpers/type";
import type { Lease } from "../managerDashboard/lease/type";
import type { Unit } from "../managerDashboard/unit/type";
import type { Property } from "../managerDashboard/property/type";

export interface TenantDashboardData {
  tenantId:   string;
  tenantName: string;
  lease:      Lease    | null;
  unit:       Unit     | null;
  property:   Property | null;
}

export type TenantDashboardEntry = {
  fetchState: FetchStateWithError;
  data:       TenantDashboardData | null;
};

export type TenantDashboardState = {
  dashboardById: Record<string, TenantDashboardEntry>;
};
