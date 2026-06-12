import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { TenantDashboardData, TenantDashboardState } from "./type";
import { tenantPayRentSuccess } from "../managerDashboard/payment/paymentSlice";

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
  extraReducers: (builder) => {
    builder.addCase(tenantPayRentSuccess, (state, action) => {
      for (const entry of Object.values(state.dashboardById)) {
        if (!entry.data) continue;
        const idx = entry.data.payments.findIndex(
          (p) => p.periodMonth === action.payload.payment.periodMonth,
        );
        if (idx !== -1) {
          entry.data.payments[idx] = action.payload.payment;
        }
      }
    });
  },
});

export const tenantDashboardReducer = tenantDashboardSlice.reducer;
export const {
  fetchTenantDashboard,
  fetchTenantDashboardSuccess,
  fetchTenantDashboardFailure,
} = tenantDashboardSlice.actions;
