import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Payment, PaymentMethod, TenantPaymentState } from "./type";
import { initialFetch, initialFetchMap } from "../../types";

const initialState: TenantPaymentState = {
  paymentsByLeaseId:        initialFetchMap(),
  paymentMethodsByTenantId: initialFetchMap(),
  payRent:                  initialFetch(),
  addMethod:                initialFetch(),
};

const tenantPaymentSlice = createSlice({
  name: "tenantPayment",
  initialState,
  reducers: {
    // ── Fetch payments ────────────────────────────────────────────────────────
    tenantFetchPayments: (state, action: PayloadAction<string>) => {
      state.paymentsByLeaseId[action.payload] = {
        data:    state.paymentsByLeaseId[action.payload]?.data ?? null,
        loading: true,
        error:   null,
      };
    },
    tenantFetchPaymentsSuccess: (
      state,
      action: PayloadAction<{ leaseId: string; payments: Payment[] }>,
    ) => {
      state.paymentsByLeaseId[action.payload.leaseId] = {
        data:    action.payload.payments,
        loading: false,
        error:   null,
      };
    },
    tenantFetchPaymentsFailure: (
      state,
      action: PayloadAction<{ leaseId: string; error: string }>,
    ) => {
      state.paymentsByLeaseId[action.payload.leaseId] = {
        data:    state.paymentsByLeaseId[action.payload.leaseId]?.data ?? null,
        loading: false,
        error:   action.payload.error,
      };
    },

    // ── Fetch payment methods ─────────────────────────────────────────────────
    tenantFetchPaymentMethods: (state, action: PayloadAction<string>) => {
      state.paymentMethodsByTenantId[action.payload] = {
        data:    state.paymentMethodsByTenantId[action.payload]?.data ?? null,
        loading: true,
        error:   null,
      };
    },
    tenantFetchPaymentMethodsSuccess: (
      state,
      action: PayloadAction<{ tenantId: string; methods: PaymentMethod[] }>,
    ) => {
      state.paymentMethodsByTenantId[action.payload.tenantId] = {
        data:    action.payload.methods,
        loading: false,
        error:   null,
      };
    },
    tenantFetchPaymentMethodsFailure: (
      state,
      action: PayloadAction<{ tenantId: string; error: string }>,
    ) => {
      state.paymentMethodsByTenantId[action.payload.tenantId] = {
        data:    state.paymentMethodsByTenantId[action.payload.tenantId]?.data ?? null,
        loading: false,
        error:   action.payload.error,
      };
    },

    // ── Pay rent (optimistic) ─────────────────────────────────────────────────
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
            status:      "paid",
            amountPaid:  list[idx].amountDue,
            paidDate:    new Date().toISOString(),
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
            status:     "outstanding",
            amountPaid: 0,
            paidDate:   null,
          };
        }
      }
    },

    // ── Add payment method ────────────────────────────────────────────────────
    tenantAddPaymentMethod: (
      state,
      _action: PayloadAction<{ tenantId: string; label: string }>,
    ) => {
      state.addMethod = { data: null, loading: true, error: null };
    },
    tenantAddPaymentMethodSuccess: (
      state,
      action: PayloadAction<{ tenantId: string; method: PaymentMethod }>,
    ) => {
      state.addMethod = { data: action.payload.method, loading: false, error: null };
      const list =
        state.paymentMethodsByTenantId[action.payload.tenantId]?.data;
      if (list) list.push(action.payload.method);
    },
    tenantAddPaymentMethodFailure: (state, action: PayloadAction<string>) => {
      state.addMethod = { data: null, loading: false, error: action.payload };
    },
  },
});

export const tenantPaymentReducer = tenantPaymentSlice.reducer;
export const {
  tenantFetchPayments,
  tenantFetchPaymentsSuccess,
  tenantFetchPaymentsFailure,
  tenantFetchPaymentMethods,
  tenantFetchPaymentMethodsSuccess,
  tenantFetchPaymentMethodsFailure,
  tenantPayRent,
  tenantPayRentSuccess,
  tenantPayRentFailure,
  tenantAddPaymentMethod,
  tenantAddPaymentMethodSuccess,
  tenantAddPaymentMethodFailure,
} = tenantPaymentSlice.actions;
