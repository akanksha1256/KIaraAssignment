import type { Property, Unit, Tenant, Lease, Payment, PaymentMethod } from "@/platform/types";

const properties: Property[] = [
  { id: "prop-1", name: "Maple Heights",   address: "123 Maple St, Austin TX 78701" },
  { id: "prop-2", name: "Riverside Lofts", address: "456 River Rd, Austin TX 78702" },
];

const units: Unit[] = [
  { id: "unit-1", property_id: "prop-1", label: "Apt 101" },
  { id: "unit-2", property_id: "prop-1", label: "Apt 102" },
  { id: "unit-3", property_id: "prop-1", label: "Apt 103" },
  { id: "unit-4", property_id: "prop-2", label: "Loft A"  },
  { id: "unit-5", property_id: "prop-2", label: "Loft B"  },
  { id: "unit-6", property_id: "prop-2", label: "Loft C"  },
  { id: "unit-7", property_id: "prop-2", label: "Loft D"  },
];

const tenants: Tenant[] = [
  { id: "tenant-1", name: "Alice Johnson", contact: "+1 512-555-0101", email: "alice@example.com",  kyc_status: "verified",       kyc_verified_on: "2024-01-15T00:00:00.000Z", kyc_document: "/documents/kyc-sample.pdf" },
  { id: "tenant-2", name: "Bob Martinez",  contact: "+1 512-555-0102", email: "bob@example.com",    kyc_status: "verified",       kyc_verified_on: "2024-03-10T00:00:00.000Z", kyc_document: "/documents/kyc-sample.pdf" },
  { id: "tenant-3", name: "Carol White",   contact: "+1 512-555-0103", email: "carol@example.com",  kyc_status: "pending",        kyc_verified_on: null,                       kyc_document: "/documents/kyc-sample.pdf" },
  { id: "tenant-4", name: "David Kim",     contact: "+1 512-555-0104", email: "david@example.com",  kyc_status: "verified",       kyc_verified_on: "2024-02-20T00:00:00.000Z", kyc_document: "/documents/kyc-sample.pdf" },
  { id: "tenant-5", name: "Eva Rossi",     contact: "+1 512-555-0105", email: "eva@example.com",    kyc_status: "not_submitted",  kyc_verified_on: null,                       kyc_document: null                        },
];

const leases: Lease[] = [
  { id: "lease-1", unit_id: "unit-1", tenant_id: "tenant-1", start_date: "2024-01-01T00:00:00.000Z", end_date: "2024-12-31T00:00:00.000Z", monthly_rent: 1800, terms: "12-month lease. No pets. Utilities included. $500 security deposit.",           lease_document: "/documents/lease-sample.pdf" },
  { id: "lease-2", unit_id: "unit-2", tenant_id: "tenant-2", start_date: "2024-03-01T00:00:00.000Z", end_date: "2025-02-28T00:00:00.000Z", monthly_rent: 2100, terms: "12-month lease. Pets allowed with deposit. Tenant pays utilities.",              lease_document: "/documents/lease-sample.pdf" },
  // unit-3 (Apt 103) is vacant — no lease
  { id: "lease-3", unit_id: "unit-4", tenant_id: "tenant-3", start_date: "2024-06-01T00:00:00.000Z", end_date: "2025-05-31T00:00:00.000Z", monthly_rent: 2500, terms: "12-month lease. No smoking. Parking included. $800 security deposit.",           lease_document: "/documents/lease-sample.pdf" },
  { id: "lease-4", unit_id: "unit-5", tenant_id: "tenant-4", start_date: "2024-02-01T00:00:00.000Z", end_date: "2025-01-31T00:00:00.000Z", monthly_rent: 2800, terms: "12-month lease. Pets allowed. Rooftop access included. $900 security deposit.",  lease_document: "/documents/lease-sample.pdf" },
  { id: "lease-5", unit_id: "unit-6", tenant_id: "tenant-5", start_date: "2024-04-01T00:00:00.000Z", end_date: "2025-03-31T00:00:00.000Z", monthly_rent: 3200, terms: "12-month lease. No subletting. Gym access included. $1,000 security deposit.",  lease_document: "/documents/lease-sample.pdf" },
  // unit-7 (Loft D) is vacant — no lease
];

const payments: Payment[] = [
  // Alice – lease-1
  { id: "pay-1",  lease_id: "lease-1", period_month: "2024-01", amount_due: 1800, amount_paid: 1800, status: "paid",        paid_date: "2024-01-02T00:00:00.000Z", method: "Bank Transfer" },
  { id: "pay-2",  lease_id: "lease-1", period_month: "2024-02", amount_due: 1800, amount_paid: 1800, status: "paid",        paid_date: "2024-02-01T00:00:00.000Z", method: "Bank Transfer" },
  { id: "pay-3",  lease_id: "lease-1", period_month: "2024-03", amount_due: 1800, amount_paid: 1800, status: "paid",        paid_date: "2024-03-03T00:00:00.000Z", method: "Bank Transfer" },
  { id: "pay-4",  lease_id: "lease-1", period_month: "2024-04", amount_due: 1800, amount_paid: 1800, status: "paid",        paid_date: "2024-04-01T00:00:00.000Z", method: "Credit Card"   },
  { id: "pay-5",  lease_id: "lease-1", period_month: "2024-05", amount_due: 1800, amount_paid: 1800, status: "paid",        paid_date: "2024-05-01T00:00:00.000Z", method: "Bank Transfer" },
  { id: "pay-6",  lease_id: "lease-1", period_month: "2024-06", amount_due: 1800, amount_paid: 0,    status: "overdue",     paid_date: null,                       method: null            },
  { id: "pay-7",  lease_id: "lease-1", period_month: "2024-07", amount_due: 1800, amount_paid: 0,    status: "outstanding", paid_date: null,                       method: null            },
  // Bob – lease-2
  { id: "pay-8",  lease_id: "lease-2", period_month: "2024-03", amount_due: 2100, amount_paid: 2100, status: "paid",        paid_date: "2024-03-01T00:00:00.000Z", method: "Credit Card"   },
  { id: "pay-9",  lease_id: "lease-2", period_month: "2024-04", amount_due: 2100, amount_paid: 2100, status: "paid",        paid_date: "2024-04-05T00:00:00.000Z", method: "Credit Card"   },
  { id: "pay-10", lease_id: "lease-2", period_month: "2024-05", amount_due: 2100, amount_paid: 2100, status: "paid",        paid_date: "2024-05-02T00:00:00.000Z", method: "Credit Card"   },
  { id: "pay-11", lease_id: "lease-2", period_month: "2024-06", amount_due: 2100, amount_paid: 0,    status: "overdue",     paid_date: null,                       method: null            },
  { id: "pay-12", lease_id: "lease-2", period_month: "2024-07", amount_due: 2100, amount_paid: 0,    status: "outstanding", paid_date: null,                       method: null            },
  // Carol – lease-3
  { id: "pay-13", lease_id: "lease-3", period_month: "2024-06", amount_due: 2500, amount_paid: 2500, status: "paid",        paid_date: "2024-06-01T00:00:00.000Z", method: "Bank Transfer" },
  { id: "pay-14", lease_id: "lease-3", period_month: "2024-07", amount_due: 2500, amount_paid: 0,    status: "outstanding", paid_date: null,                       method: null            },
  // David – lease-4
  { id: "pay-15", lease_id: "lease-4", period_month: "2024-02", amount_due: 2800, amount_paid: 2800, status: "paid",        paid_date: "2024-02-01T00:00:00.000Z", method: "Bank Transfer" },
  { id: "pay-16", lease_id: "lease-4", period_month: "2024-03", amount_due: 2800, amount_paid: 2800, status: "paid",        paid_date: "2024-03-02T00:00:00.000Z", method: "Bank Transfer" },
  { id: "pay-17", lease_id: "lease-4", period_month: "2024-04", amount_due: 2800, amount_paid: 2800, status: "paid",        paid_date: "2024-04-01T00:00:00.000Z", method: "Bank Transfer" },
  { id: "pay-18", lease_id: "lease-4", period_month: "2024-05", amount_due: 2800, amount_paid: 2800, status: "paid",        paid_date: "2024-05-01T00:00:00.000Z", method: "Bank Transfer" },
  { id: "pay-19", lease_id: "lease-4", period_month: "2024-06", amount_due: 2800, amount_paid: 2800, status: "paid",        paid_date: "2024-06-01T00:00:00.000Z", method: "Bank Transfer" },
  { id: "pay-20", lease_id: "lease-4", period_month: "2024-07", amount_due: 2800, amount_paid: 0,    status: "outstanding", paid_date: null,                       method: null            },
  // Eva – lease-5
  { id: "pay-21", lease_id: "lease-5", period_month: "2024-04", amount_due: 3200, amount_paid: 3200, status: "paid",        paid_date: "2024-04-03T00:00:00.000Z", method: "Credit Card"   },
  { id: "pay-22", lease_id: "lease-5", period_month: "2024-05", amount_due: 3200, amount_paid: 3200, status: "paid",        paid_date: "2024-05-01T00:00:00.000Z", method: "Credit Card"   },
  { id: "pay-23", lease_id: "lease-5", period_month: "2024-06", amount_due: 3200, amount_paid: 0,    status: "overdue",     paid_date: null,                       method: null            },
  { id: "pay-24", lease_id: "lease-5", period_month: "2024-07", amount_due: 3200, amount_paid: 0,    status: "outstanding", paid_date: null,                       method: null            },
];

const paymentMethods: PaymentMethod[] = [
  { id: "pm-1", tenant_id: "tenant-1", label: "Chase ••••4242"      },
  { id: "pm-2", tenant_id: "tenant-2", label: "Visa ••••1234"       },
  { id: "pm-3", tenant_id: "tenant-4", label: "Amex ••••9876"       },
  { id: "pm-4", tenant_id: "tenant-5", label: "Mastercard ••••5555" },
];

export const db = {
  properties:     [...properties],
  units:          [...units],
  tenants:        [...tenants],
  leases:         [...leases],
  payments:       [...payments],
  paymentMethods: [...paymentMethods],
};

export function getCurrentPeriodMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function isOverdue(period_month: string): boolean {
  const [year, month] = period_month.split("-").map(Number);
  return new Date() > new Date(year, month - 1, 5);
}

let nextId = 100;
export function generateId(prefix: string): string {
  return `${prefix}-${++nextId}`;
}
