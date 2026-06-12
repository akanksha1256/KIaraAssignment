import type { RootState } from "../mainFile";

export const selectTenantProfile =
  (id: string) => (state: RootState) => ({
    loading: state.tenant.profile[id]?.loading ?? false,
    error:   state.tenant.profile[id]?.error   ?? null,
    profile: state.tenant.profile[id]?.data    ?? null,
  });
