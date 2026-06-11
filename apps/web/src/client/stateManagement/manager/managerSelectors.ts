import type { RootState } from "../mainFile";

export const selectDashboard = (state: RootState) => ({
  status: state.manager.dashboardFetchState.status,
  error: state.manager.dashboardFetchState.error,
  stats: state.manager.stats,
  paymentBreakdown: state.manager.paymentBreakdown,
  monthlyRevenue: state.manager.monthlyRevenue,
});
