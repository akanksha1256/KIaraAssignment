import type { RootState } from "../mainFile";
import { defaultFetchState } from "../../helpers/type";
import type { PropertyDetailEntry } from "./type";

const defaultDetailEntry: PropertyDetailEntry = {
  fetchState: defaultFetchState,
  property:   null,
};

export const selectPropertiesList = (state: RootState) => ({
  status:     state.property.propertyListfetchState.status,
  error:      state.property.propertyListfetchState.error,
  properties: state.property.propertiesList,
});

// Curried so the component passes the id: useAppSelector(selectPropertyDetailById(id))
export const selectPropertyDetailById =
  (id: string) =>
  (state: RootState) =>
    state.property.propertyDetailById[id] ?? defaultDetailEntry;
