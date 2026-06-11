import type { RootState } from "../mainFile";
import { defaultFetchState } from "../../helpers/type";
import type { UnitDetailEntry } from "./type";

const defaultUnitEntry: UnitDetailEntry = {
  fetchState: defaultFetchState,
  units: [],
};

// Curried: useAppSelector(selectUnitsForProperty(propertyId))
export const selectUnitsForProperty =
  (propertyId: string) => (state: RootState) =>
    state.unit.unitsForPropertyById[propertyId] ?? defaultUnitEntry;
