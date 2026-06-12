"use client";

import { useEffect } from "react";
import {
  useAppDispatch,
  useAppSelector,
} from "@/client/stateManagement/mainFile";
import { fetchTenantProfile } from "@/client/stateManagement/managerDashboard/tenant/tenantSlice";
import { selectTenantProfile } from "@/client/stateManagement/managerDashboard/tenant/tenantSelectors";
import { LoadingState } from "@/client/views/LoadingScreen";
import { ErrorState } from "@/client/views/ErrorScreen";
import { EmptyState } from "@/client/views/EmptyScreen";
import { PaymentHistoryTable } from "@/client/views/payments/PaymentHistoryTable";
import { strings } from "@/client/designSystems/strings";
import { CreditCard as CreditCardIcon } from "lucide-react";
import { MainHeader } from "@/client/commonComponents/MainHeader";
import { TenantInfoCard } from "./TenantInfoCard";
import { TenantCurrentLeaseCard } from "../lease/TenantCurrentLeaseCard";

const s = strings.manager.tenantProfile;

interface Props {
  tenantId: string;
}

export const TenantProfile = ({ tenantId }: Props) => {
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

  const { tenant, lease, unit, property, payments, standing } = profile;
  return (
    <div className="space-y-8">
      <MainHeader label={s.backLink} />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <TenantInfoCard tenant={tenant} standing={standing} />
        </div>
        <div className="lg:col-span-2">
          <TenantCurrentLeaseCard
            lease={lease}
            unit={unit}
            property={property}
          />
        </div>
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
