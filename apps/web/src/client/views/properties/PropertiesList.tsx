"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useManagerDashboard, usePropertyDetail, useMarkPaid, useSendReminder, useCreateProperty, useCreateLease, useAllTenants, MANAGER_DASHBOARD_KEY, propertyDetailKey } from "@repo/data";
import { useQueryClient } from "@tanstack/react-query";
import type { PropertyDetailData } from "@repo/data";
import { ErrorState } from "@/client/views/ErrorScreen";
import { EmptyState } from "@/client/views/EmptyScreen";
import { Badge, Skeleton, RowMenu, useToast, SectionTitle, MutedText, StateTitle } from "@repo/ui";
import { PropertiesListSkeleton } from "./PropertiesListLoadingScreen";
import type { PropertySummary, UnitDetailItem } from "@repo/data";
import { ChevronRight, ChevronDown, Plus, X } from "lucide-react";
import { strings } from "@repo/tokens";

const sp = strings.manager.addProperty;
const sl = strings.manager.addLease;
const spl = strings.manager.propertiesList;
const sc = strings.common;


// ── Status mix bar ────────────────────────────────────────────────────────────
const StatusMixBar = ({ property }: { property: PropertySummary }) => {
  const total = property.unitCount || 1;
  const vacant = property.unitCount - property.leasedCount;
  const overdueW  = property.status === "overdue"      ? Math.max(20, Math.round((1 / total) * 100)) : 0;
  const outstandW = property.status === "outstanding"  ? Math.max(20, Math.round((1 / total) * 100)) : 0;
  const vacantW   = Math.round((vacant / total) * 100);
  const paidW     = Math.max(0, 100 - overdueW - outstandW - vacantW);
  const statusLabel =
    property.status === "overdue"      ? `${overdueW > 0 ? 1 : 0}/${total} ${spl.groups.overdue.toLowerCase()}`
    : property.status === "outstanding" ? `${outstandW > 0 ? 1 : 0}/${total} ${spl.groups.outstanding.toLowerCase()}`
    : property.leasedCount === 0        ? "No active leases"
    : `${total}/${total} ${spl.groups.paid.toLowerCase()}`;

  return (
    <div className="flex flex-col gap-1.5 items-end">
      <Badge
        variant={
          property.status === "overdue" ? "overdue"
          : property.status === "outstanding" ? "outstanding"
          : property.status === "paid" ? "paid"
          : "vacant"
        }
      >
        {statusLabel}
      </Badge>
      <div className="flex w-[104px] h-1.5 rounded-full overflow-hidden bg-sand-200">
        {overdueW  > 0 && <span className="block h-full bg-destructive"  style={{ width: `${overdueW}%` }} />}
        {outstandW > 0 && <span className="block h-full bg-warning"      style={{ width: `${outstandW}%` }} />}
        {paidW     > 0 && <span className="block h-full bg-teal-600"     style={{ width: `${paidW}%` }} />}
        {vacantW   > 0 && <span className="block h-full bg-espresso-300" style={{ width: `${vacantW}%` }} />}
      </div>
    </div>
  );
};

// ── Add lease modal ───────────────────────────────────────────────────────────
const AddLeaseModal = ({
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
  const { data: tenants, isLoading: tenantsLoading } = useAllTenants();
  const overlayRef = useRef<HTMLDivElement>(null);

  const [tenantId, setTenantId] = useState("");
  const [rent, setRent] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [terms, setTerms] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!tenantId)         e.tenantId = sc.validation.required;
    if (!rent || Number(rent) <= 0) e.rent = sc.validation.invalidAmount;
    if (!startDate)        e.startDate = sc.validation.required;
    if (!endDate)          e.endDate = sc.validation.required;
    if (startDate && endDate && endDate <= startDate) e.endDate = sc.validation.endDateAfterStart;
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    createLease.mutate(
      {
        unitId: unit.id,
        tenantId,
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

  const inputCls = (field: string) =>
    `h-10 w-full rounded-lg border px-3 text-[13.5px] text-espresso-900 bg-white placeholder:text-espresso-300 focus:outline-none focus:ring-2 focus:ring-coral-500/30 transition-colors ${
      errors[field] ? "border-destructive" : "border-sand-400"
    }`;

  // Only show tenants who don't already have an active lease
  const activeTenantIds = new Set(
    (tenants ?? []).filter((t) => t.lease !== null).map((t) => t.tenant.id)
  );
  const availableTenants = (tenants ?? []).filter((t) => !activeTenantIds.has(t.tenant.id) || t.paymentStatus === "vacant");

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onMouseDown={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="relative w-full max-w-[480px] mx-4 bg-white rounded-2xl shadow-2xl border border-sand-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-sand-200 flex-none">
          <div>
            <StateTitle className="text-maroon-600">{sl.title(unit.label)}</StateTitle>
            <MutedText className="mt-0.5">{sl.subtitle}</MutedText>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-espresso-900 hover:bg-sand-100 transition-colors mt-0.5">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form id="add-lease-form" onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 flex-1 space-y-4">
          {/* Tenant */}
          <div className="space-y-1.5">
            <label className="block text-[12.5px] font-semibold text-espresso-700">{sl.fieldTenant}</label>
            {tenantsLoading ? (
              <Skeleton className="h-10 w-full rounded-lg" />
            ) : (
              <select
                value={tenantId}
                onChange={(e) => { setTenantId(e.target.value); setErrors((er) => ({ ...er, tenantId: "" })); }}
                className={`${inputCls("tenantId")} cursor-pointer`}
                disabled={createLease.isPending}
              >
                <option value="">{sl.fieldTenantPlaceholder}</option>
                {availableTenants.map((t) => (
                  <option key={t.tenant.id} value={t.tenant.id}>{t.tenant.name}</option>
                ))}
              </select>
            )}
            {errors.tenantId && <p className="text-[11.5px] text-destructive">{errors.tenantId}</p>}
          </div>

          {/* Monthly rent */}
          <div className="space-y-1.5">
            <label className="block text-[12.5px] font-semibold text-espresso-700">{sl.fieldRent}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13.5px] text-muted-foreground">$</span>
              <input
                type="number" min="1" value={rent}
                onChange={(e) => { setRent(e.target.value); setErrors((er) => ({ ...er, rent: "" })); }}
                placeholder={sl.fieldRentPlaceholder}
                className={`${inputCls("rent")} pl-6`}
                disabled={createLease.isPending}
              />
            </div>
            {errors.rent && <p className="text-[11.5px] text-destructive">{errors.rent}</p>}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[12.5px] font-semibold text-espresso-700">{sl.fieldStartDate}</label>
              <input
                type="date" value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setErrors((er) => ({ ...er, startDate: "" })); }}
                className={inputCls("startDate")}
                disabled={createLease.isPending}
              />
              {errors.startDate && <p className="text-[11.5px] text-destructive">{errors.startDate}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-[12.5px] font-semibold text-espresso-700">{sl.fieldEndDate}</label>
              <input
                type="date" value={endDate} min={startDate}
                onChange={(e) => { setEndDate(e.target.value); setErrors((er) => ({ ...er, endDate: "" })); }}
                className={inputCls("endDate")}
                disabled={createLease.isPending}
              />
              {errors.endDate && <p className="text-[11.5px] text-destructive">{errors.endDate}</p>}
            </div>
          </div>

          {/* Terms */}
          <div className="space-y-1.5">
            <label className="block text-[12.5px] font-semibold text-espresso-700">{sl.fieldTerms}</label>
            <textarea
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder={sl.fieldTermsPlaceholder}
              rows={3}
              className="w-full rounded-lg border border-sand-400 px-3 py-2.5 text-[13.5px] text-espresso-900 bg-white placeholder:text-espresso-300 focus:outline-none focus:ring-2 focus:ring-coral-500/30 transition-colors resize-none"
              disabled={createLease.isPending}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-sand-200 flex-none">
          <button type="button" onClick={onClose} disabled={createLease.isPending}
            className="h-9 px-4 rounded-lg border border-sand-400 text-[13px] font-medium text-espresso-700 hover:bg-sand-100 transition-colors disabled:opacity-50">
            {sl.cancel}
          </button>
          <button type="submit" form="add-lease-form" disabled={createLease.isPending}
            className="h-9 px-5 rounded-lg bg-coral-500 hover:bg-coral-600 text-white text-[13px] font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {createLease.isPending ? sl.submitting : sl.submit}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Unit action menu ──────────────────────────────────────────────────────────
const UnitActionMenu = ({
  unit,
  propertyId,
  onAddLease,
}: {
  unit: UnitDetailItem;
  propertyId: string;
  onAddLease: (unit: UnitDetailItem) => void;
}) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [reminderSentAt, setReminderSentAt] = useState<Date | null>(null);
  const leaseId = unit.lease?.id ?? "";

  const markPaid = useMarkPaid(leaseId);
  const sendReminder = useSendReminder(leaseId);
  const periodMonth = unit.currentPeriodMonth;

  // Vacant units get their own menu item
  if (unit.paymentStatus === "vacant") {
    return (
      <div className="flex justify-end">
        <RowMenu items={[{ label: spl.unitMenu.addLease, onClick: () => onAddLease(unit) }]} />
      </div>
    );
  }

  if (unit.paymentStatus === "paid" || !leaseId || !periodMonth) return null;

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) +
    ", " +
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const items = [
    ...(unit.paymentStatus === "overdue" ? [{
      label: spl.unitMenu.sendReminder,
      sublabel: reminderSentAt ? spl.unitMenu.lastSent(formatTime(reminderSentAt)) : undefined,
      disabled: reminderSentAt !== null || sendReminder.isPending,
      loading: sendReminder.isPending,
      onClick: () => sendReminder.mutate(
        { periodMonth },
        {
          onSuccess: () => {
            setReminderSentAt(new Date());
            showToast(spl.unitMenu.reminderSuccess(unit.tenant?.name ?? "tenant"), "success");
          },
          onError: (err) => showToast((err as Error).message ?? spl.unitMenu.failedReminder, "error"),
        },
      ),
    }] : []),
    ...(unit.paymentStatus === "overdue" || unit.paymentStatus === "outstanding" ? [{
      label: spl.unitMenu.markPaid,
      loading: markPaid.isPending,
      onClick: () => markPaid.mutate(
        { periodMonth },
        {
          onSuccess: () => {
            showToast(spl.unitMenu.paymentSuccess, "success");
            queryClient.setQueryData<PropertyDetailData>(
              propertyDetailKey(propertyId),
              (old) => old ? {
                ...old,
                units: old.units.map((u) =>
                  u.id === unit.id ? { ...u, paymentStatus: "paid", currentPeriodMonth: null } : u
                ),
              } : old,
            );
            queryClient.invalidateQueries({ queryKey: MANAGER_DASHBOARD_KEY });
            queryClient.invalidateQueries({ queryKey: propertyDetailKey(propertyId) });
          },
          onError: (err) => showToast((err as Error).message ?? spl.unitMenu.failedMarkPaid, "error"),
        },
      ),
    }] : []),
  ];

  return (
    <div className="flex justify-end">
      <RowMenu items={items} />
    </div>
  );
};

// ── Unit sub-rows (fetched on expand) ─────────────────────────────────────────
const UnitRows = ({
  propertyId,
  onNav,
  onAddLease,
}: {
  propertyId: string;
  onNav: (unitId: string) => void;
  onAddLease: (unit: UnitDetailItem) => void;
}) => {
  const { data, isLoading } = usePropertyDetail(propertyId);

  if (isLoading) {
    return (
      <>
        {[1, 2, 3].map((i) => (
          <tr key={i} className="border-t border-sand-200 bg-sand-100/50">
            <td />
            <td className="px-4 py-3"><Skeleton className="h-3 w-14" /></td>
            <td className="px-4 py-3"><Skeleton className="h-3 w-28" /></td>
            <td className="px-4 py-3 text-right"><Skeleton className="h-3 w-16 ml-auto" /></td>
            <td className="px-4 py-3 text-right"><Skeleton className="h-5 w-20 ml-auto rounded-full" /></td>
            <td className="px-4 py-3 text-right"><Skeleton className="h-3 w-20 ml-auto" /></td>
          </tr>
        ))}
      </>
    );
  }

  if (!data?.units.length) {
    return (
      <tr className="border-t border-sand-200 bg-sand-100/50">
        <td colSpan={6} className="px-8 py-3 text-[13px] text-muted-foreground italic">
          {spl.noUnitsFound}
        </td>
      </tr>
    );
  }

  return (
    <>
      {data.units.map((unit: UnitDetailItem) => (
        <tr
          key={unit.id}
          onClick={() => onNav(unit.id)}
          className="border-t border-sand-200 bg-sand-100/40 hover:bg-coral-50/60 cursor-pointer transition-colors"
        >
          {/* indent spacer */}
          <td />
          {/* unit label */}
          <td className="px-4 py-2.5">
            <span className="font-mono text-[12px] font-semibold text-espresso-700 bg-white border border-sand-400 px-2 py-0.5 rounded">
              {unit.label}
            </span>
          </td>
          {/* tenant */}
          <td className="px-4 py-2.5">
            {unit.tenant ? (
              <span className="text-[13px] font-medium text-maroon-600">{unit.tenant.name}</span>
            ) : (
              <span className="text-[13px] text-espresso-300 italic">{spl.vacant}</span>
            )}
          </td>
          {/* rent */}
          <td className="px-4 py-2.5 text-right">
            {unit.lease ? (
              <span className="text-[13px] font-semibold tabular-nums">
                ${unit.lease.monthlyRent.toLocaleString()}
                <span className="text-muted-foreground font-normal text-[11px]">/mo</span>
              </span>
            ) : (
              <span className="text-espresso-300 text-[13px]">—</span>
            )}
          </td>
          {/* status — right aligned */}
          <td className="px-4 py-2.5 text-right">
            <div className="flex justify-end">
              <Badge
                variant={
                  unit.paymentStatus === "overdue" ? "overdue"
                  : unit.paymentStatus === "outstanding" ? "outstanding"
                  : unit.paymentStatus === "paid" ? "paid"
                  : "vacant"
                }
                size="sm"
              >
                {unit.paymentStatus === "vacant" ? spl.groups.vacant
                  : unit.paymentStatus === "overdue" ? spl.groups.overdue
                  : unit.paymentStatus === "outstanding" ? spl.groups.outstanding
                  : spl.groups.paid}
              </Badge>
            </div>
          </td>
          {/* action */}
          <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
            <UnitActionMenu unit={unit} propertyId={propertyId} onAddLease={onAddLease} />
          </td>
        </tr>
      ))}
    </>
  );
};

// ── Property row ──────────────────────────────────────────────────────────────
const PropertyRow = ({
  property,
  expanded,
  onToggle,
  onUnitNav,
  onAddLease,
}: {
  property: PropertySummary;
  expanded: boolean;
  onToggle: () => void;
  onUnitNav: (unitId: string) => void;
  onAddLease: (unit: UnitDetailItem) => void;
}) => {
  const isUrgent = property.status === "overdue";

  return (
    <>
      <tr
        className={[
          "border-t border-sand-200 cursor-pointer transition-colors group",
          isUrgent ? "border-l-[3px] border-l-destructive hover:bg-coral-50" : "hover:bg-coral-50/40",
        ].join(" ")}
        onClick={onToggle}
      >
        {/* empty first cell — toggle moved to end */}
        <td />
        {/* property name + address */}
        <td className="px-4 py-4">
          <div className="font-semibold text-espresso-900 text-[14px]">{property.name}</div>
          <div className="text-[12.5px] text-muted-foreground mt-0.5">{property.address}</div>
        </td>
        {/* units occupancy */}
        <td className="px-4 py-4">
          <span className="text-[14px]">
            <span className="font-semibold">{property.leasedCount}/{property.unitCount}</span>
            <span className="text-muted-foreground text-[12.5px] ml-1">{spl.occupied}</span>
          </span>
        </td>
        {/* rent */}
        <td className="px-4 py-4 text-right">
          {property.totalRent > 0 ? (
            <span className="font-semibold tabular-nums text-[14px]">
              ${property.totalRent.toLocaleString()}
              <span className="text-muted-foreground font-normal text-[12px]">/mo</span>
            </span>
          ) : (
            <span className="text-espresso-300">—</span>
          )}
        </td>
        {/* status mix bar — right aligned */}
        <td className="px-4 py-4 text-right">
          <StatusMixBar property={property} />
        </td>
        {/* expand toggle at end */}
        <td className="px-4 py-4 text-right">
          <div className="flex justify-end">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground group-hover:bg-sand-200 transition-colors">
              {expanded
                ? <ChevronDown className="h-3.5 w-3.5" />
                : <ChevronRight className="h-3.5 w-3.5" />}
            </div>
          </div>
        </td>
      </tr>

      {/* expanded unit sub-rows */}
      {expanded && (
        <UnitRows
          propertyId={property.id}
          onNav={(unitId) => onUnitNav(unitId)}
          onAddLease={onAddLease}
        />
      )}
    </>
  );
};

// ── Group header row ──────────────────────────────────────────────────────────
const GROUP_DOT: Record<string, string> = {
  overdue:     "bg-destructive",
  outstanding: "bg-warning",
  paid:        "bg-teal-600",
  vacant:      "bg-espresso-300",
};

const GroupHeaderRow = ({ label, count, urgency }: { label: string; count: number; urgency: string }) => (
  <tr className="bg-sand-100">
    <td colSpan={6} className="px-4 py-2">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${GROUP_DOT[urgency] ?? "bg-espresso-300"}`} />
        <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-espresso-700">
          {label}
        </span>
        <span className="text-[11.5px] text-muted-foreground">· {count}</span>
      </div>
    </td>
  </tr>
);

// ── Add property modal ────────────────────────────────────────────────────────
let unitRowId = 1;

const AddPropertyModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { showToast } = useToast();
  const createProperty = useCreateProperty();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [nameErr, setNameErr] = useState("");
  const [addressErr, setAddressErr] = useState("");
  const [unitRows, setUnitRows] = useState<{ id: number; label: string }[]>([]);

  useEffect(() => {
    if (open) {
      setName(""); setAddress(""); setNameErr(""); setAddressErr("");
      setUnitRows([]);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const addUnit = () => setUnitRows((r) => [...r, { id: unitRowId++, label: "" }]);
  const removeUnit = (id: number) => setUnitRows((r) => r.filter((u) => u.id !== id));
  const setUnitLabel = (id: number, label: string) =>
    setUnitRows((r) => r.map((u) => (u.id === id ? { ...u, label } : u)));

  const inputCls = (err?: string) =>
    `h-10 w-full rounded-lg border px-3 text-[13.5px] text-espresso-900 bg-white placeholder:text-espresso-300 focus:outline-none focus:ring-2 focus:ring-coral-500/30 transition-colors ${
      err ? "border-destructive" : "border-sand-400"
    }`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    if (!name.trim()) { setNameErr("Required"); valid = false; }
    if (!address.trim()) { setAddressErr("Required"); valid = false; }
    if (!valid) return;

    createProperty.mutate(
      {
        name: name.trim(),
        address: address.trim(),
        units: unitRows.map((u) => u.label.trim()).filter(Boolean),
      },
      {
        onSuccess: (property) => {
          showToast(sp.successToast(property.name), "success");
          onClose();
        },
        onError: (err) => showToast((err as Error).message ?? spl.unitMenu.failedAddProperty, "error"),
      },
    );
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onMouseDown={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="relative w-full max-w-[500px] mx-4 bg-white rounded-2xl shadow-2xl border border-sand-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-sand-200 flex-none">
          <div>
            <StateTitle className="text-maroon-600">{sp.title}</StateTitle>
            <MutedText className="mt-0.5">{sp.subtitle}</MutedText>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-espresso-900 hover:bg-sand-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form id="add-property-form" onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 flex-1 space-y-4">
          {/* Property name */}
          <div className="space-y-1.5">
            <label htmlFor="prop-name" className="block text-[12.5px] font-semibold text-espresso-700">{sp.fieldName}</label>
            <input
              id="prop-name" value={name} onChange={(e) => { setName(e.target.value); setNameErr(""); }}
              placeholder={sp.fieldNamePlaceholder} className={inputCls(nameErr)}
              disabled={createProperty.isPending}
            />
            {nameErr && <p className="text-[11.5px] text-destructive">{nameErr}</p>}
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label htmlFor="prop-address" className="block text-[12.5px] font-semibold text-espresso-700">{sp.fieldAddress}</label>
            <input
              id="prop-address" value={address} onChange={(e) => { setAddress(e.target.value); setAddressErr(""); }}
              placeholder={sp.fieldAddressPlaceholder} className={inputCls(addressErr)}
              disabled={createProperty.isPending}
            />
            {addressErr && <p className="text-[11.5px] text-destructive">{addressErr}</p>}
          </div>

          {/* Units */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                {spl.addPropertyModal.unitsLabel} {unitRows.length > 0 && <span className="normal-case font-normal">· {unitRows.length}</span>}
              </p>
              <button
                type="button" onClick={addUnit}
                className="inline-flex items-center gap-1 text-[12.5px] font-medium text-coral-500 hover:text-coral-600 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> {spl.addPropertyModal.addUnit}
              </button>
            </div>

            {unitRows.length === 0 ? (
              <p className="text-[12.5px] text-muted-foreground italic">{spl.addPropertyModal.noUnitsHint}</p>
            ) : (
              <div className="space-y-2">
                {unitRows.map((row, i) => (
                  <div key={row.id} className="flex items-center gap-2">
                    <span className="text-[12px] text-muted-foreground w-5 text-right flex-none">{i + 1}.</span>
                    <input
                      type="text"
                      value={row.label}
                      onChange={(e) => setUnitLabel(row.id, e.target.value)}
                      placeholder={spl.addPropertyModal.unitPlaceholder(i + 1)}
                      className={inputCls()}
                      disabled={createProperty.isPending}
                    />
                    <button
                      type="button" onClick={() => removeUnit(row.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-none"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-sand-200 flex-none">
          <button type="button" onClick={onClose} disabled={createProperty.isPending}
            className="h-9 px-4 rounded-lg border border-sand-400 text-[13px] font-medium text-espresso-700 hover:bg-sand-100 transition-colors disabled:opacity-50">
            {sp.cancel}
          </button>
          <button type="submit" form="add-property-form" disabled={createProperty.isPending}
            className="h-9 px-5 rounded-lg bg-coral-500 hover:bg-coral-600 text-white text-[13px] font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {createProperty.isPending ? sp.submitting : sp.submit}
          </button>
        </div>
      </div>
    </div>
  );
};


// ── Main view ─────────────────────────────────────────────────────────────────
const GROUPS = [
  { key: "overdue",     label: spl.groups.overdue,     urgency: "overdue" },
  { key: "outstanding", label: spl.groups.outstanding, urgency: "outstanding" },
  { key: "paid",        label: spl.groups.paid,        urgency: "paid" },
  { key: "vacant",      label: spl.groups.vacant,      urgency: "vacant" },
] as const;

export const PropertiesList = () => {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useManagerDashboard();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [addOpen, setAddOpen] = useState(false);
  const [leaseTarget, setLeaseTarget] = useState<{ unit: UnitDetailItem; propertyId: string } | null>(null);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  if (isLoading) return <PropertiesListSkeleton />;
  if (isError) return <ErrorState message={(error as Error)?.message ?? "Failed to load properties."} onRetry={() => refetch()} />;
  if (!data) return <EmptyState title="No properties" description="No properties found." icon="building" />;

  const { properties } = data;
  const overdueCount = properties.filter((p) => p.status === "overdue").length;
  const vacantCount  = properties.filter((p) => p.status === "vacant").length;

  const grouped: Record<string, PropertySummary[]> = { overdue: [], outstanding: [], paid: [], vacant: [] };
  for (const p of properties) {
    (grouped[p.status] ?? grouped.paid).push(p);
  }

  return (
    <>
      <AddPropertyModal open={addOpen} onClose={() => setAddOpen(false)} />
      {leaseTarget && (
        <AddLeaseModal
          unit={leaseTarget.unit}
          propertyId={leaseTarget.propertyId}
          onClose={() => setLeaseTarget(null)}
        />
      )}
    <div className="p-8 max-w-[1180px]">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-[36px] font-semibold leading-[1.1] tracking-[-0.01em] text-maroon-600">
            Properties
          </h1>
          <p className="text-muted-foreground mt-1">
            {properties.length} properties
            {overdueCount > 0 && (
              <> · <span className="text-destructive font-medium">{overdueCount} overdue</span></>
            )}
            {vacantCount > 0 && <> · {vacantCount} vacant</>}
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-coral-500 hover:bg-coral-600 text-white text-[13px] font-semibold transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Property
        </button>
      </div>

      {properties.length === 0 ? (
        <EmptyState title="No properties yet" description="Add your first property to get started." icon="building" />
      ) : (
        <div className="rounded-xl border border-sand-400 bg-white overflow-x-auto shadow-sm">
          <table className="w-full table-fixed min-w-[700px]">
            <colgroup>
              <col style={{ width: "32px" }} />
              <col style={{ width: "33%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "29%" }} />
              <col style={{ width: "48px" }} />
            </colgroup>
            <thead>
              <tr className="bg-sand-100 border-b border-sand-400">
                <th />
                <th className="px-4 py-3 text-left text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Property</th>
                <th className="px-4 py-3 text-left text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Units</th>
                <th className="px-4 py-3 text-right text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Rent/mo</th>
                <th className="px-4 py-3 text-right text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {GROUPS.filter((g) => grouped[g.key]?.length > 0).map((g) => (
                <>
                  <GroupHeaderRow key={`group-${g.key}`} label={g.label} count={grouped[g.key].length} urgency={g.urgency} />
                  {grouped[g.key].map((p) => (
                    <PropertyRow
                      key={p.id}
                      property={p}
                      expanded={expanded.has(p.id)}
                      onToggle={() => toggle(p.id)}
                      onUnitNav={(unitId) => router.push(`/manager/properties/${p.id}/units/${unitId}`)}
                      onAddLease={(unit) => setLeaseTarget({ unit, propertyId: p.id })}
                    />
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </>
  );
}
