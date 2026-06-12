"use client";

import { useEffect } from "react";
import {
  useAppDispatch,
  useAppSelector,
} from "@/client/stateManagement/mainFile";
import { fetchTenantProfile } from "@/client/stateManagement/tenant/tenantSlice";
import { selectTenantProfile } from "@/client/stateManagement/tenant/tenantSelectors";
import { LoadingState } from "@/client/views/LoadingScreen";
import { ErrorState } from "@/client/views/ErrorScreen";
import { EmptyState } from "@/client/views/EmptyScreen";
import { PaymentHistoryTable } from "@/client/views/payments/PaymentHistoryTable";
import { PropertyInfoCard } from "./PropertyInfoCard";
import { ManagerInfoCard } from "./ManagerInfoCard";
import { LeaseDetailsCard } from "./LeaseDetailsCard";
import { CreditCard as CreditCardIcon } from "lucide-react";
import { strings } from "@/client/designSystems/strings";

const s = strings.tenant.dashboard;

interface Props {
  tenantId: string;
}

export const TenantDashboard = ({ tenantId }: Props) => {
  const dispatch = useAppDispatch();

  const { status, error, profile } = useAppSelector(
    selectTenantProfile(tenantId),
  );

  useEffect(() => {
    dispatch(fetchTenantProfile(tenantId));
  }, [dispatch, tenantId]);

  if (status === "pending") return <LoadingState message={s.loading} />;
  if (error)
    return (
      <ErrorState
        message={error}
        onRetry={() => dispatch(fetchTenantProfile(tenantId))}
      />
    );
  if (!profile)
    return <EmptyState title={s.emptyTitle} description={s.emptyDescription} />;

  const { tenant, lease, unit, property, payments } = profile;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          {s.heading(tenant.name)}
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
        <PaymentHistoryTable payments={payments} empty={s.payments.empty} />
      </div>
    </div>
  );
};
