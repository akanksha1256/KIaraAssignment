"use client";

import { useState, useEffect, useRef } from "react";
import FocusTrap from "focus-trap-react";
import { usePaymentMethods, usePayRent, useAddPaymentMethod } from "@repo/data";
import {
  useToast,
  StateTitle,
  BodyText,
  Button,
  Overline,
  ModalHeading,
  MutedText,
  CloseButton,
  Skeleton,
  cn,
} from "@repo/ui";
import { strings } from "@repo/tokens";
import { formatPeriodMonth } from "@repo/ui";
import { CreditCard, CheckCircle2, Plus, Loader2 } from "lucide-react";

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
      <FocusTrap
        focusTrapOptions={{
          escapeDeactivates: () => modalState !== "processing",
          onDeactivate: onClose,
          allowOutsideClick: true,
        }}
      >
        <div className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden">
        {/* Success state */}
        {modalState === "success" ? (
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-teal-600" />
            </div>
            <div>
              <StateTitle>{s.successTitle}</StateTitle>
              <BodyText className="text-muted-foreground mt-2">
                {s.successBody(
                  amountDue.toLocaleString(),
                  formatPeriodMonth(periodMonth),
                  selectedMethod?.label,
                )}
              </BodyText>
            </div>
            <Button variant="teal" onClick={onClose} className="mt-2 px-8">
              Done
            </Button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-sand-200 flex items-start justify-between">
              <div>
                <Overline className="mb-1">{formatPeriodMonth(periodMonth)}</Overline>
                <ModalHeading id="modal-title">${amountDue.toLocaleString()}</ModalHeading>
                <MutedText className="mt-0.5">{s.amountSubtitle}</MutedText>
              </div>
              <CloseButton
                onClick={onClose}
                disabled={modalState === "processing"}
                aria-label="Close"
                className="mt-1 rounded-full"
              />
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <Overline className="mb-3 text-espresso-700">{s.selectMethod}</Overline>

              {methodsLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-sand-200 px-4 py-3">
                      <Skeleton className="w-8 h-8 rounded-full flex-none" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {methods.map((m) => {
                    const isSelected = selectedMethodId === m.id;
                    return (
                      <Button
                        key={m.id}
                        variant="outline"
                        onClick={() => setSelectedMethodId(m.id)}
                        disabled={modalState === "processing"}
                        className={cn(
                          "w-full justify-start rounded-xl h-auto px-4 py-3 text-espresso-900",
                          isSelected
                            ? "border-coral-500 bg-coral-50 ring-1 ring-coral-500"
                            : "border-sand-400 hover:border-espresso-300 hover:bg-sand-100",
                        )}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-none ${isSelected ? "bg-coral-500" : "bg-sand-200"}`}
                        >
                          <CreditCard
                            className={`h-4 w-4 ${isSelected ? "text-white" : "text-espresso-500"}`}
                          />
                        </div>
                        <span
                          className={`text-[14px] font-medium ${isSelected ? "text-espresso-900" : "text-espresso-700"}`}
                        >
                          {m.label}
                        </span>
                        {isSelected && (
                          <div className="ml-auto w-4 h-4 rounded-full bg-coral-500 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          </div>
                        )}
                      </Button>
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
                        <Button
                          size="sm"
                          onClick={handleAddMethod}
                          disabled={!newLabel.trim() || addMethod.isPending}
                          className="bg-espresso-900 hover:bg-espresso-700"
                        >
                          {addMethod.isPending
                            ? <><Loader2 className="h-3 w-3 animate-spin" />{s.addMethodLoading}</>
                            : s.addMethodButton}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setShowAddForm(false); setNewLabel(""); }}
                          className="text-muted-foreground"
                        >
                          {s.cancel}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={modalState === "processing"}
                className="text-espresso-700"
              >
                {s.cancel}
              </Button>
              <Button
                onClick={handlePay}
                disabled={!selectedMethodId || modalState === "processing"}
                className="px-6"
              >
                {modalState === "processing"
                  ? <><Loader2 className="h-4 w-4 animate-spin" />{s.payLoading}</>
                  : <>Pay ${amountDue.toLocaleString()}</>}
              </Button>
            </div>
          </>
        )}
        </div>
      </FocusTrap>
    </div>
  );
};
