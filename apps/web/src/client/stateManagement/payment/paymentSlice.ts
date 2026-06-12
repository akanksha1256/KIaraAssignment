import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Payment, PaymentMethod, PaymentSliceState } from "./type";
import { initialFetch, initialFetchMap } from "../types";

const initialState: PaymentSliceState = {
  paymentsByLeaseId:        initialFetchMap(),
  paymentMethodsByTenantId: initialFetchMap(),
  payRent:                  initialFetch(),
  addMethod:                initialFetch(),
  reminderState:            initialFetch(),
  markPaidState:            initialFetch(),
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    // ── Fetch payments ──────────────────────────────────────────────────────
    fetchTenantPayments: (state, action: PayloadAction<string>) => {
      state.paymentsByLeaseId[action.payload] = {
        data: null,
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
        data: null,
        loading: false,
        error: action.payload.error,
      };
    },

    // ── Fetch payment methods ───────────────────────────────────────────────
    fetchPaymentMethods: (state, action: PayloadAction<string>) => {
      state.paymentMethodsByTenantId[action.payload] = {
        data: null,
        loading: true,
        error: null,
      };
    },
    fetchPaymentMethodsSuccess: (
      state,
      action: PayloadAction<{ tenantId: string; methods: PaymentMethod[] }>,
    ) => {
      state.paymentMethodsByTenantId[action.payload.tenantId] = {
        data: action.payload.methods,
        loading: false,
        error: null,
      };
    },
    fetchPaymentMethodsFailure: (
      state,
      action: PayloadAction<{ tenantId: string; error: string }>,
    ) => {
      state.paymentMethodsByTenantId[action.payload.tenantId] = {
        data: null,
        loading: false,
        error: action.payload.error,
      };
    },

    // ── Tenant pay rent (optimistic) ────────────────────────────────────────
    tenantPayRent: (
      state,
      action: PayloadAction<{
        leaseId: string;
        periodMonth: string;
        paymentMethodId: string;
        fail?: boolean;
      }>,
    ) => {
      state.payRent = { data: null, loading: true, error: null };
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
          };
        }
      }
    },
    tenantPayRentSuccess: (
      state,
      action: PayloadAction<{ leaseId: string; payment: Payment }>,
    ) => {
      state.payRent = { data: action.payload.payment, loading: false, error: null };
      const list = state.paymentsByLeaseId[action.payload.leaseId]?.data;
      if (list) {
        const idx = list.findIndex(
          (p) => p.periodMonth === action.payload.payment.periodMonth,
        );
        if (idx !== -1) list[idx] = action.payload.payment;
      }
    },
    tenantPayRentFailure: (
      state,
      action: PayloadAction<{ leaseId: string; periodMonth: string; error: string }>,
    ) => {
      state.payRent = { data: null, loading: false, error: action.payload.error };
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

    // ── Add payment method ──────────────────────────────────────────────────
    addPaymentMethod: (
      state,
      _action: PayloadAction<{ tenantId: string; label: string }>,
    ) => {
      state.addMethod = { data: null, loading: true, error: null };
    },
    addPaymentMethodSuccess: (
      state,
      action: PayloadAction<{ tenantId: string; method: PaymentMethod }>,
    ) => {
      state.addMethod = { data: action.payload.method, loading: false, error: null };
      const list =
        state.paymentMethodsByTenantId[action.payload.tenantId]?.data;
      if (list) list.push(action.payload.method);
    },
    addPaymentMethodFailure: (state, action: PayloadAction<string>) => {
      state.addMethod = { data: null, loading: false, error: action.payload };
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
      action: PayloadAction<{ leaseId: string; periodMonth: string; error: string }>,
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
      action: PayloadAction<{ leaseId: string; periodMonth: string; error: string }>,
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
  fetchPaymentMethods,
  fetchPaymentMethodsSuccess,
  fetchPaymentMethodsFailure,
  tenantPayRent,
  tenantPayRentSuccess,
  tenantPayRentFailure,
  addPaymentMethod,
  addPaymentMethodSuccess,
  addPaymentMethodFailure,
  managerSendReminder,
  managerSendReminderSuccess,
  managerSendReminderFailure,
  managerMarkPaid,
  managerMarkPaidSuccess,
  managerMarkPaidFailure,
} = paymentSlice.actions;
