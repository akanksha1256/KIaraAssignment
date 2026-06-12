import type { RootState } from "../../mainFile";

export const selectManagerPayments =
  (leaseId: string) => (state: RootState) => {
    const entry = state.payment.paymentsByLeaseId[leaseId];
    return {
      payments: entry?.data    ?? null,
      loading:  entry?.loading ?? false,
      error:    entry?.error   ?? null,
    };
  };

export const selectManagerMarkPaidState = (state: RootState) =>
  state.payment.markPaidState;

export const selectManagerReminderState = (state: RootState) =>
  state.payment.reminderState;
