import type { RootState } from "../../mainFile";
import { defaultFetchState } from "../../../helpers/type";
import type { UnitDetailEntry } from "./type";

const defaultUnitEntry: UnitDetailEntry = {
  fetchState: defaultFetchState,
  units: [],
};

// Curried: useAppSelector(selectUnitsForProperty(propertyId))
export const selectUnitsForProperty =
  (propertyId: string) => (state: RootState) =>
    state.unit.unitsForPropertyById[propertyId] ?? defaultUnitEntry;

// Curried: useAppSelector(selectUnitById(propertyId, unitId))
export const selectUnitById =
  (propertyId: string, unitId: string) => (state: RootState) => {
    const entry =
      state.unit.unitsForPropertyById[propertyId] ?? defaultUnitEntry;
    return {
      fetchState: entry.fetchState,
      unit: entry.units.find((u) => u.id === unitId) ?? null,
    };
  };
