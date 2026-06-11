import type { RootState } from "../mainFile";

export const selectPropertiesList = (state: RootState) => ({
  status:     state.property.propertyListfetchState.status,
  error:      state.property.propertyListfetchState.error,
  properties: state.property.propertiesList,
});
