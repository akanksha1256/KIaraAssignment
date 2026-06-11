import type { PropertySummary } from "@/platform/types";
import type { FetchStateWithError } from "../../helpers/type";

export type PropertyState = {
  propertyListfetchState: FetchStateWithError;
  propertiesList: PropertySummary[];
};
