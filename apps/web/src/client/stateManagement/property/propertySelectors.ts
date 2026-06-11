import type { RootState } from "../mainFile";

export const selectPropertiesList = (state: RootState) => ({
  status:     state.property.propertyListfetchState.status,
  error:      state.property.propertyListfetchState.error,
  properties: state.property.propertiesList,
});

export const selectPropertyDetail = (state: RootState) => ({
  status:   state.property.propertyDetailFetchState.status,
  error:    state.property.propertyDetailFetchState.error,
  property: state.property.selectedProperty,
  units:    state.property.selectedPropertyUnits,
});
