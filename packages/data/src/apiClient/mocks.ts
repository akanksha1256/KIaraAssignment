import type * as P from "@repo/platform-types";

export const rawPayment: P.Payment = {
  id: "pay-1",
  lease_id: "lease-1",
  period_month: "2024-06",
  amount_due: 1500,
  amount_paid: 1500,
  status: "paid",
  paid_date: "2024-06-01T00:00:00.000Z",
  method: "Bank Transfer",
  last_reminded_on: null,
};

export const rawPaymentPaid: P.Payment = {
  id: "pay-2",
  lease_id: "lease-1",
  period_month: "2024-07",
  amount_due: 1500,
  amount_paid: 1500,
  status: "paid",
  paid_date: "2024-07-05T00:00:00.000Z",
  method: "Visa ending 4242",
  last_reminded_on: null,
};

export const rawPaymentReminded: P.Payment = {
  id: "pay-1",
  lease_id: "lease-1",
  period_month: "2024-06",
  amount_due: 1500,
  amount_paid: 0,
  status: "outstanding",
  paid_date: null,
  method: null,
  last_reminded_on: "2024-06-10T09:00:00.000Z",
};

export const rawPaymentMethod: P.PaymentMethod = {
  id: "pm-1",
  tenant_id: "tenant-1",
  label: "Visa ending 4242",
};

export const rawPaymentMethodNew: P.PaymentMethod = {
  id: "pm-2",
  tenant_id: "tenant-1",
  label: "Mastercard",
};

export const rawTenant: P.Tenant = {
  id: "tenant-1",
  name: "Alice Johnson",
  contact: "555-0100",
  email: "alice@example.com",
  kyc_status: "verified",
  kyc_verified_on: "2024-01-10T00:00:00.000Z",
  kyc_document: "passport",
};
