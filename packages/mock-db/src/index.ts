import type {
  Property,
  Unit,
  Tenant,
  Lease,
  Payment,
  PaymentMethod,
} from "@repo/types";

// ─── Seed data ────────────────────────────────────────────────────────────────

const properties: Property[] = [
  { id: "prop-1", name: "Maple Heights", address: "123 Maple St, Austin TX 78701" },
  { id: "prop-2", name: "Riverside Lofts", address: "456 River Rd, Austin TX 78702" },
];

const units: Unit[] = [
  { id: "unit-1", propertyId: "prop-1", label: "Apt 101" },
  { id: "unit-2", propertyId: "prop-1", label: "Apt 102" },
  { id: "unit-3", propertyId: "prop-1", label: "Apt 103" },
  { id: "unit-4", propertyId: "prop-2", label: "Loft A" },
  { id: "unit-5", propertyId: "prop-2", label: "Loft B" },
  { id: "unit-6", propertyId: "prop-2", label: "Loft C" },
  { id: "unit-7", propertyId: "prop-2", label: "Loft D" },
];

const tenants: Tenant[] = [
  { id: "tenant-1", name: "Alice Johnson", contact: "alice@example.com" },
  { id: "tenant-2", name: "Bob Martinez", contact: "bob@example.com" },
  { id: "tenant-3", name: "Carol White", contact: "carol@example.com" },
  { id: "tenant-4", name: "David Kim", contact: "david@example.com" },
  { id: "tenant-5", name: "Eva Rossi", contact: "eva@example.com" },
];

const leases: Lease[] = [
  {
    id: "lease-1",
    unitId: "unit-1",
    tenantId: "tenant-1",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    monthlyRent: 1800,
    terms: "12-month lease. No pets. Utilities included. $500 security deposit.",
  },
  {
    id: "lease-2",
    unitId: "unit-2",
    tenantId: "tenant-2",
    startDate: "2024-03-01",
    endDate: "2025-02-28",
    monthlyRent: 2100,
    terms: "12-month lease. Pets allowed with deposit. Tenant pays utilities.",
  },
  // unit-3 (Apt 103) is vacant — no lease
  {
    id: "lease-3",
    unitId: "unit-4",
    tenantId: "tenant-3",
    startDate: "2024-06-01",
    endDate: "2025-05-31",
    monthlyRent: 2500,
    terms: "12-month lease. No smoking. Parking included. $800 security deposit.",
  },
  {
    id: "lease-4",
    unitId: "unit-5",
    tenantId: "tenant-4",
    startDate: "2024-02-01",
    endDate: "2025-01-31",
    monthlyRent: 2800,
    terms: "12-month lease. Pets allowed. Rooftop access included. $900 security deposit.",
  },
  {
    id: "lease-5",
    unitId: "unit-6",
    tenantId: "tenant-5",
    startDate: "2024-04-01",
    endDate: "2025-03-31",
    monthlyRent: 3200,
    terms: "12-month lease. No subletting. Gym access included. $1,000 security deposit.",
  },
  // unit-7 (Loft D) is vacant — no lease
];

const payments: Payment[] = [
  // Alice – lease-1: mostly on time, one overdue
  { id: "pay-1",  leaseId: "lease-1", periodMonth: "2024-01", amountDue: 1800, amountPaid: 1800, status: "paid",        paidDate: "2024-01-02", method: "Bank Transfer" },
  { id: "pay-2",  leaseId: "lease-1", periodMonth: "2024-02", amountDue: 1800, amountPaid: 1800, status: "paid",        paidDate: "2024-02-01", method: "Bank Transfer" },
  { id: "pay-3",  leaseId: "lease-1", periodMonth: "2024-03", amountDue: 1800, amountPaid: 1800, status: "paid",        paidDate: "2024-03-03", method: "Bank Transfer" },
  { id: "pay-4",  leaseId: "lease-1", periodMonth: "2024-04", amountDue: 1800, amountPaid: 1800, status: "paid",        paidDate: "2024-04-01", method: "Credit Card"  },
  { id: "pay-5",  leaseId: "lease-1", periodMonth: "2024-05", amountDue: 1800, amountPaid: 1800, status: "paid",        paidDate: "2024-05-01", method: "Bank Transfer" },
  { id: "pay-6",  leaseId: "lease-1", periodMonth: "2024-06", amountDue: 1800, amountPaid: 0,    status: "overdue",     paidDate: null,         method: null           },
  { id: "pay-7",  leaseId: "lease-1", periodMonth: "2024-07", amountDue: 1800, amountPaid: 0,    status: "outstanding", paidDate: null,         method: null           },

  // Bob – lease-2: mixed
  { id: "pay-8",  leaseId: "lease-2", periodMonth: "2024-03", amountDue: 2100, amountPaid: 2100, status: "paid",        paidDate: "2024-03-01", method: "Credit Card"  },
  { id: "pay-9",  leaseId: "lease-2", periodMonth: "2024-04", amountDue: 2100, amountPaid: 2100, status: "paid",        paidDate: "2024-04-05", method: "Credit Card"  },
  { id: "pay-10", leaseId: "lease-2", periodMonth: "2024-05", amountDue: 2100, amountPaid: 2100, status: "paid",        paidDate: "2024-05-02", method: "Credit Card"  },
  { id: "pay-11", leaseId: "lease-2", periodMonth: "2024-06", amountDue: 2100, amountPaid: 0,    status: "overdue",     paidDate: null,         method: null           },
  { id: "pay-12", leaseId: "lease-2", periodMonth: "2024-07", amountDue: 2100, amountPaid: 0,    status: "outstanding", paidDate: null,         method: null           },

  // Carol – lease-3: perfect
  { id: "pay-13", leaseId: "lease-3", periodMonth: "2024-06", amountDue: 2500, amountPaid: 2500, status: "paid",        paidDate: "2024-06-01", method: "Bank Transfer" },
  { id: "pay-14", leaseId: "lease-3", periodMonth: "2024-07", amountDue: 2500, amountPaid: 0,    status: "outstanding", paidDate: null,         method: null           },

  // David – lease-4: all paid
  { id: "pay-15", leaseId: "lease-4", periodMonth: "2024-02", amountDue: 2800, amountPaid: 2800, status: "paid",        paidDate: "2024-02-01", method: "Bank Transfer" },
  { id: "pay-16", leaseId: "lease-4", periodMonth: "2024-03", amountDue: 2800, amountPaid: 2800, status: "paid",        paidDate: "2024-03-02", method: "Bank Transfer" },
  { id: "pay-17", leaseId: "lease-4", periodMonth: "2024-04", amountDue: 2800, amountPaid: 2800, status: "paid",        paidDate: "2024-04-01", method: "Bank Transfer" },
  { id: "pay-18", leaseId: "lease-4", periodMonth: "2024-05", amountDue: 2800, amountPaid: 2800, status: "paid",        paidDate: "2024-05-01", method: "Bank Transfer" },
  { id: "pay-19", leaseId: "lease-4", periodMonth: "2024-06", amountDue: 2800, amountPaid: 2800, status: "paid",        paidDate: "2024-06-01", method: "Bank Transfer" },
  { id: "pay-20", leaseId: "lease-4", periodMonth: "2024-07", amountDue: 2800, amountPaid: 0,    status: "outstanding", paidDate: null,         method: null           },

  // Eva – lease-5: one overdue
  { id: "pay-21", leaseId: "lease-5", periodMonth: "2024-04", amountDue: 3200, amountPaid: 3200, status: "paid",        paidDate: "2024-04-03", method: "Credit Card"  },
  { id: "pay-22", leaseId: "lease-5", periodMonth: "2024-05", amountDue: 3200, amountPaid: 3200, status: "paid",        paidDate: "2024-05-01", method: "Credit Card"  },
  { id: "pay-23", leaseId: "lease-5", periodMonth: "2024-06", amountDue: 3200, amountPaid: 0,    status: "overdue",     paidDate: null,         method: null           },
  { id: "pay-24", leaseId: "lease-5", periodMonth: "2024-07", amountDue: 3200, amountPaid: 0,    status: "outstanding", paidDate: null,         method: null           },
];

const paymentMethods: PaymentMethod[] = [
  { id: "pm-1", tenantId: "tenant-1", label: "Chase ••••4242" },
  { id: "pm-2", tenantId: "tenant-2", label: "Visa ••••1234" },
  { id: "pm-3", tenantId: "tenant-4", label: "Amex ••••9876" },
  { id: "pm-4", tenantId: "tenant-5", label: "Mastercard ••••5555" },
];

// ─── In-memory store ──────────────────────────────────────────────────────────

export const db = {
  properties: [...properties],
  units: [...units],
  tenants: [...tenants],
  leases: [...leases],
  payments: [...payments],
  paymentMethods: [...paymentMethods],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getCurrentPeriodMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function isOverdue(periodMonth: string): boolean {
  const [year, month] = periodMonth.split("-").map(Number);
  const dueDate = new Date(year, month - 1, 5);
  return new Date() > dueDate;
}

let nextId = 100;
export function generateId(prefix: string): string {
  return `${prefix}-${++nextId}`;
}
