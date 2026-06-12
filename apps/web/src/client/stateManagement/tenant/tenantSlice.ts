import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { TenantProfile, TenantState } from "./type";
import { defaultFetchState } from "../../helpers/type";

const initialState: TenantState = {
  tenantDataById: {},
};

const tenantSlice = createSlice({
  name: "tenant",
  initialState,
  reducers: {
    fetchTenantProfile: (state, action: PayloadAction<string>) => {
      state.tenantDataById[action.payload] = {
        fetchState: { status: "pending", error: null },
        data: state.tenantDataById[action.payload]?.data ?? null,
      };
    },
    fetchTenantProfileSuccess: (
      state,
      action: PayloadAction<{ id: string; profile: TenantProfile }>,
    ) => {
      state.tenantDataById[action.payload.id] = {
        fetchState: { status: "completed", error: null },
        data: action.payload.profile,
      };
    },
    fetchTenantProfileFailure: (
      state,
      action: PayloadAction<{ id: string; error: string }>,
    ) => {
      state.tenantDataById[action.payload.id] = {
        fetchState: { status: "failed", error: action.payload.error },
        data: state.tenantDataById[action.payload.id]?.data ?? null,
      };
    },
  },
});

export const tenantReducer = tenantSlice.reducer;
export const {
  fetchTenantProfile,
  fetchTenantProfileSuccess,
  fetchTenantProfileFailure,
} = tenantSlice.actions;
