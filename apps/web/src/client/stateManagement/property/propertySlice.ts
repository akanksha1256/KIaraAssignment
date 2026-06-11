import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  PropertySummary,
  PropertyDetailData,
  Property,
  UnitDetailItem,
} from "./type";
import { defaultFetchState } from "../../helpers/type";
import type { PropertyState } from "./type";

const initialState: PropertyState = {
  propertyListfetchState: defaultFetchState,
  propertiesList: [],
  propertyDetailFetchState: defaultFetchState,
  selectedProperty: null,
  selectedPropertyUnits: [],
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
    fetchPropertyById: (state, _action: PayloadAction<string>) => {
      state.propertyDetailFetchState = { status: "pending", error: null };
      state.selectedProperty = null;
      state.selectedPropertyUnits = [];
    },
    fetchPropertyByIdSuccess: (
      state,
      action: PayloadAction<PropertyDetailData>,
    ) => {
      state.propertyDetailFetchState = { status: "completed", error: null };
      state.selectedProperty = action.payload.property;
      state.selectedPropertyUnits = action.payload.units;
    },
    fetchPropertyByIdFailure: (state, action: PayloadAction<string>) => {
      state.propertyDetailFetchState = {
        status: "failed",
        error: action.payload,
      };
    },
    clearState: (state) => {
      state.propertyListfetchState = defaultFetchState;
      state.propertiesList = [];
      state.propertyDetailFetchState = defaultFetchState;
      state.selectedProperty = null;
      state.selectedPropertyUnits = [];
    },
  },
});

export const propertyReducer = propertySlice.reducer;
export const {
  fetchPropertiesSummary,
  fetchPropertiesSummarySuccess,
  fetchPropertiesSummaryFailure,
  fetchPropertyById,
  fetchPropertyByIdSuccess,
  fetchPropertyByIdFailure,
  clearState,
} = propertySlice.actions;
