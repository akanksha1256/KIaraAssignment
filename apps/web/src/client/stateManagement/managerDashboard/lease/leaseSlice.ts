import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Lease, LeaseState } from "./type";

const initialState: LeaseState = {
  leaseById: {},
};

const leaseSlice = createSlice({
  name: "lease",
  initialState,
  reducers: {
    fetchLease: (state, action: PayloadAction<string>) => {
      state.leaseById[action.payload] = { data: null, loading: true, error: null };
    },
    fetchLeaseSuccess: (state, action: PayloadAction<Lease>) => {
      state.leaseById[action.payload.id] = {
        data: action.payload,
        loading: false,
        error: null,
      };
    },
    fetchLeaseFailure: (
      state,
      action: PayloadAction<{ id: string; error: string }>,
    ) => {
      state.leaseById[action.payload.id] = {
        data: null,
        loading: false,
        error: action.payload.error,
      };
    },
  },
});

export const leaseReducer = leaseSlice.reducer;
export const { fetchLease, fetchLeaseSuccess, fetchLeaseFailure } =
  leaseSlice.actions;
