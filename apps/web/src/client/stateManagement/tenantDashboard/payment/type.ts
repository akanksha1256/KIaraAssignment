import type { FetchState, FetchStateMap } from "../../types";
import type { Payment, PaymentMethod } from "../../managerDashboard/payment/type";

export type { Payment, PaymentMethod };

export type TenantPaymentState = {
  paymentsByLeaseId:        FetchStateMap<Payment[]>;
  paymentMethodsByTenantId: FetchStateMap<PaymentMethod[]>;
  payRent:                  FetchState<Payment>;
  addMethod:                FetchState<PaymentMethod>;
};
