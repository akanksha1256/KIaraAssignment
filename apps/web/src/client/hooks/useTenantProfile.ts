import { useQuery } from "@tanstack/react-query";
import { api } from "@/client/apiClient/client";

export const tenantProfileKey = (id: string) =>
  ["tenant", "profile", id] as const;

export function useTenantProfile(tenantId: string) {
  return useQuery({
    queryKey: tenantProfileKey(tenantId),
    queryFn:  () => api.getTenantProfile(tenantId),
    staleTime: 5 * 60 * 1000,
    enabled:   !!tenantId,
  });
}
