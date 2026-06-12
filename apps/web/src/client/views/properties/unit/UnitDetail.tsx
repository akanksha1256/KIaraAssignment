"use client";

import { useEffect } from "react";
import {
  useAppDispatch,
  useAppSelector,
} from "@/client/stateManagement/mainFile";
import { fetchPropertyById } from "@/client/stateManagement/property/propertySlice";
import {
  fetchTenantPayments,
  managerSendReminder,
  managerMarkPaid,
} from "@/client/stateManagement/tenant/tenantSlice";
import { selectUnitById } from "@/client/stateManagement/unit/unitSelectors";
import { LoadingState } from "@/client/views/LoadingScreen";
import { ErrorState } from "@/client/views/ErrorScreen";
import { EmptyState } from "@/client/views/EmptyScreen";
import { PaymentHistoryTable } from "@/client/views/payments/PaymentHistoryTable";
import { strings } from "@/client/designSystems/strings";
import { CreditCard as CreditCardIcon } from "lucide-react";
import { MainHeader } from "@/client/commonComponents/MainHeader";
import { TenantCard } from "@/client/views/tenant/TenantCard";
import { ManagerLeaseCard } from "@/client/views/lease/ManagerLeaseCard";
import type { Payment } from "@/client/stateManagement/payment/type";
import type { RootState } from "@/client/stateManagement/mainFile";
import { UnitDetailProps } from "../helper";
import { statusConfig } from "@/client/helpers/utils";

const s = strings.manager.unitDetail;

export const UnitDetail = ({ propertyId, unitId }: UnitDetailProps) => {
  const dispatch = useAppDispatch();

  const {
    fetchState: { status, error },
    unit,
  } = useAppSelector(selectUnitById(propertyId, unitId));

  const leaseId = unit?.lease?.id;

  const payments: Payment[] = useAppSelector((state: RootState) =>
    leaseId ? (state.tenant.payments[leaseId]?.data ?? []) : [],
  );
  const paymentsLoading = useAppSelector((state: RootState) =>
    leaseId ? (state.tenant.payments[leaseId]?.loading ?? false) : false,
  );
  const markPaidLoading = useAppSelector(
    (state: RootState) => state.tenant.markPaidState.loading,
  );

  useEffect(() => {
    dispatch(fetchPropertyById(propertyId));
  }, [dispatch, propertyId]);

  useEffect(() => {
    if (leaseId) dispatch(fetchTenantPayments(leaseId));
  }, [dispatch, leaseId]);

  if (status === "pending") return <LoadingState message={s.loading} />;
  if (status === "failed")
    return (
      <ErrorState
        message={error ?? s.error}
        onRetry={() => dispatch(fetchPropertyById(propertyId))}
      />
    );
  if (!unit)
    return <EmptyState title={s.emptyTitle} description={s.emptyDescription} />;

  const { bg, text } = statusConfig[unit.paymentStatus];

  return (
    <div className="space-y-8">
      <MainHeader label={s.backLink} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">{unit.label}</h1>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${bg} ${text}`}
        >
          {s.statusPill[unit.paymentStatus]}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TenantCard tenant={unit.tenant} />
        <ManagerLeaseCard lease={unit.lease} />
      </div>

      {leaseId && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <CreditCardIcon className="h-4 w-4 text-neutral-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
              {s.payments.heading(payments.length)}
            </h2>
          </div>
          <PaymentHistoryTable
            payments={payments}
            loading={paymentsLoading}
            empty={s.payments.empty}
            actions={{
              onReminder: (periodMonth) =>
                leaseId &&
                dispatch(managerSendReminder({ leaseId, periodMonth })),
              onMarkPaid: (periodMonth) =>
                leaseId && dispatch(managerMarkPaid({ leaseId, periodMonth })),
              isProcessing: markPaidLoading,
            }}
          />
        </div>
      )}
    </div>
  );
};
