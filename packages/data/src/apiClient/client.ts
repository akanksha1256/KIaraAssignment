import type * as P from "@repo/platform-types";
import {
  mapProperty,
  mapPropertySummary,
  mapPropertyDetail,
  mapUnit,
  mapTenant,
  mapTenantProfile,
  mapTenantDashboard,
  mapTenantDashboardPayments,
  mapPaymentListItem,
  mapTenantListItem,
  mapLease,
  mapPayment,
  mapPaymentMethod,
  mapManagerDashboard,
} from "./mappers";
import type { ManagerDashboardData } from "../types";
import type { Property, PropertySummary, PropertyDetailData } from "../types";
import type { TenantProfile, TenantListItem, PaymentListItem } from "../types";
import type { TenantDashboardData } from "../types";
import type { Unit } from "../types";
import type { Tenant } from "../types";
import type { Lease } from "../types";
import type { Payment, PaymentMethod } from "../types";

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit & { fail?: boolean }): Promise<T> {
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
    mapManagerDashboard(await request<P.ManagerDashboardData>("/manager/dashboard")),

  getProperties: async (): Promise<Property[]> =>
    (await request<P.Property[]>("/properties")).map(mapProperty),

  getProperty: async (id: string): Promise<Property> =>
    mapProperty(await request<P.Property>(`/properties/${id}`)),

  getPropertyDetail: async (id: string): Promise<PropertyDetailData> =>
    mapPropertyDetail(await request<P.PropertyDetailData>(`/properties/${id}`)),

  getPropertiesSummary: async (): Promise<PropertySummary[]> =>
    (await request<P.PropertySummary[]>("/properties/summary")).map(mapPropertySummary),

  getUnits: async (propertyId: string): Promise<Unit[]> =>
    (await request<P.Unit[]>(`/properties/${propertyId}/units`)).map(mapUnit),

  getUnit: async (id: string): Promise<Unit> => mapUnit(await request<P.Unit>(`/units/${id}`)),

  getAllPayments: async (): Promise<PaymentListItem[]> =>
    (await request<P.PaymentListItem[]>("/manager/payments")).map(mapPaymentListItem),

  getAllTenants: async (): Promise<TenantListItem[]> =>
    (await request<P.TenantListItem[]>("/tenants")).map(mapTenantListItem),

  getTenant: async (id: string): Promise<Tenant> =>
    mapTenant(await request<P.Tenant>(`/tenants/${id}`)),

  getTenantProfile: async (id: string): Promise<TenantProfile> =>
    mapTenantProfile(await request<P.TenantProfileData>(`/tenants/${id}`)),

  getTenantDashboard: async (
    id: string,
  ): Promise<{ dashboard: TenantDashboardData; payments: Payment[] }> => {
    const raw = await request<P.TenantProfileData>(`/tenants/${id}`);
    return { dashboard: mapTenantDashboard(raw), payments: mapTenantDashboardPayments(raw) };
  },

  getLease: async (id: string): Promise<Lease> => mapLease(await request<P.Lease>(`/leases/${id}`)),

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

  sendReminder: async (leaseId: string, periodMonth: string): Promise<Payment> =>
    mapPayment(
      await request<P.Payment>(`/leases/${leaseId}/remind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period_month: periodMonth }),
      }),
    ),

  getPaymentMethods: async (tenantId: string): Promise<PaymentMethod[]> =>
    (await request<P.PaymentMethod[]>(`/tenants/${tenantId}/payment-methods`)).map(
      mapPaymentMethod,
    ),

  createTenant: async (data: { name: string; email: string; contact?: string }): Promise<{ id: string; name: string; email: string; contact: string }> => {
    const res = await request<{ tenant: P.Tenant }>("/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: data.name, email: data.email, contact: data.contact ?? "" }),
    });
    const t = res.tenant;
    return { id: t.id, name: t.name, email: t.email, contact: t.contact };
  },

  createProperty: async (data: {
    name: string;
    address: string;
    units: string[];
  }): Promise<Property> => {
    const res = await request<{ property: P.Property }>("/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: data.name, address: data.address, units: data.units }),
    });
    return mapProperty(res.property);
  },

  addPaymentMethod: async (tenantId: string, label: string): Promise<PaymentMethod> =>
    mapPaymentMethod(
      await request<P.PaymentMethod>(`/tenants/${tenantId}/payment-methods`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      }),
    ),
};
