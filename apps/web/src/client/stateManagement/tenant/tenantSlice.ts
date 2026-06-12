import { createSlice, createAction } from "@reduxjs/toolkit";
import type { Tenant, TenantProfile } from "./type";
import type { Lease } from "../lease/type";
import type { Payment, PaymentMethod } from "../payment/type";
import {
  type FetchState,
  type FetchStateMap,
  initialFetch,
  initialFetchMap,
} from "../types";
import type { TenantState } from "./type";

// ── Tenant profile actions ────────────────────────────────────────────────────

export const fetchTenantProfile = createAction<string>("tenant/fetchProfile");
export const fetchTenantProfileSuccess = createAction<{
  id: string;
  profile: TenantProfile;
}>("tenant/fetchProfileSuccess");
export const fetchTenantProfileFailure = createAction<{
  id: string;
  error: string;
}>("tenant/fetchProfileFailure");

// ── Manager payment actions ───────────────────────────────────────────────────

export const managerSendReminder = createAction<{
  leaseId: string;
  periodMonth: string;
}>("tenant/managerSendReminder");
export const managerSendReminderSuccess = createAction<{
  leaseId: string;
  payment: Payment;
}>("tenant/managerSendReminderSuccess");
export const managerSendReminderFailure = createAction<{
  leaseId: string;
  periodMonth: string;
  error: string;
}>("tenant/managerSendReminderFailure");

export const managerMarkPaid = createAction<{
  leaseId: string;
  periodMonth: string;
}>("tenant/managerMarkPaid");
export const managerMarkPaidSuccess = createAction<{
  leaseId: string;
  payment: Payment;
}>("tenant/managerMarkPaidSuccess");
export const managerMarkPaidFailure = createAction<{
  leaseId: string;
  periodMonth: string;
  error: string;
}>("tenant/managerMarkPaidFailure");

// ── State ─────────────────────────────────────────────────────────────────────

const initialState: TenantState = {
  detail: initialFetchMap(),
  lease: initialFetchMap(),
  payments: initialFetchMap(),
  paymentMethods: initialFetchMap(),
  payRent: initialFetch(),
  addMethod: initialFetch(),
  reminderState: initialFetch(),
  markPaidState: initialFetch(),
  profile: initialFetchMap(),
};

// ── Actions ───────────────────────────────────────────────────────────────────

export const fetchTenantDetail = createAction<string>("tenant/fetchDetail");
export const fetchTenantDetailSuccess = createAction<Tenant>(
  "tenant/fetchDetailSuccess",
);
export const fetchTenantDetailFailure = createAction<{
  id: string;
  error: string;
}>("tenant/fetchDetailFailure");

export const fetchLease = createAction<string>("tenant/fetchLease");
export const fetchLeaseSuccess = createAction<Lease>(
  "tenant/fetchLeaseSuccess",
);
export const fetchLeaseFailure = createAction<{ id: string; error: string }>(
  "tenant/fetchLeaseFailure",
);

export const fetchTenantPayments = createAction<string>("tenant/fetchPayments");
export const fetchTenantPaymentsSuccess = createAction<{
  leaseId: string;
  payments: Payment[];
}>("tenant/fetchPaymentsSuccess");
export const fetchTenantPaymentsFailure = createAction<{
  leaseId: string;
  error: string;
}>("tenant/fetchPaymentsFailure");

export const fetchPaymentMethods = createAction<string>(
  "tenant/fetchPaymentMethods",
);
export const fetchPaymentMethodsSuccess = createAction<{
  tenantId: string;
  methods: PaymentMethod[];
}>("tenant/fetchPaymentMethodsSuccess");
export const fetchPaymentMethodsFailure = createAction<{
  tenantId: string;
  error: string;
}>("tenant/fetchPaymentMethodsFailure");

export const tenantPayRent = createAction<{
  leaseId: string;
  periodMonth: string;
  paymentMethodId: string;
  fail?: boolean;
}>("tenant/payRent");
export const tenantPayRentSuccess = createAction<{
  leaseId: string;
  payment: Payment;
}>("tenant/payRentSuccess");
export const tenantPayRentFailure = createAction<{
  leaseId: string;
  periodMonth: string;
  error: string;
}>("tenant/payRentFailure");

export const addPaymentMethod = createAction<{
  tenantId: string;
  label: string;
}>("tenant/addPaymentMethod");
export const addPaymentMethodSuccess = createAction<{
  tenantId: string;
  method: PaymentMethod;
}>("tenant/addPaymentMethodSuccess");
export const addPaymentMethodFailure = createAction<string>(
  "tenant/addPaymentMethodFailure",
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const tenantSlice = createSlice({
  name: "tenant",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Tenant profile (all-in-one fetch)
    builder
      .addCase(fetchTenantProfile, (state, { payload: id }) => {
        state.profile[id] = { data: null, loading: true, error: null };
      })
      .addCase(
        fetchTenantProfileSuccess,
        (state, { payload: { id, profile } }) => {
          state.profile[id] = { data: profile, loading: false, error: null };
        },
      )
      .addCase(
        fetchTenantProfileFailure,
        (state, { payload: { id, error } }) => {
          state.profile[id] = { data: null, loading: false, error };
        },
      );

    // Tenant detail
    builder
      .addCase(fetchTenantDetail, (state, { payload: id }) => {
        state.detail[id] = { data: null, loading: true, error: null };
      })
      .addCase(fetchTenantDetailSuccess, (state, { payload }) => {
        state.detail[payload.id] = {
          data: payload,
          loading: false,
          error: null,
        };
      })
      .addCase(
        fetchTenantDetailFailure,
        (state, { payload: { id, error } }) => {
          state.detail[id] = { data: null, loading: false, error };
        },
      );

    // Lease
    builder
      .addCase(fetchLease, (state, { payload: id }) => {
        state.lease[id] = { data: null, loading: true, error: null };
      })
      .addCase(fetchLeaseSuccess, (state, { payload }) => {
        state.lease[payload.id] = {
          data: payload,
          loading: false,
          error: null,
        };
      })
      .addCase(fetchLeaseFailure, (state, { payload: { id, error } }) => {
        state.lease[id] = { data: null, loading: false, error };
      });

    // Payments
    builder
      .addCase(fetchTenantPayments, (state, { payload: leaseId }) => {
        state.payments[leaseId] = { data: null, loading: true, error: null };
      })
      .addCase(
        fetchTenantPaymentsSuccess,
        (state, { payload: { leaseId, payments } }) => {
          state.payments[leaseId] = {
            data: payments,
            loading: false,
            error: null,
          };
        },
      )
      .addCase(
        fetchTenantPaymentsFailure,
        (state, { payload: { leaseId, error } }) => {
          state.payments[leaseId] = { data: null, loading: false, error };
        },
      );

    // Payment methods
    builder
      .addCase(fetchPaymentMethods, (state, { payload: tenantId }) => {
        state.paymentMethods[tenantId] = {
          data: null,
          loading: true,
          error: null,
        };
      })
      .addCase(
        fetchPaymentMethodsSuccess,
        (state, { payload: { tenantId, methods } }) => {
          state.paymentMethods[tenantId] = {
            data: methods,
            loading: false,
            error: null,
          };
        },
      )
      .addCase(
        fetchPaymentMethodsFailure,
        (state, { payload: { tenantId, error } }) => {
          state.paymentMethods[tenantId] = {
            data: null,
            loading: false,
            error,
          };
        },
      );

    // Pay rent (optimistic)
    builder
      .addCase(
        tenantPayRent,
        (state, { payload: { leaseId, periodMonth } }) => {
          state.payRent = { data: null, loading: true, error: null };
          const list = state.payments[leaseId]?.data;
          if (list) {
            const idx = list.findIndex((p) => p.periodMonth === periodMonth);
            if (idx !== -1) {
              list[idx] = {
                ...list[idx],
                status: "paid",
                amountPaid: list[idx].amountDue,
                paidDate: new Date().toISOString().slice(0, 10),
              };
            }
          }
        },
      )
      .addCase(
        tenantPayRentSuccess,
        (state, { payload: { leaseId, payment } }) => {
          state.payRent = { data: payment, loading: false, error: null };
          const list = state.payments[leaseId]?.data;
          if (list) {
            const idx = list.findIndex(
              (p) => p.periodMonth === payment.periodMonth,
            );
            if (idx !== -1) list[idx] = payment;
          }
        },
      )
      .addCase(
        tenantPayRentFailure,
        (state, { payload: { leaseId, periodMonth, error } }) => {
          state.payRent = { data: null, loading: false, error };
          // Roll back
          const list = state.payments[leaseId]?.data;
          if (list) {
            const idx = list.findIndex((p) => p.periodMonth === periodMonth);
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
      );

    // Manager: send reminder
    builder
      .addCase(managerSendReminder, (state) => {
        state.reminderState = { data: null, loading: true, error: null };
      })
      .addCase(
        managerSendReminderSuccess,
        (state, { payload: { leaseId, payment } }) => {
          state.reminderState = { data: payment, loading: false, error: null };
          const list = state.payments[leaseId]?.data;
          if (list) {
            const idx = list.findIndex(
              (p) => p.periodMonth === payment.periodMonth,
            );
            if (idx !== -1) list[idx] = payment;
          }
        },
      )
      .addCase(managerSendReminderFailure, (state, { payload: { error } }) => {
        state.reminderState = { data: null, loading: false, error };
      });

    // Manager: mark as paid (optimistic, same rollback pattern as tenantPayRent)
    builder
      .addCase(
        managerMarkPaid,
        (state, { payload: { leaseId, periodMonth } }) => {
          state.markPaidState = { data: null, loading: true, error: null };
          const list = state.payments[leaseId]?.data;
          if (list) {
            const idx = list.findIndex((p) => p.periodMonth === periodMonth);
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
      )
      .addCase(
        managerMarkPaidSuccess,
        (state, { payload: { leaseId, payment } }) => {
          state.markPaidState = { data: payment, loading: false, error: null };
          const list = state.payments[leaseId]?.data;
          if (list) {
            const idx = list.findIndex(
              (p) => p.periodMonth === payment.periodMonth,
            );
            if (idx !== -1) list[idx] = payment;
          }
        },
      )
      .addCase(
        managerMarkPaidFailure,
        (state, { payload: { leaseId, periodMonth, error } }) => {
          state.markPaidState = { data: null, loading: false, error };
          const list = state.payments[leaseId]?.data;
          if (list) {
            const idx = list.findIndex((p) => p.periodMonth === periodMonth);
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
      );

    // Add payment method
    builder
      .addCase(addPaymentMethod, (state) => {
        state.addMethod = { data: null, loading: true, error: null };
      })
      .addCase(
        addPaymentMethodSuccess,
        (state, { payload: { tenantId, method } }) => {
          state.addMethod = { data: method, loading: false, error: null };
          const list = state.paymentMethods[tenantId]?.data;
          if (list) list.push(method);
        },
      )
      .addCase(addPaymentMethodFailure, (state, { payload: error }) => {
        state.addMethod = { data: null, loading: false, error };
      });
  },
});

export const tenantReducer = tenantSlice.reducer;
