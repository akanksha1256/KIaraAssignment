import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  ManagerDashboardData,
  DashboardStats,
  PaymentBreakdown,
  MonthlyRevenue,
} from "./type";
import {
  defaultFetchState,
  type FetchStateWithError,
} from "../../../helpers/type";

interface ManagerState {
  dashboardFetchState: FetchStateWithError;
  stats: DashboardStats | null;
  paymentBreakdown: PaymentBreakdown | null;
  monthlyRevenue: MonthlyRevenue[];
}

const initialState: ManagerState = {
  dashboardFetchState: defaultFetchState,
  stats: null,
  paymentBreakdown: null,
  monthlyRevenue: [],
};

const managerSlice = createSlice({
  name: "manager",
  initialState,
  reducers: {
    fetchManagerDashboard: (state) => {
      state.dashboardFetchState = { status: "pending", error: null };
    },
    fetchManagerDashboardSuccess: (
      state,
      action: PayloadAction<ManagerDashboardData>,
    ) => {
      state.dashboardFetchState = { status: "completed", error: null };
      state.stats = action.payload.stats;
      state.paymentBreakdown = action.payload.paymentBreakdown;
      state.monthlyRevenue = action.payload.monthlyRevenue;
    },
    fetchManagerDashboardFailure: (state, action: PayloadAction<string>) => {
      state.dashboardFetchState = { status: "failed", error: action.payload };
    },
  },
});

export const managerReducer = managerSlice.reducer;
export const {
  fetchManagerDashboard,
  fetchManagerDashboardSuccess,
  fetchManagerDashboardFailure,
} = managerSlice.actions;
