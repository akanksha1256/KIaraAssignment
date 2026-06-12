import type { RootState } from "../mainFile";

export const selectTenantDashboard =
  (id: string) => (state: RootState) => {
    const entry = state.tenantDashboard.dashboardById[id];
    return {
      status: entry?.fetchState.status ?? "not-started",
      error:  entry?.fetchState.error  ?? null,
      data:   entry?.data              ?? null,
    };
  };
