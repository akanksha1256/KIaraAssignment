import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PropertySummary, Property, PropertyDetailEntry } from "./type";
import { defaultFetchState } from "../../helpers/type";
import type { PropertyState } from "./type";

const initialState: PropertyState = {
  propertyListfetchState: defaultFetchState,
  propertiesList:         [],
  propertyDetailById:     {},
};

const propertySlice = createSlice({
  name: "property",
  initialState,
  reducers: {
    fetchPropertiesSummary: (state) => {
      state.propertyListfetchState = { status: "pending", error: null };
    },
    fetchPropertiesSummarySuccess: (state, action: PayloadAction<PropertySummary[]>) => {
      state.propertyListfetchState = { status: "completed", error: null };
      state.propertiesList = action.payload;
    },
    fetchPropertiesSummaryFailure: (state, action: PayloadAction<string>) => {
      state.propertyListfetchState = { status: "failed", error: action.payload };
    },

    fetchPropertyById: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.propertyDetailById[id] = {
        fetchState: { status: "pending", error: null },
        property:   state.propertyDetailById[id]?.property ?? null,
      };
    },
    fetchPropertyByIdSuccess: (
      state,
      action: PayloadAction<{ id: string; property: Property }>,
    ) => {
      const { id, property } = action.payload;
      state.propertyDetailById[id] = {
        fetchState: { status: "completed", error: null },
        property,
      };
    },
    fetchPropertyByIdFailure: (
      state,
      action: PayloadAction<{ id: string; error: string }>,
    ) => {
      const { id, error } = action.payload;
      state.propertyDetailById[id] = {
        fetchState: { status: "failed", error },
        property:   state.propertyDetailById[id]?.property ?? null,
      };
    },

    clearState: (state) => {
      state.propertyListfetchState = defaultFetchState;
      state.propertiesList         = [];
      state.propertyDetailById     = {};
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
