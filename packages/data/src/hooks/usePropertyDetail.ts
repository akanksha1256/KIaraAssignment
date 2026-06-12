import { useQuery } from "@tanstack/react-query";
import { api } from "../apiClient/client";

export const propertyDetailKey = (id: string) =>
  ["property", "detail", id] as const;

export function usePropertyDetail(propertyId: string) {
  return useQuery({
    queryKey: propertyDetailKey(propertyId),
    queryFn:  () => api.getPropertyDetail(propertyId),
    staleTime: 5 * 60 * 1000,
    enabled:   !!propertyId,
  });
}
