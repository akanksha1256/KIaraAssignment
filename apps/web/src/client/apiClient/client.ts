import type * as P from "@/platform/types";
import {
  mapProperty,
  mapPropertySummary,
  mapPropertyDetail,
  mapUnit,
  mapTenant,
  mapTenantProfile,
  mapTenantDashboard,
  mapLease,
  mapPayment,
  mapPaymentMethod,
  mapManagerDashboard,
} from "./mappers";
import type { ManagerDashboardData } from "@/client/stateManagement/managerDashboard/manager/type";
import type {
  Property,
  PropertySummary,
  PropertyDetailData,
} from "@/client/stateManagement/managerDashboard/property/type";
import type { TenantProfile } from "@/client/stateManagement/managerDashboard/tenant/type";
import type { TenantDashboardData } from "@/client/stateManagement/tenantDashboard/type";
import type { Unit } from "@/client/stateManagement/managerDashboard/unit/type";
import type { Tenant } from "@/client/stateManagement/managerDashboard/tenant/type";
import type { Lease } from "@/client/stateManagement/managerDashboard/lease/type";
import type {
  Payment,
  PaymentMethod,
} from "@/client/stateManagement/managerDashboard/payment/type";

const BASE = "/api";

async function request<T>(
  path: string,
  options?: RequestInit & { fail?: boolean },
): Promise<T> {
  const url = new URL(BASE + path, window.location.origin);
  if (options?.fail) url.searchParams.set("fail", "true");

  const res = await fetch(url.toString(), options);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message ?? "Request failed");
  }
  return res.json();
}

export const api = {
  getManagerDashboard: async (): Promise<ManagerDashboardData> =>
    mapManagerDashboard(
      await request<P.ManagerDashboardData>("/manager/dashboard"),
    ),

  getProperties: async (): Promise<Property[]> =>
    (await request<P.Property[]>("/properties")).map(mapProperty),

  getProperty: async (id: string): Promise<Property> =>
    mapProperty(await request<P.Property>(`/properties/${id}`)),

  getPropertyDetail: async (id: string): Promise<PropertyDetailData> =>
    mapPropertyDetail(await request<P.PropertyDetailData>(`/properties/${id}`)),

  getPropertiesSummary: async (): Promise<PropertySummary[]> =>
    (await request<P.PropertySummary[]>("/properties/summary")).map(
      mapPropertySummary,
    ),

  getUnits: async (propertyId: string): Promise<Unit[]> =>
    (await request<P.Unit[]>(`/properties/${propertyId}/units`)).map(mapUnit),

  getUnit: async (id: string): Promise<Unit> =>
    mapUnit(await request<P.Unit>(`/units/${id}`)),

  getTenant: async (id: string): Promise<Tenant> =>
    mapTenant(await request<P.Tenant>(`/tenants/${id}`)),

  getTenantProfile: async (id: string): Promise<TenantProfile> =>
    mapTenantProfile(await request<P.TenantProfileData>(`/tenants/${id}`)),

  getTenantDashboard: async (id: string): Promise<TenantDashboardData> =>
    mapTenantDashboard(await request<P.TenantProfileData>(`/tenants/${id}`)),

  getLease: async (id: string): Promise<Lease> =>
    mapLease(await request<P.Lease>(`/leases/${id}`)),

  getLeaseByUnit: async (unitId: string): Promise<Lease | null> => {
    const raw = await request<P.Lease | null>(`/units/${unitId}/lease`);
    return raw ? mapLease(raw) : null;
  },

  createLease: async (data: Omit<Lease, "id">): Promise<Lease> =>
    mapLease(
      await request<P.Lease>("/leases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unit_id: data.unitId,
          tenant_id: data.tenantId,
          start_date: data.startDate,
          end_date: data.endDate,
          monthly_rent: data.monthlyRent,
          terms: data.terms,
        }),
      }),
    ),

  updateLease: async (id: string, data: Partial<Lease>): Promise<Lease> =>
    mapLease(
      await request<P.Lease>(`/leases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(data.unitId && { unit_id: data.unitId }),
          ...(data.tenantId && { tenant_id: data.tenantId }),
          ...(data.startDate && { start_date: data.startDate }),
          ...(data.endDate && { end_date: data.endDate }),
          ...(data.monthlyRent && { monthly_rent: data.monthlyRent }),
          ...(data.terms && { terms: data.terms }),
        }),
      }),
    ),

  getPayments: async (leaseId: string): Promise<Payment[]> =>
    (await request<P.Payment[]>(`/leases/${leaseId}/payments`)).map(mapPayment),

  payRent: async (
    leaseId: string,
    data: { periodMonth: string; paymentMethodId: string },
    fail?: boolean,
  ): Promise<Payment> =>
    mapPayment(
      await request<P.Payment>(`/leases/${leaseId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period_month: data.periodMonth,
          payment_method_id: data.paymentMethodId,
        }),
        fail,
      }),
    ),

  sendReminder: async (
    leaseId: string,
    periodMonth: string,
  ): Promise<Payment> =>
    mapPayment(
      await request<P.Payment>(`/leases/${leaseId}/remind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period_month: periodMonth }),
      }),
    ),

  getPaymentMethods: async (tenantId: string): Promise<PaymentMethod[]> =>
    (
      await request<P.PaymentMethod[]>(`/tenants/${tenantId}/payment-methods`)
    ).map(mapPaymentMethod),

  addPaymentMethod: async (
    tenantId: string,
    label: string,
  ): Promise<PaymentMethod> =>
    mapPaymentMethod(
      await request<P.PaymentMethod>(`/tenants/${tenantId}/payment-methods`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      }),
    ),
};
