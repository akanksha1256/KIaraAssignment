import type { PropertySummary } from "@repo/types";
import type { FetchStateWithError } from "../../helpers/type";

export type PropertyState = {
  propertyListfetchState: FetchStateWithError;
  propertiesList: PropertySummary[];
};
