import type { RootState } from "../mainFile";

export const selectDashboard = (state: RootState) => {
  const { data, loading, error } = state.manager.dashboard;
  return {
    loading,
    error,
    stats:            data?.stats            ?? null,
    paymentBreakdown: data?.paymentBreakdown  ?? null,
    monthlyRevenue:   data?.monthlyRevenue    ?? [],
    properties:       data?.properties        ?? [],
  };
};
