"use client";

import { useState, useRef, useEffect } from "react";
import { useCreateLease, useCreateTenant, useAllTenants } from "@repo/data";
import type { UnitDetailItem } from "@repo/data";
import { Skeleton, useToast, MutedText, StateTitle, CloseButton, LabeledTextField, FieldLabel, Button, Select } from "@repo/ui";
import type { SelectOption } from "@repo/ui";
import { strings } from "@repo/tokens";

const sl = strings.manager.addLease;
const sc = strings.common;
const spl = strings.manager.propertiesList;

export const AddLeaseModal = ({
  unit,
  propertyId,
  onClose,
}: {
  unit: UnitDetailItem;
  propertyId: string;
  onClose: () => void;
}) => {
  const { showToast } = useToast();
  const createLease = useCreateLease(propertyId);
  const createTenant = useCreateTenant();
  const { data: tenants, isLoading: tenantsLoading } = useAllTenants();
  const overlayRef = useRef<HTMLDivElement>(null);

  const [tenantMode, setTenantMode] = useState<"select" | "new">("select");
  const [tenantId, setTenantId] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newContact, setNewContact] = useState("");
  const [rent, setRent] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [terms, setTerms] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isPending = createLease.isPending || createTenant.isPending;

  const validate = () => {
    const e: Record<string, string> = {};
    if (tenantMode === "select") {
      if (!tenantId) e.tenantId = sc.validation.required;
    } else {
      if (!newName.trim()) e.newName = sc.validation.required;
      if (!newEmail.trim()) e.newEmail = sc.validation.required;
    }
    if (!rent || Number(rent) <= 0) e.rent = sc.validation.invalidAmount;
    if (!startDate) e.startDate = sc.validation.required;
    if (!endDate) e.endDate = sc.validation.required;
    if (startDate && endDate && endDate <= startDate) e.endDate = sc.validation.endDateAfterStart;
    return e;
  };

  const doCreateLease = (resolvedTenantId: string) => {
    createLease.mutate(
      {
        unitId: unit.id,
        tenantId: resolvedTenantId,
        monthlyRent: Number(rent),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        terms,
        leaseDocument: null,
      },
      {
        onSuccess: () => {
          showToast(sl.successToast(unit.label), "success");
          onClose();
        },
        onError: (err) => showToast((err as Error).message ?? spl.unitMenu.failedAddLease, "error"),
      },
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    if (tenantMode === "new") {
      createTenant.mutate(
        { name: newName.trim(), email: newEmail.trim(), contact: newContact.trim() },
        {
          onSuccess: (t) => doCreateLease(t.id),
          onError: (err) =>
            showToast((err as Error).message ?? "Failed to create tenant.", "error"),
        },
      );
    } else {
      doCreateLease(tenantId);
    }
  };

  const tenantsWithLease = new Set(
    (tenants ?? []).filter((t) => t.lease !== null).map((t) => t.tenant.id),
  );

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="relative w-full max-w-[480px] mx-4 bg-white rounded-2xl shadow-2xl border border-sand-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-sand-200 flex-none">
          <div>
            <StateTitle className="text-maroon-600">{sl.title(unit.label)}</StateTitle>
            <MutedText className="mt-0.5">{sl.subtitle}</MutedText>
          </div>
          <CloseButton onClick={onClose} className="mt-0.5" />
        </div>

        {/* Body */}
        <form
          id="add-lease-form"
          onSubmit={handleSubmit}
          className="overflow-y-auto px-6 py-5 flex-1 space-y-4"
        >
          {/* Tenant section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <FieldLabel>{sl.fieldTenant}</FieldLabel>
              <button
                type="button"
                onClick={() => {
                  setTenantMode((m) => (m === "select" ? "new" : "select"));
                  setErrors((er) => ({ ...er, tenantId: "", newName: "", newEmail: "" }));
                }}
                className="text-[12px] font-medium text-coral-500 hover:text-coral-600 transition-colors"
              >
                {tenantMode === "select" ? sl.createNewTenant : sl.selectExistingTenant}
              </button>
            </div>

            {tenantMode === "select" ? (
              <>
                {tenantsLoading ? (
                  <Skeleton className="h-10 w-full rounded-lg" />
                ) : (
                  <Select
                    value={tenantId}
                    onChange={(val) => {
                      setTenantId(val);
                      setErrors((er) => ({ ...er, tenantId: "" }));
                    }}
                    options={(tenants ?? []).map<SelectOption>((t) => ({
                      value: t.tenant.id,
                      label: tenantsWithLease.has(t.tenant.id)
                        ? `${t.tenant.name} ${sl.fieldTenantHasLease}`
                        : t.tenant.name,
                      disabled: tenantsWithLease.has(t.tenant.id),
                    }))}
                    placeholder={sl.fieldTenantPlaceholder}
                    className={`h-10 ${errors.tenantId ? "border-destructive" : ""}`}
                    disabled={isPending}
                  />
                )}
                {errors.tenantId && (
                  <p className="text-[11.5px] text-destructive">{errors.tenantId}</p>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-sand-300 bg-sand-50 p-4 space-y-3">
                <p className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  {sl.newTenant.heading}
                </p>
                <LabeledTextField
                  label={sl.newTenant.fieldName}
                  value={newName}
                  onChange={(v) => { setNewName(v); setErrors((er) => ({ ...er, newName: "" })); }}
                  placeholder={sl.newTenant.fieldNamePlaceholder}
                  error={errors.newName}
                  disabled={isPending}
                />
                <LabeledTextField
                  label={sl.newTenant.fieldEmail}
                  type="email"
                  value={newEmail}
                  onChange={(v) => { setNewEmail(v); setErrors((er) => ({ ...er, newEmail: "" })); }}
                  placeholder={sl.newTenant.fieldEmailPlaceholder}
                  error={errors.newEmail}
                  disabled={isPending}
                />
                <LabeledTextField
                  label={sl.newTenant.fieldContact}
                  value={newContact}
                  onChange={(v) => setNewContact(v)}
                  placeholder={sl.newTenant.fieldContactPlaceholder}
                  disabled={isPending}
                />
              </div>
            )}
          </div>

          {/* Monthly rent */}
          <LabeledTextField
            label={sl.fieldRent}
            type="number"
            min="1"
            value={rent}
            onChange={(v) => { setRent(v); setErrors((er) => ({ ...er, rent: "" })); }}
            placeholder={sl.fieldRentPlaceholder}
            error={errors.rent}
            prefix="$"
            disabled={isPending}
          />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <LabeledTextField
              label={sl.fieldStartDate}
              type="date"
              value={startDate}
              onChange={(v) => { setStartDate(v); setErrors((er) => ({ ...er, startDate: "" })); }}
              error={errors.startDate}
              disabled={isPending}
            />
            <LabeledTextField
              label={sl.fieldEndDate}
              type="date"
              value={endDate}
              min={startDate}
              onChange={(v) => { setEndDate(v); setErrors((er) => ({ ...er, endDate: "" })); }}
              error={errors.endDate}
              disabled={isPending}
            />
          </div>

          {/* Terms */}
          <div className="space-y-1.5">
            <FieldLabel>{sl.fieldTerms}</FieldLabel>
            <textarea
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder={sl.fieldTermsPlaceholder}
              rows={3}
              className="w-full rounded-lg border border-sand-400 px-3 py-2.5 text-[13.5px] text-espresso-900 bg-white placeholder:text-espresso-300 focus:outline-none focus:ring-2 focus:ring-coral-500/30 transition-colors resize-none"
              disabled={isPending}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-sand-200 flex-none">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isPending}>
            {sl.cancel}
          </Button>
          <Button size="sm" type="submit" form="add-lease-form" disabled={isPending}>
            {isPending ? sl.submitting : sl.submit}
          </Button>
        </div>
      </div>
    </div>
  );
};
