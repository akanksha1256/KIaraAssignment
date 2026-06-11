import type { FetchStateWithError } from "../../helpers/type";

export type PropertyStatus = "paid" | "outstanding" | "overdue" | "vacant";

export interface Property {
  id:      string;
  name:    string;
  address: string;
}

export interface PropertySummary {
  id:          string;
  name:        string;
  address:     string;
  unitCount:   number;
  leasedCount: number;
  totalRent:   number;
  status:      PropertyStatus;
}

export type PropertyState = {
  propertyListfetchState: FetchStateWithError;
  propertiesList:         PropertySummary[];
};
