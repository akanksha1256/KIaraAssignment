// ── Property ─────────────────────────────────────────────────────────────────

export type PropertyStatus = "paid" | "outstanding" | "overdue" | "vacant" | "upcoming";

export const PropertyStatusValues = {
  PAID: "paid",
  OUTSTANDING: "outstanding",
  OVERDUE: "overdue",
  VACANT: "vacant",
} as const satisfies Record<string, PropertyStatus>;

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
  currentPeriodMonth: string | null;
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

export const PaymentStatusValues = {
  PAID: "paid",
  OUTSTANDING: "outstanding",
  OVERDUE: "overdue",
} as const satisfies Record<string, PaymentStatus>;

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

export interface StatsTrend {
  newLeasesThisMonth: number;
  rentAddedThisMonth: number;
  prevCollectionRate: number;
}

export interface PaymentBreakdown {
  paid: number;
  outstanding: number;
  overdue: number;
  overdueAmount: number;
  outstandingAmount: number;
}

export interface MonthlyRevenue {
  month: string;
  expected: number;
  collected: number;
}

export interface AtRiskLease {
  tenantName: string;
  propertyName: string;
  unitLabel: string;
  amountDue: number;
  daysOverdue: number;
  leaseId: string;
  periodMonth: string;
  status: "overdue" | "outstanding";
}

export interface ManagerDashboardData {
  stats: DashboardStats;
  statsTrend: StatsTrend;
  paymentBreakdown: PaymentBreakdown;
  monthlyRevenue: MonthlyRevenue[];
  properties: PropertySummary[];
  atRiskLeases: AtRiskLease[];
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

// ── Payment List ──────────────────────────────────────────────────────────────

export interface PaymentListItem {
  payment: Payment;
  lease: Lease;
  tenant: Tenant;
  unit: Unit;
  property: Property;
}

// ── Tenant List ───────────────────────────────────────────────────────────────

export interface TenantListItem {
  tenant: Tenant;
  lease: Lease | null;
  unit: Unit | null;
  property: Property | null;
  paymentStatus: PaymentStatus | "vacant" | "upcoming";
}

// ── UI shared types ───────────────────────────────────────────────────────────

export type EmptyIcon = "inbox" | "building" | "payment";

export interface PaymentTableActions {
  onReminder: (periodMonth: string) => void;
  onMarkPaid: (periodMonth: string) => void;
  processingPeriodMonth: string | null;
  sendingReminderPeriodMonth: string | null;
}

export interface TenantPaymentActions {
  onPayRent: (periodMonth: string) => void;
  payButtonLabel: string;
}

export interface PaymentHistoryTableProps {
  payments: Payment[];
  loading?: boolean;
  count?: number;
  empty?: string;
  emptyDescription?: string;
  actions?: PaymentTableActions;
  tenantActions?: TenantPaymentActions;
  flashStates?: Record<string, "success" | "error" | null>;
}

export type PaymentsListSortCol = "period" | "paidOn" | "status" | "amount" | "property";
export type PropSortCol = "rent" | "status";
export type SortDir = "asc" | "desc";

export type PaymentsListFilterColKey = "status" | "property" | "period" | "amount";

export interface PaymentsListFilterRow {
  id: number;
  col: PaymentsListFilterColKey;
  value: string;
}

export interface PropertiesTableProps {
  properties: PropertySummary[];
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onUnitNav: (propertyId: string, unitId: string) => void;
  onAddLease: (unit: UnitDetailItem, propertyId: string) => void;
  sortCol: PropSortCol | null;
  sortDir: SortDir;
  onSort: (col: PropSortCol) => void;
  canSortStatus: boolean;
}
