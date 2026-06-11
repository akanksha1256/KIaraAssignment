export interface Property { id: string; name: string; address: string }
export interface Unit     { id: string; propertyId: string; label: string }
export interface Tenant   { id: string; name: string; contact: string }
export interface Lease    { id: string; unitId: string; tenantId: string; startDate: string; endDate: string; monthlyRent: number; terms: string }

export type PaymentStatus = "paid" | "outstanding" | "overdue";
export interface Payment  { id: string; leaseId: string; periodMonth: string; amountDue: number; amountPaid: number; status: PaymentStatus; paidDate: string | null; method: string | null }
export interface PaymentMethod { id: string; tenantId: string; label: string }

export type PropertyStatus = "paid" | "outstanding" | "overdue" | "vacant";
export interface PropertySummary { id: string; name: string; address: string; unitCount: number; leasedCount: number; totalRent: number; status: PropertyStatus }

export interface TenantStanding { totalPayments: number; onTimePayments: number; score: number; label: "Excellent" | "Good" | "Fair" | "Poor" }

export interface DashboardStats {
  totalProperties:    number;
  totalUnits:         number;
  occupiedUnits:      number;
  vacantUnits:        number;
  totalMonthlyRent:   number;
  collectedThisMonth: number;
}

export interface PaymentBreakdown { paid: number; outstanding: number; overdue: number }

export interface MonthlyRevenue { month: string; expected: number; collected: number }

export interface ManagerDashboardData {
  stats:            DashboardStats;
  paymentBreakdown: PaymentBreakdown;
  monthlyRevenue:   MonthlyRevenue[];
  properties:       PropertySummary[];
}
