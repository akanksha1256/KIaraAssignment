import type { FetchStateWithError } from "../../helpers/type";
import type { Tenant } from "../tenant/type";
import type { Lease } from "../lease/type";
import type { PaymentStatus } from "../payment/type";

export type PropertyStatus = "paid" | "outstanding" | "overdue" | "vacant";

export interface Property {
  id:             string;
  name:           string;
  address:        string;
  managerName:    string;
  managerEmail:   string;
  managerContact: string;
}

export interface PropertySummary {
  id: string;
  name: string;
  address: string;
  unitCount: number;
  leasedCount: number;
  totalRent: number;
  status: PropertyStatus;
}

export interface UnitDetailItem {
  id: string;
  label: string;
  tenant: Tenant | null;
  lease: Lease | null;
  paymentStatus: PropertyStatus;
}

export interface PropertyDetailData {
  property: Property;
  units: UnitDetailItem[];
}

export type PropertyDetailEntry = {
  fetchState: FetchStateWithError;
  property: Property | null;
};

export type PropertyState = {
  propertyListfetchState: FetchStateWithError;
  propertiesList: PropertySummary[];
  propertyDetailById: Record<string, PropertyDetailEntry>;
};
