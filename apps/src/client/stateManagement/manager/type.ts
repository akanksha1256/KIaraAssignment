import type { PropertySummary } from "@repo/types";
import type { FetchState } from "../types";

export interface ManagerState {
  propertiesSummary: FetchState<PropertySummary[]>;
}
