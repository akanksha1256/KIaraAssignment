"use client";

import { useEffect, useState } from "react";
import {
  useAppDispatch,
  useAppSelector,
} from "@/client/stateManagement/mainFile";
import { fetchTenantDashboard } from "@/client/stateManagement/tenantDashboard/tenantDashboardSlice";
import { selectTenantDashboard } from "@/client/stateManagement/tenantDashboard/tenantDashboardSelectors";
import { LoadingState } from "@/client/views/LoadingScreen";
import { ErrorState } from "@/client/views/ErrorScreen";
import { EmptyState } from "@/client/views/EmptyScreen";
import { PaymentHistoryTable } from "@/client/views/payments/PaymentHistoryTable";
import { PropertyInfoCard } from "./PropertyInfoCard";
import { ManagerInfoCard } from "./ManagerInfoCard";
import { LeaseDetailsCard } from "./LeaseDetailsCard";
import { PayRentModal } from "./PayRentModal";
import { CreditCard as CreditCardIcon } from "lucide-react";
import { strings } from "@/client/designSystems/strings";

const s = strings.tenant.dashboard;

interface Props {
  tenantId: string;
}

export const TenantDashboard = ({ tenantId }: Props) => {
  const dispatch = useAppDispatch();

  const { status, error, data } = useAppSelector(selectTenantDashboard(tenantId));
  const [payingPeriodMonth, setPayingPeriodMonth] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchTenantDashboard(tenantId));
  }, [dispatch, tenantId]);

  if (status === "pending") return <LoadingState message={s.loading} />;
  if (error)
    return (
      <ErrorState
        message={error}
        onRetry={() => dispatch(fetchTenantDashboard(tenantId))}
      />
    );
  if (!data)
    return <EmptyState title={s.emptyTitle} description={s.emptyDescription} />;

  const { tenantName, lease, unit, property, payments } = data;

  const pendingPayment = payingPeriodMonth
    ? payments.find((p) => p.periodMonth === payingPeriodMonth) ?? null
    : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          {s.heading(tenantName)}
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <PropertyInfoCard property={property} unit={unit} />
        <ManagerInfoCard property={property} />
        <LeaseDetailsCard lease={lease} />
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <CreditCardIcon className="h-4 w-4 text-neutral-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
            {s.payments.heading(payments.length)}
          </h2>
        </div>
        <PaymentHistoryTable
          payments={payments}
          empty={s.payments.empty}
          tenantActions={
            lease
              ? {
                  onPayRent: (periodMonth) => setPayingPeriodMonth(periodMonth),
                  payButtonLabel: s.payments.payButton,
                }
              : undefined
          }
        />
      </div>

      {payingPeriodMonth && pendingPayment && lease && (
        <PayRentModal
          tenantId={tenantId}
          leaseId={lease.id}
          periodMonth={payingPeriodMonth}
          amountDue={pendingPayment.amountDue}
          onClose={() => setPayingPeriodMonth(null)}
        />
      )}
    </div>
  );
};
