import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PropertySummary } from "@repo/types";
import { defaultFetchState } from "../../helpers/type";
import type { PropertyState } from "./type";

const initialState: PropertyState = {
  propertyListfetchState: defaultFetchState,
  propertiesList: [],
};

const propertySlice = createSlice({
  name: "property",
  initialState,
  reducers: {
    fetchPropertiesSummary: (state) => {
      state.propertyListfetchState = { status: "pending", error: null };
    },
    fetchPropertiesSummarySuccess: (
      state,
      action: PayloadAction<PropertySummary[]>,
    ) => {
      state.propertyListfetchState = { status: "completed", error: null };
      state.propertiesList = action.payload;
    },
    fetchPropertiesSummaryFailure: (state, action: PayloadAction<string>) => {
      state.propertyListfetchState = {
        status: "failed",
        error: action.payload,
      };
    },
    clearState: (state) => {
      state.propertyListfetchState = defaultFetchState;
      state.propertiesList = [];
    },
  },
});

export const propertyReducer = propertySlice.reducer;
export const {
  fetchPropertiesSummary,
  fetchPropertiesSummarySuccess,
  fetchPropertiesSummaryFailure,
  clearState,
} = propertySlice.actions;
