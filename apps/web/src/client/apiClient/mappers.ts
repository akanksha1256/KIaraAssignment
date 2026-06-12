import type * as P from "@/platform/types";
import type { Property, PropertySummary, UnitDetailItem, PropertyDetailData } from "@/client/types";
import type { Unit }                       from "@/client/types";
import type { Tenant, TenantStanding, TenantProfile } from "@/client/types";
import type { TenantDashboardData } from "@/client/types";
import type { Lease }                      from "@/client/types";
import type { Payment, PaymentMethod }     from "@/client/types";
import type { ManagerDashboardData, DashboardStats, PaymentBreakdown, MonthlyRevenue } from "@/client/types";

export const mapProperty = (p: P.Property): Property => ({
  id:             p.id,
  name:           p.name,
  address:        p.address,
  managerName:    p.manager_name,
  managerEmail:   p.manager_email,
  managerContact: p.manager_contact,
});

export const mapUnit = (u: P.Unit): Unit => ({
  id:         u.id,
  propertyId: u.property_id,
  label:      u.label,
});

export const mapTenant = (t: P.Tenant): Tenant => ({
  id:            t.id,
  name:          t.name,
  contact:       t.contact,
  email:         t.email,
  kycStatus:     t.kyc_status,
  kycVerifiedOn: t.kyc_verified_on,
  kycDocument:   t.kyc_document,
});

export const mapLease = (l: P.Lease): Lease => ({
  id:            l.id,
  unitId:        l.unit_id,
  tenantId:      l.tenant_id,
  startDate:     l.start_date,
  endDate:       l.end_date,
  monthlyRent:   l.monthly_rent,
  terms:         l.terms,
  leaseDocument: l.lease_document,
});

export const mapPayment = (p: P.Payment): Payment => ({
  id:          p.id,
  leaseId:     p.lease_id,
  periodMonth: p.period_month,
  amountDue:   p.amount_due,
  amountPaid:  p.amount_paid,
  status:      p.status,
  paidDate:       p.paid_date,
  method:         p.method,
  lastRemindedOn: p.last_reminded_on,
});

export const mapPaymentMethod = (m: P.PaymentMethod): PaymentMethod => ({
  id:       m.id,
  tenantId: m.tenant_id,
  label:    m.label,
});

export const mapPropertySummary = (s: P.PropertySummary): PropertySummary => ({
  id:          s.id,
  name:        s.name,
  address:     s.address,
  unitCount:   s.unit_count,
  leasedCount: s.leased_count,
  totalRent:   s.total_rent,
  status:      s.status,
});

const mapDashboardStats = (s: P.DashboardStats): DashboardStats => ({
  totalProperties:    s.total_properties,
  totalUnits:         s.total_units,
  occupiedUnits:      s.occupied_units,
  vacantUnits:        s.vacant_units,
  totalMonthlyRent:   s.total_monthly_rent,
  collectedThisMonth: s.collected_this_month,
});

const mapPaymentBreakdown = (b: P.PaymentBreakdown): PaymentBreakdown => ({
  paid:        b.paid,
  outstanding: b.outstanding,
  overdue:     b.overdue,
});

const mapMonthlyRevenue = (r: P.MonthlyRevenue): MonthlyRevenue => ({
  month:     r.month,
  expected:  r.expected,
  collected: r.collected,
});

export const mapUnitDetail = (u: P.UnitDetail): UnitDetailItem => ({
  id:            u.id,
  label:         u.label,
  tenant:        u.tenant ? mapTenant(u.tenant) : null,
  lease:         u.lease  ? mapLease(u.lease)   : null,
  paymentStatus: u.payment_status,
});

export const mapPropertyDetail = (d: P.PropertyDetailData): PropertyDetailData => ({
  property: mapProperty(d.property),
  units:    d.units.map(mapUnitDetail),
});

const mapTenantStanding = (s: P.TenantStanding): TenantStanding => ({
  totalPayments:  s.total_payments,
  onTimePayments: s.on_time_payments,
  score:          s.score,
  label:          s.label,
});

export const mapTenantProfile = (d: P.TenantProfileData): TenantProfile => ({
  tenant:   mapTenant(d.tenant),
  lease:    d.lease    ? mapLease(d.lease)       : null,
  unit:     d.unit     ? mapUnit(d.unit)          : null,
  property: d.property ? mapProperty(d.property)  : null,
  payments: d.payments.map(mapPayment),
  standing: d.standing ? mapTenantStanding(d.standing) : null,
});

export const mapTenantDashboard = (d: P.TenantProfileData): TenantDashboardData => ({
  tenantId:   d.tenant.id,
  tenantName: d.tenant.name,
  lease:      d.lease    ? mapLease(d.lease)      : null,
  unit:       d.unit     ? mapUnit(d.unit)         : null,
  property:   d.property ? mapProperty(d.property) : null,
});

export const mapTenantDashboardPayments = (d: P.TenantProfileData): Payment[] =>
  d.payments.map(mapPayment);

export const mapManagerDashboard = (d: P.ManagerDashboardData): ManagerDashboardData => ({
  stats:            mapDashboardStats(d.stats),
  paymentBreakdown: mapPaymentBreakdown(d.payment_breakdown),
  monthlyRevenue:   d.monthly_revenue.map(mapMonthlyRevenue),
  properties:       d.properties.map(mapPropertySummary),
});
