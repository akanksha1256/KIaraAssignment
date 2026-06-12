import type { RootState } from "../mainFile";

export const selectTenantProfile =
  (id: string) => (state: RootState) => {
    const entry = state.tenant.tenantDataById[id];
    return {
      status:  entry?.fetchState.status ?? "not-started",
      error:   entry?.fetchState.error  ?? null,
      profile: entry?.data              ?? null,
    };
  };
