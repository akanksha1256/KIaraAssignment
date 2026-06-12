"use client";

import { useState, useEffect } from "react";
import { usePaymentMethods } from "@repo/data";
import { usePayRent } from "@repo/data";
import { useAddPaymentMethod } from "@repo/data";
import { useToast, Button } from "@repo/ui";
import { strings } from "@repo/tokens";
import { formatPeriodMonth } from "@repo/ui";

const s = strings.tenant.payRentModal;

interface Props {
  tenantId: string;
  leaseId: string;
  periodMonth: string;
  amountDue: number;
  onClose: () => void;
}

export function PayRentModal({ tenantId, leaseId, periodMonth, amountDue, onClose }: Props) {
  const { showToast } = useToast();

  const { data: methods = [], isLoading: methodsLoading } = usePaymentMethods(tenantId);
  const payRent = usePayRent(tenantId, leaseId);
  const addMethod = useAddPaymentMethod(tenantId);

  const [selectedMethodId, setSelectedMethodId] = useState<string>(() => methods[0]?.id ?? "");
  const [newLabel, setNewLabel] = useState("");

  useEffect(() => {
    if (methods.length > 0 && !selectedMethodId) {
      setSelectedMethodId(methods[0].id);
    }
  }, [methods, selectedMethodId]);

  const handleAddMethod = () => {
    if (!newLabel.trim()) return;
    addMethod.mutate(
      { label: newLabel.trim() },
      {
        onSuccess: (method) => {
          setSelectedMethodId(method.id);
          setNewLabel("");
        },
      },
    );
  };

  const handlePay = () => {
    if (!selectedMethodId) return;
    payRent.mutate(
      { periodMonth, paymentMethodId: selectedMethodId },
      {
        onSuccess: () => {
          showToast(s.successToast, "success");
          onClose();
        },
        onError: (err) => {
          showToast(`${s.errorPrefix} ${(err as Error).message}`, "error");
        },
      },
    );
  };

  const anyLoading = payRent.isPending || addMethod.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-1 text-lg font-semibold text-neutral-900">
          {s.title(formatPeriodMonth(periodMonth))}
        </h2>
        <p className="mb-6 text-sm text-neutral-500">
          {s.amount}:{" "}
          <span className="font-semibold text-neutral-900">${amountDue.toLocaleString()}</span>
        </p>

        {/* Payment method selection */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            {s.selectMethod}
          </label>
          {methodsLoading ? (
            <p className="text-sm text-neutral-400">Loading…</p>
          ) : methods.length > 0 ? (
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
            <Button
              variant="secondary"
              onClick={handleAddMethod}
              disabled={!newLabel.trim() || anyLoading}
            >
              {addMethod.isPending ? s.addMethodLoading : s.addMethodButton}
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={anyLoading}>
            {s.cancel}
          </Button>
          <Button variant="default" onClick={handlePay} disabled={!selectedMethodId || anyLoading}>
            {payRent.isPending ? s.payLoading : s.payButton}
          </Button>
        </div>
      </div>
    </div>
  );
}
