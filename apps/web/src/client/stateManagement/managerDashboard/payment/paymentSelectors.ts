import type { RootState } from "../../mainFile";

export const selectPaymentMethods =
  (tenantId: string) => (state: RootState) => {
    const entry = state.payment.paymentMethodsByTenantId[tenantId];
    return {
      methods: entry?.data ?? null,
      loading: entry?.loading ?? false,
      error:   entry?.error  ?? null,
    };
  };

export const selectPayRentState = (state: RootState) => state.payment.payRent;

export const selectAddMethodState = (state: RootState) => state.payment.addMethod;
