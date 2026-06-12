import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Payment, PaymentSliceState } from "./type";
import { initialFetch, initialFetchMap } from "../../types";

const initialState: PaymentSliceState = {
  paymentsByLeaseId: initialFetchMap(),
  reminderState: initialFetch(),
  markPaidState: initialFetch(),
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    // ── Fetch payments ──────────────────────────────────────────────────────
    fetchTenantPayments: (state, action: PayloadAction<string>) => {
      state.paymentsByLeaseId[action.payload] = {
        data: state.paymentsByLeaseId[action.payload]?.data ?? null,
        loading: true,
        error: null,
      };
    },
    fetchTenantPaymentsSuccess: (
      state,
      action: PayloadAction<{ leaseId: string; payments: Payment[] }>,
    ) => {
      state.paymentsByLeaseId[action.payload.leaseId] = {
        data: action.payload.payments,
        loading: false,
        error: null,
      };
    },
    fetchTenantPaymentsFailure: (
      state,
      action: PayloadAction<{ leaseId: string; error: string }>,
    ) => {
      state.paymentsByLeaseId[action.payload.leaseId] = {
        data: state.paymentsByLeaseId[action.payload.leaseId]?.data ?? null,
        loading: false,
        error: action.payload.error,
      };
    },

    // ── Manager: send reminder ──────────────────────────────────────────────
    managerSendReminder: (
      state,
      _action: PayloadAction<{ leaseId: string; periodMonth: string }>,
    ) => {
      state.reminderState = { data: null, loading: true, error: null };
    },
    managerSendReminderSuccess: (
      state,
      action: PayloadAction<{ leaseId: string; payment: Payment }>,
    ) => {
      state.reminderState = {
        data: action.payload.payment,
        loading: false,
        error: null,
      };
      const list = state.paymentsByLeaseId[action.payload.leaseId]?.data;
      if (list) {
        const idx = list.findIndex(
          (p) => p.periodMonth === action.payload.payment.periodMonth,
        );
        if (idx !== -1) list[idx] = action.payload.payment;
      }
    },
    managerSendReminderFailure: (
      state,
      action: PayloadAction<{
        leaseId: string;
        periodMonth: string;
        error: string;
      }>,
    ) => {
      state.reminderState = {
        data: null,
        loading: false,
        error: action.payload.error,
      };
    },

    // ── Manager: mark as paid (optimistic) ─────────────────────────────────
    managerMarkPaid: (
      state,
      action: PayloadAction<{ leaseId: string; periodMonth: string }>,
    ) => {
      state.markPaidState = { data: null, loading: true, error: null };
      const list = state.paymentsByLeaseId[action.payload.leaseId]?.data;
      if (list) {
        const idx = list.findIndex(
          (p) => p.periodMonth === action.payload.periodMonth,
        );
        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            status: "paid",
            amountPaid: list[idx].amountDue,
            paidDate: new Date().toISOString(),
            method: "Directly to Manager",
          };
        }
      }
    },
    managerMarkPaidSuccess: (
      state,
      action: PayloadAction<{ leaseId: string; payment: Payment }>,
    ) => {
      state.markPaidState = {
        data: action.payload.payment,
        loading: false,
        error: null,
      };
      const list = state.paymentsByLeaseId[action.payload.leaseId]?.data;
      if (list) {
        const idx = list.findIndex(
          (p) => p.periodMonth === action.payload.payment.periodMonth,
        );
        if (idx !== -1) list[idx] = action.payload.payment;
      }
    },
    managerMarkPaidFailure: (
      state,
      action: PayloadAction<{
        leaseId: string;
        periodMonth: string;
        error: string;
      }>,
    ) => {
      state.markPaidState = {
        data: null,
        loading: false,
        error: action.payload.error,
      };
      const list = state.paymentsByLeaseId[action.payload.leaseId]?.data;
      if (list) {
        const idx = list.findIndex(
          (p) => p.periodMonth === action.payload.periodMonth,
        );
        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            status: "outstanding",
            amountPaid: 0,
            paidDate: null,
          };
        }
      }
    },
  },
});

export const paymentReducer = paymentSlice.reducer;
export const {
  fetchTenantPayments,
  fetchTenantPaymentsSuccess,
  fetchTenantPaymentsFailure,
  managerSendReminder,
  managerSendReminderSuccess,
  managerSendReminderFailure,
  managerMarkPaid,
  managerMarkPaidSuccess,
  managerMarkPaidFailure,
} = paymentSlice.actions;
