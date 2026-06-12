import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { TenantDashboardData, TenantDashboardState } from "./type";

const initialState: TenantDashboardState = {
  dashboardById: {},
};

const tenantDashboardSlice = createSlice({
  name: "tenantDashboard",
  initialState,
  reducers: {
    fetchTenantDashboard: (state, action: PayloadAction<string>) => {
      state.dashboardById[action.payload] = {
        fetchState: { status: "pending", error: null },
        data: state.dashboardById[action.payload]?.data ?? null,
      };
    },
    fetchTenantDashboardSuccess: (
      state,
      action: PayloadAction<{ id: string; data: TenantDashboardData }>,
    ) => {
      state.dashboardById[action.payload.id] = {
        fetchState: { status: "completed", error: null },
        data: action.payload.data,
      };
    },
    fetchTenantDashboardFailure: (
      state,
      action: PayloadAction<{ id: string; error: string }>,
    ) => {
      state.dashboardById[action.payload.id] = {
        fetchState: { status: "failed", error: action.payload.error },
        data: state.dashboardById[action.payload.id]?.data ?? null,
      };
    },
  },
});

export const tenantDashboardReducer = tenantDashboardSlice.reducer;
export const {
  fetchTenantDashboard,
  fetchTenantDashboardSuccess,
  fetchTenantDashboardFailure,
} = tenantDashboardSlice.actions;
