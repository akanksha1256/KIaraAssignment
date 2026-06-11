import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ManagerDashboardData } from "@repo/types";
import { type FetchState, initialFetch } from "../types";

interface ManagerState {
  dashboard: FetchState<ManagerDashboardData>;
}

const initialState: ManagerState = {
  dashboard: initialFetch(),
};

const managerSlice = createSlice({
  name: "manager",
  initialState,
  reducers: {
    fetchManagerDashboard: (state) => {
      state.dashboard = { data: null, loading: true, error: null };
    },
    fetchManagerDashboardSuccess: (state, action: PayloadAction<ManagerDashboardData>) => {
      state.dashboard = { data: action.payload, loading: false, error: null };
    },
    fetchManagerDashboardFailure: (state, action: PayloadAction<string>) => {
      state.dashboard = { data: null, loading: false, error: action.payload };
    },
  },
});

export const managerReducer = managerSlice.reducer;
export const {
  fetchManagerDashboard,
  fetchManagerDashboardSuccess,
  fetchManagerDashboardFailure,
} = managerSlice.actions;
