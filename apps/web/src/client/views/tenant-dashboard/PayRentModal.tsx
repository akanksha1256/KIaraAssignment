"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePaymentMethods, usePayRent, useAddPaymentMethod } from "@repo/data";
import { useToast } from "@repo/ui";
import { strings } from "@repo/tokens";
import { formatPeriodMonth } from "@repo/ui";
import { X, CreditCard, CheckCircle2, Plus, Loader2 } from "lucide-react";

const s = strings.tenant.payRentModal;

type ModalState = "selecting" | "processing" | "success" | "error";

interface Props {
  tenantId: string;
  leaseId: string;
  periodMonth: string;
  amountDue: number;
  onClose: () => void;
}

export const PayRentModal = ({ tenantId, leaseId, periodMonth, amountDue, onClose }: Props) => {
  const { showToast } = useToast();
  const backdropRef = useRef<HTMLDivElement>(null);

  const { data: methods = [], isLoading: methodsLoading } = usePaymentMethods(tenantId);
  const payRent = usePayRent(tenantId, leaseId);
  const addMethod = useAddPaymentMethod(tenantId);

  const [selectedMethodId, setSelectedMethodId] = useState<string>(() => methods[0]?.id ?? "");
  const [newLabel, setNewLabel] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [modalState, setModalState] = useState<ModalState>("selecting");

  useEffect(() => {
    if (methods.length > 0 && !selectedMethodId) {
      setSelectedMethodId(methods[0].id);
    }
  }, [methods, selectedMethodId]);

  // Escape key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && modalState !== "processing") onClose();
    },
    [onClose, modalState],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current && modalState !== "processing") onClose();
  };

  const handleAddMethod = () => {
    if (!newLabel.trim()) return;
    addMethod.mutate(
      { label: newLabel.trim() },
      {
        onSuccess: (method) => {
          setSelectedMethodId(method.id);
          setNewLabel("");
          setShowAddForm(false);
        },
      },
    );
  };

  const handlePay = () => {
    if (!selectedMethodId) return;
    setModalState("processing");
    payRent.mutate(
      { periodMonth, paymentMethodId: selectedMethodId },
      {
        onSuccess: () => {
          setModalState("success");
        },
        onError: (err) => {
          setModalState("error");
          showToast(`${s.errorPrefix} ${(err as Error).message}`, "error");
        },
      },
    );
  };

  const selectedMethod = methods.find((m) => m.id === selectedMethodId);

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-espresso-900/50 backdrop-blur-[2px]"
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden">
        {/* Success state */}
        {modalState === "success" ? (
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-teal-600" />
            </div>
            <div>
              <h2 className="font-serif text-[24px] font-semibold text-espresso-900">Payment sent!</h2>
              <p className="text-[14px] text-muted-foreground mt-2">
                ${amountDue.toLocaleString()} for {formatPeriodMonth(periodMonth)} has been processed
                {selectedMethod ? ` via ${selectedMethod.label}` : ""}.
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 inline-flex h-10 px-8 items-center rounded-full bg-teal-600 text-white text-[14px] font-medium hover:bg-teal-700 transition-colors duration-normal ease-kiara focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-sand-200 flex items-start justify-between">
              <div>
                <p className="t-overline text-muted-foreground mb-1">{formatPeriodMonth(periodMonth)}</p>
                <h2 id="modal-title" className="font-serif text-[28px] font-semibold text-espresso-900 leading-tight">
                  ${amountDue.toLocaleString()}
                </h2>
                <p className="text-[13px] text-muted-foreground mt-0.5">Amount due this period</p>
              </div>
              <button
                onClick={onClose}
                disabled={modalState === "processing"}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-sand-100 transition-colors duration-normal ease-kiara mt-1 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <p className="text-[13px] font-semibold text-espresso-700 mb-3 t-overline">
                Payment method
              </p>

              {methodsLoading ? (
                <div className="flex items-center gap-2 py-4 text-muted-foreground text-[14px]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading methods…
                </div>
              ) : (
                <div className="space-y-2">
                  {methods.map((m) => {
                    const isSelected = selectedMethodId === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMethodId(m.id)}
                        disabled={modalState === "processing"}
                        className={[
                          "w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-normal ease-kiara focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isSelected
                            ? "border-coral-500 bg-coral-50 ring-1 ring-coral-500"
                            : "border-sand-400 hover:border-espresso-300 hover:bg-sand-100",
                          "disabled:opacity-50",
                        ].join(" ")}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-none ${isSelected ? "bg-coral-500" : "bg-sand-200"}`}>
                          <CreditCard className={`h-4 w-4 ${isSelected ? "text-white" : "text-espresso-500"}`} />
                        </div>
                        <span className={`text-[14px] font-medium ${isSelected ? "text-espresso-900" : "text-espresso-700"}`}>
                          {m.label}
                        </span>
                        {isSelected && (
                          <div className="ml-auto w-4 h-4 rounded-full bg-coral-500 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}

                  {/* Add method toggle */}
                  {!showAddForm ? (
                    <button
                      onClick={() => setShowAddForm(true)}
                      disabled={modalState === "processing"}
                      className="w-full flex items-center gap-3 rounded-xl border border-dashed border-sand-400 px-4 py-3 text-[13.5px] text-muted-foreground hover:border-espresso-300 hover:bg-sand-100 transition-colors duration-normal ease-kiara disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Plus className="h-4 w-4" />
                      Add new method
                    </button>
                  ) : (
                    <div className="rounded-xl border border-sand-400 px-4 py-3 space-y-2">
                      <input
                        autoFocus
                        type="text"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddMethod()}
                        placeholder="e.g. Visa ending in 4242"
                        disabled={addMethod.isPending}
                        className="w-full text-[14px] text-espresso-900 placeholder:text-muted-foreground bg-transparent border-0 outline-none focus:ring-0"
                      />
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={handleAddMethod}
                          disabled={!newLabel.trim() || addMethod.isPending}
                          className="inline-flex items-center h-8 px-4 rounded-full bg-espresso-900 text-white text-[13px] font-medium hover:bg-espresso-700 transition-colors duration-normal ease-kiara disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {addMethod.isPending ? (
                            <><Loader2 className="h-3 w-3 animate-spin mr-1.5" /> Adding…</>
                          ) : "Add method"}
                        </button>
                        <button
                          onClick={() => { setShowAddForm(false); setNewLabel(""); }}
                          className="inline-flex items-center h-8 px-4 rounded-full text-muted-foreground text-[13px] hover:bg-sand-100 transition-colors duration-normal ease-kiara focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-3">
              <button
                onClick={onClose}
                disabled={modalState === "processing"}
                className="inline-flex h-10 px-5 items-center rounded-full text-[14px] font-medium text-espresso-700 hover:bg-sand-100 transition-colors duration-normal ease-kiara disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Cancel
              </button>
              <button
                onClick={handlePay}
                disabled={!selectedMethodId || modalState === "processing"}
                className="inline-flex items-center gap-2 h-10 px-6 rounded-full bg-coral-500 text-white text-[14px] font-medium hover:bg-coral-600 transition-colors duration-normal ease-kiara shadow-sm disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {modalState === "processing" ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
                ) : (
                  <>Pay ${amountDue.toLocaleString()}</>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
