import { FetchStateWithError } from "../../helpers/type";

export interface Tenant {
  id: string;
  name: string;
  contact: string;
}

export type TenantState = {
  tenantFetchState: FetchStateWithError;
  tenantList: Tenant[];
};
