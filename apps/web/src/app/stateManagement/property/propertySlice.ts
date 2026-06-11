import { createSlice } from "@reduxjs/toolkit";

import type { PropertyState } from "./type";
import { defaultFetchState } from "../../../../../client/helpers/type";

const initialState: PropertyState = {
  propertyListfetchState: defaultFetchState,
  propertiesList: [],
};

const managerSlice = createSlice({
  name: "manager",
  initialState,
  reducers: {
    fetchPropertiesSummary: (state) => {
      state.propertyListfetchState.status = "pending";
    },
    fetchPropertiesSummarySuccess: (state) => {
      state.propertyListfetchState.status = "Completed";
    },
    fetchPropertiesSummaryFailure: (state) => {
      state.propertyListfetchState.status = "Failed";
    },
    clearState: (state) => {
      state.propertyListfetchState = defaultFetchState;
      state.propertiesList = [];
    },
  },
});

export const managerReducer = managerSlice.reducer;
export const {
  fetchPropertiesSummary,
  fetchPropertiesSummarySuccess,
  fetchPropertiesSummaryFailure,
} = managerSlice.actions;
