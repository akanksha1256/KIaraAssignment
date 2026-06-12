import type { RootState } from "../../mainFile";

export const selectTenantPayments =
  (leaseId: string) => (state: RootState) => {
    const entry = state.tenantPayment.paymentsByLeaseId[leaseId];
    return {
      payments: entry?.data ?? null,
      loading:  entry?.loading ?? false,
      error:    entry?.error   ?? null,
    };
  };

export const selectTenantPaymentMethods =
  (tenantId: string) => (state: RootState) => {
    const entry = state.tenantPayment.paymentMethodsByTenantId[tenantId];
    return {
      methods: entry?.data ?? null,
      loading: entry?.loading ?? false,
      error:   entry?.error   ?? null,
    };
  };

export const selectTenantPayRentState = (state: RootState) =>
  state.tenantPayment.payRent;

export const selectTenantAddMethodState = (state: RootState) =>
  state.tenantPayment.addMethod;
