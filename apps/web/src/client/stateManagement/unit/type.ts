import type { FetchStateWithError } from "../../helpers/type";

export interface Unit {
  id:         string;
  propertyId: string;
  label:      string;
}

export type UnitState = {
  unitFetchState: FetchStateWithError;
  unitList:       Unit[];
};
