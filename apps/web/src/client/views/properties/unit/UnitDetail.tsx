"use client";

import { useEffect, useRef, useState } from "react";
import {
  useAppDispatch,
  useAppSelector,
} from "@/client/stateManagement/mainFile";
import { fetchPropertyById } from "@/client/stateManagement/property/propertySlice";
import {
  fetchTenantPayments,
  managerSendReminder,
  managerMarkPaid,
} from "@/client/stateManagement/payment/paymentSlice";
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
import { useToast } from "@/client/commonComponents/Toast";
import type { Payment } from "@/client/stateManagement/payment/type";
import type { RootState } from "@/client/stateManagement/mainFile";
import { UnitDetailProps } from "../helper";
import { statusConfig } from "@/client/helpers/utils";

const s = strings.manager.unitDetail;
const st = strings.paymentTable;

export const UnitDetail = ({ propertyId, unitId }: UnitDetailProps) => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const {
    fetchState: { status, error },
    unit,
  } = useAppSelector(selectUnitById(propertyId, unitId));

  const leaseId = unit?.lease?.id;
  const tenantName = unit?.tenant?.name ?? "Tenant";

  const payments: Payment[] = useAppSelector((state: RootState) =>
    leaseId ? (state.payment.paymentsByLeaseId[leaseId]?.data ?? []) : [],
  );
  const paymentsLoading = useAppSelector((state: RootState) =>
    leaseId ? (state.payment.paymentsByLeaseId[leaseId]?.loading ?? false) : false,
  );
  const markPaidState = useAppSelector(
    (state: RootState) => state.payment.markPaidState,
  );
  const reminderState = useAppSelector(
    (state: RootState) => state.payment.reminderState,
  );

  const [processingPeriodMonth, setProcessingPeriodMonth] = useState<string | null>(null);
  const processingRef = useRef<string | null>(null);

  const [sendingReminderPeriodMonth, setSendingReminderPeriodMonth] = useState<string | null>(null);
  const reminderRef = useRef<string | null>(null);

  useEffect(() => {
    dispatch(fetchPropertyById(propertyId));
  }, [dispatch, propertyId]);

  useEffect(() => {
    if (leaseId) dispatch(fetchTenantPayments(leaseId));
  }, [dispatch, leaseId]);

  useEffect(() => {
    if (!processingRef.current) return;
    if (!markPaidState.loading && markPaidState.data) {
      showToast("Payment marked as paid successfully.", "success");
      setProcessingPeriodMonth(null);
      processingRef.current = null;
    } else if (!markPaidState.loading && markPaidState.error) {
      showToast(markPaidState.error ?? "Failed to mark payment as paid.", "error");
      setProcessingPeriodMonth(null);
      processingRef.current = null;
    }
  }, [markPaidState, showToast]);

  useEffect(() => {
    if (!reminderRef.current) return;
    if (!reminderState.loading && reminderState.data) {
      showToast(st.actions.reminderToast(tenantName), "success");
      setSendingReminderPeriodMonth(null);
      reminderRef.current = null;
    } else if (!reminderState.loading && reminderState.error) {
      showToast(reminderState.error ?? "Failed to send reminder.", "error");
      setSendingReminderPeriodMonth(null);
      reminderRef.current = null;
    }
  }, [reminderState, showToast, tenantName]);

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

  const handleMarkPaid = (periodMonth: string) => {
    if (!leaseId) return;
    setProcessingPeriodMonth(periodMonth);
    processingRef.current = periodMonth;
    dispatch(managerMarkPaid({ leaseId, periodMonth }));
  };

  const handleSendReminder = (periodMonth: string) => {
    if (!leaseId) return;
    setSendingReminderPeriodMonth(periodMonth);
    reminderRef.current = periodMonth;
    dispatch(managerSendReminder({ leaseId, periodMonth }));
  };

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

      <div className="flex items-stretch gap-6">
        <div className="w-[35%]">
          <TenantCard tenant={unit.tenant} />
        </div>
        <div className="w-[65%]">
          <ManagerLeaseCard lease={unit.lease} />
        </div>
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
              onReminder: handleSendReminder,
              onMarkPaid: handleMarkPaid,
              processingPeriodMonth,
              sendingReminderPeriodMonth,
            }}
          />
        </div>
      )}
    </div>
  );
};
