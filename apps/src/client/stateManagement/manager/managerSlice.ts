import { createSlice, createAction } from "@reduxjs/toolkit";
import type { PropertySummary } from "@repo/types";
import { type FetchState, initialFetch } from "../types";
import type { ManagerState } from "./type";

// ── State ─────────────────────────────────────────────────────────────────────

const initialState: ManagerState = {
  propertiesSummary: initialFetch(),
};

// ── Actions ───────────────────────────────────────────────────────────────────

export const fetchPropertiesSummary = createAction(
  "manager/fetchPropertiesSummary",
);
export const fetchPropertiesSummarySuccess = createAction<PropertySummary[]>(
  "manager/fetchPropertiesSummarySuccess",
);
export const fetchPropertiesSummaryFailure = createAction<string>(
  "manager/fetchPropertiesSummaryFailure",
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const managerSlice = createSlice({
  name: "manager",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPropertiesSummary, (state) => {
        state.propertiesSummary.loading = true;
        state.propertiesSummary.error = null;
      })
      .addCase(fetchPropertiesSummarySuccess, (state, action) => {
        state.propertiesSummary.loading = false;
        state.propertiesSummary.data = action.payload;
      })
      .addCase(fetchPropertiesSummaryFailure, (state, action) => {
        state.propertiesSummary.loading = false;
        state.propertiesSummary.error = action.payload;
      });
  },
});

export const managerReducer = managerSlice.reducer;
