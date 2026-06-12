import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { defaultFetchState } from "../../../helpers/type";
import { fetchPropertyById } from "../property/propertySlice";
import type { UnitDetailItem } from "../property/type";
import type { UnitState } from "./type";

const initialState: UnitState = {
  unitFetchState: defaultFetchState,
  unitList: [],
  unitsForPropertyById: {},
};

const unitSlice = createSlice({
  name: "unit",
  initialState,
  reducers: {
    fetchUnitsForPropertySuccess: (
      state,
      action: PayloadAction<{ propertyId: string; units: UnitDetailItem[] }>,
    ) => {
      const { propertyId, units } = action.payload;
      state.unitsForPropertyById[propertyId] = {
        fetchState: { status: "completed", error: null },
        units,
      };
    },
    fetchUnitsForPropertyFailure: (
      state,
      action: PayloadAction<{ propertyId: string; error: string }>,
    ) => {
      const { propertyId, error } = action.payload;
      state.unitsForPropertyById[propertyId] = {
        fetchState: { status: "failed", error },
        units: state.unitsForPropertyById[propertyId]?.units ?? [],
      };
    },
    clearUnitsForProperty: (state, action: PayloadAction<string>) => {
      delete state.unitsForPropertyById[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPropertyById, (state, action) => {
      const id = action.payload;
      state.unitsForPropertyById[id] = {
        fetchState: { status: "pending", error: null },
        units: state.unitsForPropertyById[id]?.units ?? [],
      };
    });
  },
});

export const unitReducer = unitSlice.reducer;
export const {
  fetchUnitsForPropertySuccess,
  fetchUnitsForPropertyFailure,
  clearUnitsForProperty,
} = unitSlice.actions;
