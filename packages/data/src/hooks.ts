"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { api } from "./client";
import type { Payment, PaymentMethod, TenantStanding } from "@repo/types";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const keys = {
  propertiesSummary: () => ["propertiesSummary"] as const,
  properties: () => ["properties"] as const,
  property: (id: string) => ["properties", id] as const,
  units: (propertyId: string) => ["units", propertyId] as const,
  unit: (id: string) => ["unit", id] as const,
  lease: (id: string) => ["lease", id] as const,
  leaseByUnit: (unitId: string) => ["leaseByUnit", unitId] as const,
  tenant: (id: string) => ["tenant", id] as const,
  payments: (leaseId: string) => ["payments", leaseId] as const,
  paymentMethods: (tenantId: string) => ["paymentMethods", tenantId] as const,
};

// ─── Properties ───────────────────────────────────────────────────────────────

export function usePropertiesSummary() {
  return useQuery({
    queryKey: keys.propertiesSummary(),
    queryFn: api.getPropertiesSummary,
  });
}

export function useProperties() {
  return useQuery({ queryKey: keys.properties(), queryFn: api.getProperties });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: keys.property(id),
    queryFn: () => api.getProperty(id),
    enabled: !!id,
  });
}

// ─── Units ────────────────────────────────────────────────────────────────────

export function useUnits(propertyId: string) {
  return useQuery({
    queryKey: keys.units(propertyId),
    queryFn: () => api.getUnits(propertyId),
    enabled: !!propertyId,
  });
}

export function useUnit(id: string) {
  return useQuery({
    queryKey: keys.unit(id),
    queryFn: () => api.getUnit(id),
    enabled: !!id,
  });
}

// ─── Leases ───────────────────────────────────────────────────────────────────

export function useLease(id: string) {
  return useQuery({
    queryKey: keys.lease(id),
    queryFn: () => api.getLease(id),
    enabled: !!id,
  });
}

export function useLeaseByUnit(unitId: string) {
  return useQuery({
    queryKey: keys.leaseByUnit(unitId),
    queryFn: () => api.getLeaseByUnit(unitId),
    enabled: !!unitId,
  });
}

export function useCreateLease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createLease,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: keys.leaseByUnit(vars.unitId) });
    },
  });
}

export function useUpdateLease(leaseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof api.updateLease>[1]) =>
      api.updateLease(leaseId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.lease(leaseId) });
    },
  });
}

// ─── Tenant ───────────────────────────────────────────────────────────────────

export function useTenant(id: string) {
  return useQuery({
    queryKey: keys.tenant(id),
    queryFn: () => api.getTenant(id),
    enabled: !!id,
  });
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export function usePayments(leaseId: string) {
  return useQuery({
    queryKey: keys.payments(leaseId),
    queryFn: () => api.getPayments(leaseId),
    enabled: !!leaseId,
  });
}

export function useTenantStanding(leaseId: string): TenantStanding | null {
  const { data: payments } = usePayments(leaseId);
  if (!payments || payments.length === 0) return null;

  const past = payments.filter((p) => p.status !== "outstanding");
  const onTime = past.filter((p) => p.status === "paid").length;
  const score = past.length === 0 ? 100 : Math.round((onTime / past.length) * 100);

  let label: TenantStanding["label"];
  if (score >= 95) label = "Excellent";
  else if (score >= 80) label = "Good";
  else if (score >= 60) label = "Fair";
  else label = "Poor";

  return { totalPayments: past.length, onTimePayments: onTime, score, label };
}

// ─── Pay rent (optimistic) ────────────────────────────────────────────────────

export function usePayRent(leaseId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      periodMonth,
      paymentMethodId,
      fail,
    }: {
      periodMonth: string;
      paymentMethodId: string;
      fail?: boolean;
    }) => api.payRent(leaseId, { periodMonth, paymentMethodId }, fail),

    onMutate: async ({ periodMonth }) => {
      await qc.cancelQueries({ queryKey: keys.payments(leaseId) });
      const snapshot = qc.getQueryData<Payment[]>(keys.payments(leaseId));

      qc.setQueryData<Payment[]>(keys.payments(leaseId), (old) =>
        old?.map((p) =>
          p.periodMonth === periodMonth
            ? {
                ...p,
                status: "paid",
                amountPaid: p.amountDue,
                paidDate: new Date().toISOString().slice(0, 10),
              }
            : p
        )
      );

      return { snapshot };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) {
        qc.setQueryData(keys.payments(leaseId), ctx.snapshot);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.payments(leaseId) });
    },
  });
}

// ─── Send reminder ────────────────────────────────────────────────────────────

export function useSendReminder(leaseId: string) {
  return useMutation({
    mutationFn: (periodMonth: string) => api.sendReminder(leaseId, periodMonth),
  });
}

// ─── Payment methods ─────────────────────────────────────────────────────────

export function usePaymentMethods(tenantId: string) {
  return useQuery({
    queryKey: keys.paymentMethods(tenantId),
    queryFn: () => api.getPaymentMethods(tenantId),
    enabled: !!tenantId,
  });
}

export function useAddPaymentMethod(tenantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (label: string) => api.addPaymentMethod(tenantId, label),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.paymentMethods(tenantId) });
    },
  });
}
