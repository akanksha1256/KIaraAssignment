"use client";

import { useEffect, useRef, useState } from "react";
import {
  useAppDispatch,
  useAppSelector,
} from "@/client/stateManagement/mainFile";
import {
  fetchPaymentMethods,
  addPaymentMethod,
  tenantPayRent,
} from "@/client/stateManagement/managerDashboard/payment/paymentSlice";
import {
  selectPaymentMethods,
  selectPayRentState,
  selectAddMethodState,
} from "@/client/stateManagement/managerDashboard/payment/paymentSelectors";
import { useToast } from "@/client/commonComponents/Toast";
import { strings } from "@/client/designSystems/strings";
import { formatPeriodMonth } from "@/client/helpers/utils";

const s = strings.tenant.payRentModal;

interface Props {
  tenantId: string;
  leaseId: string;
  periodMonth: string;
  amountDue: number;
  onClose: () => void;
}

export function PayRentModal({
  tenantId,
  leaseId,
  periodMonth,
  amountDue,
  onClose,
}: Props) {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const { methods, loading: methodsLoading } = useAppSelector(
    selectPaymentMethods(tenantId),
  );
  const payRentState = useAppSelector(selectPayRentState);
  const addMethodState = useAppSelector(selectAddMethodState);

  const [selectedMethodId, setSelectedMethodId] = useState<string>("");
  const [newLabel, setNewLabel] = useState("");

  const payingRef = useRef(false);
  const addingRef = useRef(false);

  useEffect(() => {
    if (!methods) dispatch(fetchPaymentMethods(tenantId));
  }, [dispatch, tenantId, methods]);

  useEffect(() => {
    if (methods && methods.length > 0 && !selectedMethodId) {
      setSelectedMethodId(methods[0].id);
    }
  }, [methods, selectedMethodId]);

  // Handle add-method completion
  useEffect(() => {
    if (!addingRef.current) return;
    if (!addMethodState.loading && addMethodState.data) {
      setSelectedMethodId(addMethodState.data.id);
      setNewLabel("");
      addingRef.current = false;
    }
  }, [addMethodState]);

  // Handle pay-rent completion
  useEffect(() => {
    if (!payingRef.current) return;
    if (!payRentState.loading && payRentState.data) {
      showToast(s.successToast, "success");
      payingRef.current = false;
      onClose();
    } else if (!payRentState.loading && payRentState.error) {
      showToast(`${s.errorPrefix} ${payRentState.error}`, "error");
      payingRef.current = false;
    }
  }, [payRentState, onClose, showToast]);

  const handleAddMethod = () => {
    if (!newLabel.trim()) return;
    addingRef.current = true;
    dispatch(addPaymentMethod({ tenantId, label: newLabel.trim() }));
  };

  const handlePay = () => {
    if (!selectedMethodId) return;
    payingRef.current = true;
    dispatch(tenantPayRent({ leaseId, periodMonth, paymentMethodId: selectedMethodId }));
  };

  const anyLoading = payRentState.loading || addMethodState.loading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-1 text-lg font-semibold text-neutral-900">
          {s.title(formatPeriodMonth(periodMonth))}
        </h2>
        <p className="mb-6 text-sm text-neutral-500">
          {s.amount}:{" "}
          <span className="font-semibold text-neutral-900">
            ${amountDue.toLocaleString()}
          </span>
        </p>

        {/* Payment method selection */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            {s.selectMethod}
          </label>
          {methodsLoading ? (
            <p className="text-sm text-neutral-400">Loading…</p>
          ) : methods && methods.length > 0 ? (
            <div className="space-y-2">
              {methods.map((m) => (
                <label
                  key={m.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 px-4 py-3 hover:bg-neutral-50 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50"
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={m.id}
                    checked={selectedMethodId === m.id}
                    onChange={() => setSelectedMethodId(m.id)}
                    className="accent-brand-600"
                  />
                  <span className="text-sm text-neutral-800">{m.label}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-400">{s.noMethods}</p>
          )}
        </div>

        {/* Add new payment method */}
        <div className="mb-6">
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            {s.addMethodLabel}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder={s.addMethodPlaceholder}
              disabled={anyLoading}
              className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={handleAddMethod}
              disabled={!newLabel.trim() || anyLoading}
              className="rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200 disabled:opacity-40"
            >
              {addMethodState.loading ? s.addMethodLoading : s.addMethodButton}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={anyLoading}
            className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
          >
            {s.cancel}
          </button>
          <button
            onClick={handlePay}
            disabled={!selectedMethodId || anyLoading}
            className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
          >
            {payRentState.loading ? s.payLoading : s.payButton}
          </button>
        </div>
      </div>
    </div>
  );
}
