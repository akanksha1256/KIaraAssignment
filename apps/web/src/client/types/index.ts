// ── Property ─────────────────────────────────────────────────────────────────

export type PropertyStatus = "paid" | "outstanding" | "overdue" | "vacant";

export interface Property {
  id: string;
  name: string;
  address: string;
  managerName: string;
  managerEmail: string;
  managerContact: string;
}

export interface PropertySummary {
  id: string;
  name: string;
  address: string;
  unitCount: number;
  leasedCount: number;
  totalRent: number;
  status: PropertyStatus;
}

export interface UnitDetailItem {
  id: string;
  label: string;
  tenant: Tenant | null;
  lease: Lease | null;
  paymentStatus: PropertyStatus;
}

export interface PropertyDetailData {
  property: Property;
  units: UnitDetailItem[];
}

// ── Unit ─────────────────────────────────────────────────────────────────────

export interface Unit {
  id: string;
  propertyId: string;
  label: string;
}

// ── Lease ────────────────────────────────────────────────────────────────────

export interface Lease {
  id: string;
  unitId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  terms: string;
  leaseDocument: string | null;
}

// ── Tenant ───────────────────────────────────────────────────────────────────

export type KycStatus = "verified" | "pending" | "not_submitted";

export interface Tenant {
  id: string;
  name: string;
  contact: string;
  email: string;
  kycStatus: KycStatus;
  kycVerifiedOn: string | null;
  kycDocument: string | null;
}

export interface TenantStanding {
  totalPayments: number;
  onTimePayments: number;
  score: number;
  label: "Excellent" | "Good" | "Fair" | "Poor";
}

export interface TenantProfile {
  tenant: Tenant;
  lease: Lease | null;
  unit: Unit | null;
  property: Property | null;
  payments: Payment[];
  standing: TenantStanding | null;
}

// ── Payment ──────────────────────────────────────────────────────────────────

export type PaymentStatus = "paid" | "outstanding" | "overdue";

export interface Payment {
  id: string;
  leaseId: string;
  periodMonth: string;
  amountDue: number;
  amountPaid: number;
  status: PaymentStatus;
  paidDate: string | null;
  method: string | null;
  lastRemindedOn: string | null;
}

export interface PaymentMethod {
  id: string;
  tenantId: string;
  label: string;
}

// ── Manager Dashboard ────────────────────────────────────────────────────────

export interface DashboardStats {
  totalProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  totalMonthlyRent: number;
  collectedThisMonth: number;
}

export interface PaymentBreakdown {
  paid: number;
  outstanding: number;
  overdue: number;
}

export interface MonthlyRevenue {
  month: string;
  expected: number;
  collected: number;
}

export interface ManagerDashboardData {
  stats: DashboardStats;
  paymentBreakdown: PaymentBreakdown;
  monthlyRevenue: MonthlyRevenue[];
  properties: PropertySummary[];
}

// ── Tenant Dashboard ─────────────────────────────────────────────────────────

export interface TenantDashboardData {
  tenantId: string;
  tenantName: string;
  lease: Lease | null;
  unit: Unit | null;
  property: Property | null;
}

export interface TenantDashboardResponse {
  dashboard: TenantDashboardData;
  payments: Payment[];
}
