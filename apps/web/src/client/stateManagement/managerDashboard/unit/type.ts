import type { FetchStateWithError } from "../../../helpers/type";
import type { UnitDetailItem } from "../property/type";

export type { UnitDetailItem };

export interface Unit {
  id: string;
  propertyId: string;
  label: string;
}

export type UnitDetailEntry = {
  fetchState: FetchStateWithError;
  units: UnitDetailItem[];
};

export type UnitState = {
  unitFetchState: FetchStateWithError;
  unitList: Unit[];
  unitsForPropertyById: Record<string, UnitDetailEntry>;
};
