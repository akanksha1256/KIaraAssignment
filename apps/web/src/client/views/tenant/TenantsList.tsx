"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAllTenants, useCreateTenant } from "@repo/data";
import { ErrorState } from "@/client/views/ErrorScreen";
import { EmptyState } from "@/client/views/EmptyScreen";
import { Badge, SectionTitle, MutedText, useToast, Select } from "@repo/ui";
import { TenantsListSkeleton } from "./TenantsListLoadingScreen";
import { strings } from "@repo/tokens";
import type { TenantListItem } from "@repo/data";
import {
  ShieldCheck,
  Clock,
  ShieldOff,
  ChevronRight,
  Plus,
  X,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

const s = strings.manager.tenantsList;
const sa = strings.manager.tenantsList.addTenant;
const sc = strings.common;

const KYC_ICON: Record<string, React.ReactNode> = {
  verified: <ShieldCheck className="h-3.5 w-3.5" />,
  pending: <Clock className="h-3.5 w-3.5" />,
  not_submitted: <ShieldOff className="h-3.5 w-3.5" />,
};

const KYC_CLASS: Record<string, string> = {
  verified: "text-teal-700 bg-teal-50 border border-teal-200",
  pending: "text-warning bg-amber-50 border border-amber-200",
  not_submitted: "text-muted-foreground bg-sand-100 border border-sand-300",
};

const KYC_LABEL: Record<string, string> = {
  verified: "Verified",
  pending: "Pending",
  not_submitted: "Not submitted",
};

// ── Add tenant modal ─────────────────────────────────────────────────────────
const AddTenantModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { showToast } = useToast();
  const createTenant = useCreateTenant();
  const overlayRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setName("");
      setEmail("");
      setContact("");
      setErrors({});
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const inputCls = (field: string) =>
    `h-10 w-full rounded-lg border px-3 text-[13.5px] text-espresso-900 bg-white placeholder:text-espresso-300 focus:outline-none focus:ring-2 focus:ring-coral-500/30 transition-colors ${
      errors[field] ? "border-destructive" : "border-sand-400"
    }`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = sc.validation.required;
    if (!email.trim()) errs.email = sc.validation.required;
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    createTenant.mutate(
      { name: name.trim(), email: email.trim(), contact: contact.trim() },
      {
        onSuccess: () => {
          showToast(sa.successToast(name.trim()), "success");
          onClose();
        },
        onError: (err) => showToast((err as Error).message ?? sa.failedToast, "error"),
      },
    );
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="relative w-full max-w-[440px] mx-4 bg-white rounded-2xl shadow-2xl border border-sand-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-sand-200 flex-none">
          <div>
            <p className="font-serif text-[20px] font-semibold text-maroon-600">{sa.title}</p>
            <MutedText className="mt-0.5">{sa.subtitle}</MutedText>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-espresso-900 hover:bg-sand-100 transition-colors mt-0.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form
          id="add-tenant-form"
          onSubmit={handleSubmit}
          className="overflow-y-auto px-6 py-5 flex-1 space-y-4"
        >
          <div className="space-y-1.5">
            <label className="block text-[12.5px] font-semibold text-espresso-700">
              {sa.fieldName}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((er) => ({ ...er, name: "" }));
              }}
              placeholder={sa.fieldNamePlaceholder}
              className={inputCls("name")}
              disabled={createTenant.isPending}
            />
            {errors.name && <p className="text-[11.5px] text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-[12.5px] font-semibold text-espresso-700">
              {sa.fieldEmail}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((er) => ({ ...er, email: "" }));
              }}
              placeholder={sa.fieldEmailPlaceholder}
              className={inputCls("email")}
              disabled={createTenant.isPending}
            />
            {errors.email && <p className="text-[11.5px] text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-[12.5px] font-semibold text-espresso-700">
              {sa.fieldContact}
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder={sa.fieldContactPlaceholder}
              className={inputCls("contact")}
              disabled={createTenant.isPending}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-sand-200 flex-none">
          <button
            type="button"
            onClick={onClose}
            disabled={createTenant.isPending}
            className="h-9 px-4 rounded-lg border border-sand-400 text-[13px] font-medium text-espresso-700 hover:bg-sand-100 transition-colors disabled:opacity-50"
          >
            {sa.cancel}
          </button>
          <button
            type="submit"
            form="add-tenant-form"
            disabled={createTenant.isPending}
            className="h-9 px-5 rounded-lg bg-coral-500 hover:bg-coral-600 text-white text-[13px] font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {createTenant.isPending ? sa.submitting : sa.submit}
          </button>
        </div>
      </div>
    </div>
  );
};

type SortCol = "name" | "rent" | "payment" | "kyc";
type SortDir = "asc" | "desc";

type FilterColKey = "payment" | "kyc";

interface FilterRow {
  id: number;
  col: FilterColKey;
  value: string;
}

const FILTER_COL_LABELS: Record<FilterColKey, string> = {
  payment: s.filterCols.payment,
  kyc: s.filterCols.kyc,
};

const PAYMENT_OPTIONS = [
  { value: "overdue", label: "Overdue" },
  { value: "outstanding", label: "Outstanding" },
  { value: "paid", label: "Paid" },
  { value: "vacant", label: "No lease" },
];

const KYC_OPTIONS = [
  { value: "verified", label: "Verified" },
  { value: "pending", label: "Pending" },
  { value: "not_submitted", label: "Not submitted" },
];

let nextFilterId = 1;

const FilterPopup = ({
  appliedRows,
  onApply,
  onClear,
}: {
  appliedRows: FilterRow[];
  onApply: (rows: FilterRow[]) => void;
  onClear: () => void;
}) => {
  const [draftRows, setDraftRows] = useState<FilterRow[]>(
    appliedRows.length > 0 ? appliedRows : [{ id: nextFilterId++, col: "payment", value: "" }],
  );

  function optionsFor(col: FilterColKey) {
    return col === "payment" ? PAYMENT_OPTIONS : KYC_OPTIONS;
  }

  const addRow = () =>
    setDraftRows((prev) => [...prev, { id: nextFilterId++, col: "payment", value: "" }]);
  const removeRow = (id: number) => setDraftRows((prev) => prev.filter((r) => r.id !== id));
  const updateRow = (id: number, patch: Partial<FilterRow>) =>
    setDraftRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch, ...(patch.col ? { value: "" } : {}) } : r)),
    );

  const hasAny = draftRows.length > 0 || appliedRows.length > 0;

  return (
    <div className="absolute left-0 top-full mt-1.5 z-50 w-[380px] bg-white rounded-xl border border-sand-400 shadow-xl flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-sand-200">
        <span className="text-[13.5px] font-semibold text-espresso-900">{s.filtersTitle}</span>
      </div>

      <div className="px-4 py-4 space-y-3 max-h-[360px] overflow-y-auto">
        {draftRows.map((row) => (
          <div key={row.id} className="flex gap-2 items-center">
            <div className="flex-1">
              <Select
                value={row.col}
                onChange={(val) => updateRow(row.id, { col: val as FilterColKey })}
                options={(Object.keys(FILTER_COL_LABELS) as FilterColKey[]).map((k) => ({
                  value: k,
                  label: FILTER_COL_LABELS[k],
                }))}
              />
            </div>
            <div className="flex-1">
              <Select
                value={row.value}
                onChange={(val) => updateRow(row.id, { value: val })}
                options={optionsFor(row.col)}
                placeholder={`Select ${FILTER_COL_LABELS[row.col].toLowerCase()}…`}
              />
            </div>
            <button
              onClick={() => removeRow(row.id)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-none"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        <button
          onClick={addRow}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-coral-500 hover:text-coral-600 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> {s.addFilter}
        </button>
      </div>

      <div className="flex gap-2 px-4 py-3 border-t border-sand-200">
        {hasAny && (
          <button
            onClick={() => { setDraftRows([]); onClear(); }}
            className="flex-1 h-9 rounded-lg border border-sand-400 text-[13px] font-medium text-espresso-700 hover:bg-sand-100 transition-colors"
          >
            {s.clearAllFilters}
          </button>
        )}
        <button
          onClick={() => onApply(draftRows.filter((r) => r.value))}
          className="flex-1 h-9 rounded-lg bg-coral-500 hover:bg-coral-600 text-white text-[13px] font-semibold transition-colors"
        >
          {s.applyFilter}
        </button>
      </div>
    </div>
  );
};

const PAYMENT_RANK: Record<string, number> = { overdue: 0, outstanding: 1, paid: 2, vacant: 3 };
const KYC_RANK: Record<string, number> = { not_submitted: 0, pending: 1, verified: 2 };

const SortIcon = ({ active, dir }: { active: boolean; dir: SortDir }) => {
  if (!active) return <ChevronsUpDown className="h-3 w-3 opacity-40" />;
  return dir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
};

// ── Tenant row ────────────────────────────────────────────────────────────────
const TenantRow = ({ item }: { item: TenantListItem }) => {
  const router = useRouter();
  const { tenant, lease, unit, property, paymentStatus } = item;
  const kycClass = KYC_CLASS[tenant.kycStatus] ?? KYC_CLASS.not_submitted;

  return (
    <tr
      onClick={() => router.push(`/manager/tenants/${tenant.id}`)}
      className="border-t border-sand-200 hover:bg-coral-50/50 cursor-pointer transition-colors group"
    >
      {/* Avatar + name */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-maroon-600 text-white grid place-items-center text-[12px] font-semibold flex-none select-none">
            {tenant.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <div className="text-[13.5px] font-semibold text-espresso-900 leading-tight">
              {tenant.name}
            </div>
            <div className="text-[12px] text-muted-foreground">{tenant.email}</div>
          </div>
        </div>
      </td>

      {/* Property / unit */}
      <td className="px-5 py-3.5">
        {property && unit ? (
          <div>
            <div className="text-[13px] font-medium text-espresso-900">{property.name}</div>
            <div className="text-[12px] text-muted-foreground font-mono">{unit.label}</div>
          </div>
        ) : (
          <MutedText className="italic">{s.noActiveLease}</MutedText>
        )}
      </td>

      {/* Rent */}
      <td className="px-5 py-3.5 text-right">
        {lease ? (
          <span className="text-[13px] font-semibold tabular-nums">
            ${lease.monthlyRent.toLocaleString()}
            <span className="text-muted-foreground font-normal text-[11px]">/mo</span>
          </span>
        ) : (
          <span className="text-espresso-300 text-[13px]">—</span>
        )}
      </td>

      {/* Payment status */}
      <td className="px-5 py-3.5 text-right">
        <div className="flex justify-end">
          <Badge
            variant={
              paymentStatus === "overdue"
                ? "overdue"
                : paymentStatus === "outstanding"
                  ? "outstanding"
                  : paymentStatus === "paid"
                    ? "paid"
                    : "vacant"
            }
            size="sm"
          >
            {paymentStatus === "vacant"
              ? "No lease"
              : paymentStatus === "overdue"
                ? "Overdue"
                : paymentStatus === "outstanding"
                  ? "Outstanding"
                  : "Paid"}
          </Badge>
        </div>
      </td>

      {/* KYC */}
      <td className="px-5 py-3.5 text-right">
        <div className="flex justify-end">
          <span
            className={`inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full ${kycClass}`}
          >
            {KYC_ICON[tenant.kycStatus]}
            {KYC_LABEL[tenant.kycStatus]}
          </span>
        </div>
      </td>

      {/* Chevron */}
      <td className="px-4 py-3.5 text-right w-10">
        <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:text-maroon-600 transition-colors" />
      </td>
    </tr>
  );
};

export const TenantsList = () => {
  const { data, isLoading, isError, error, refetch } = useAllTenants();
  const [addOpen, setAddOpen] = useState(false);
  const [sortCol, setSortCol] = useState<SortCol | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filterOpen, setFilterOpen] = useState(false);
  const [appliedFilterRows, setAppliedFilterRows] = useState<FilterRow[]>([]);
  const [search, setSearch] = useState("");
  const filterContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterOpen) return;
    const handler = (e: MouseEvent) => {
      if (filterContainerRef.current && !filterContainerRef.current.contains(e.target as Node))
        setFilterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [filterOpen]);

  const toggleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    if (!data) return [];
    let base = [...data];

    for (const row of appliedFilterRows) {
      if (!row.value) continue;
      if (row.col === "payment") base = base.filter((t) => t.paymentStatus === row.value);
      if (row.col === "kyc") base = base.filter((t) => t.tenant.kycStatus === row.value);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      base = base.filter(
        (t) =>
          t.tenant.name.toLowerCase().includes(q) ||
          t.tenant.email.toLowerCase().includes(q) ||
          (t.property?.name ?? "").toLowerCase().includes(q),
      );
    }

    if (!sortCol) return base;
    return [...base].sort((a, b) => {
      let cmp = 0;
      if (sortCol === "name") cmp = a.tenant.name.localeCompare(b.tenant.name);
      if (sortCol === "rent") cmp = (a.lease?.monthlyRent ?? 0) - (b.lease?.monthlyRent ?? 0);
      if (sortCol === "payment")
        cmp = (PAYMENT_RANK[a.paymentStatus] ?? 0) - (PAYMENT_RANK[b.paymentStatus] ?? 0);
      if (sortCol === "kyc")
        cmp = (KYC_RANK[a.tenant.kycStatus] ?? 0) - (KYC_RANK[b.tenant.kycStatus] ?? 0);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, appliedFilterRows, search, sortCol, sortDir]);

  if (isLoading) return <TenantsListSkeleton />;
  if (isError)
    return <ErrorState message={(error as Error)?.message ?? s.error} onRetry={() => refetch()} />;
  if (!data)
    return <EmptyState title={s.emptyTitle} description={s.emptyDescription} icon="inbox" />;

  const overdueCount = data.filter((t) => t.paymentStatus === "overdue").length;
  const pendingKyc = data.filter((t) => t.tenant.kycStatus !== "verified").length;
  const activeFilterCount = appliedFilterRows.filter((r) => r.value !== "").length;
  const hasActiveFilters = activeFilterCount > 0 || search.trim() !== "";

  return (
    <>
      <AddTenantModal open={addOpen} onClose={() => setAddOpen(false)} />
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Static top section */}
        <div className="px-8 pt-8 pb-4 flex-none">
          <div className="flex items-start justify-between mb-6">
            <div>
              <SectionTitle>{s.title}</SectionTitle>
              <MutedText className="mt-1">
                {data.length} tenant{data.length !== 1 ? "s" : ""}
                {overdueCount > 0 && (
                  <>
                    {" "}
                    · <span className="text-destructive font-medium">{overdueCount} overdue</span>
                  </>
                )}
                {pendingKyc > 0 && <> · {pendingKyc} KYC pending</>}
              </MutedText>
            </div>
            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-coral-500 hover:bg-coral-600 text-white text-[13px] font-semibold transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              {s.addTenantButton}
            </button>
          </div>

          {/* Toolbar: filter (left) + search (right) */}
          <div className="flex items-center gap-3 mb-2">
            <div className="relative flex-none" ref={filterContainerRef}>
              <button
                onClick={() => setFilterOpen((o) => !o)}
                className={`inline-flex items-center gap-2 h-9 px-4 rounded-lg border text-[13px] font-medium transition-colors ${
                  activeFilterCount > 0
                    ? "border-coral-500 text-coral-500 bg-coral-50 hover:bg-coral-100"
                    : "border-sand-400 text-espresso-700 bg-white hover:bg-sand-100"
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {s.filterButton}
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-coral-500 text-white text-[10px] font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {filterOpen && (
                <FilterPopup
                  appliedRows={appliedFilterRows}
                  onApply={(rows) => {
                    setAppliedFilterRows(rows);
                    setFilterOpen(false);
                  }}
                  onClear={() => {
                    setAppliedFilterRows([]);
                    setFilterOpen(false);
                  }}
                />
              )}
            </div>

            <div className="flex-1" />

            <div className="relative flex-none w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={s.searchPlaceholder}
                className="h-9 w-full rounded-lg border border-sand-400 bg-white pl-8 pr-8 text-[13px] text-espresso-900 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-coral-500/30"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-espresso-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Applied filter chips row */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {appliedFilterRows
                .filter((r) => r.value)
                .map((row) => {
                  const opts = row.col === "payment" ? PAYMENT_OPTIONS : KYC_OPTIONS;
                  const label = opts.find((o) => o.value === row.value)?.label ?? row.value;
                  return (
                    <span
                      key={row.id}
                      className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-coral-50 border border-coral-200 text-[12px] font-medium text-coral-700"
                    >
                      <span className="text-coral-400">{FILTER_COL_LABELS[row.col]}:</span> {label}
                      <button
                        onClick={() =>
                          setAppliedFilterRows((rs) => rs.filter((r) => r.id !== row.id))
                        }
                        className="hover:text-coral-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              <span className="text-[12px] text-muted-foreground">
                {s.results(filtered.length, data.length)}
              </span>
            </div>
          )}
        </div>

        {/* Scrollable table */}
        <div className="flex-1 min-h-0 flex flex-col px-8 pb-8">
          {filtered.length === 0 ? (
            <EmptyState title={s.noMatch} description={s.noMatchDescription} icon="inbox" />
          ) : (
            <div className="flex-1 min-h-0 rounded-xl border border-sand-400 bg-white overflow-y-auto shadow-sm">
              <table className="w-full table-fixed min-w-[700px]">
                <colgroup>
                  <col style={{ width: "28%" }} />
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "17%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "40px" }} />
                </colgroup>
                <thead className="sticky top-0 z-10">
                  <tr className="bg-sand-100 border-b border-sand-400">
                    <th
                      onClick={() => toggleSort("name")}
                      className={`px-5 py-3 text-left text-[11.5px] font-semibold uppercase tracking-[0.06em] cursor-pointer select-none transition-colors ${sortCol === "name" ? "text-espresso-900" : "text-muted-foreground hover:text-espresso-700"}`}
                    >
                      <span className="inline-flex items-center gap-1">
                        Tenant <SortIcon active={sortCol === "name"} dir={sortDir} />
                      </span>
                    </th>
                    <th className="px-5 py-3 text-left text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                      Property / Unit
                    </th>
                    <th
                      onClick={() => toggleSort("rent")}
                      className={`px-5 py-3 text-right text-[11.5px] font-semibold uppercase tracking-[0.06em] cursor-pointer select-none transition-colors ${sortCol === "rent" ? "text-espresso-900" : "text-muted-foreground hover:text-espresso-700"}`}
                    >
                      <span className="inline-flex items-center gap-1 justify-end w-full">
                        Rent/mo <SortIcon active={sortCol === "rent"} dir={sortDir} />
                      </span>
                    </th>
                    <th
                      onClick={() => toggleSort("payment")}
                      className={`px-5 py-3 text-right text-[11.5px] font-semibold uppercase tracking-[0.06em] cursor-pointer select-none transition-colors ${sortCol === "payment" ? "text-espresso-900" : "text-muted-foreground hover:text-espresso-700"}`}
                    >
                      <span className="inline-flex items-center gap-1 justify-end w-full">
                        Payment <SortIcon active={sortCol === "payment"} dir={sortDir} />
                      </span>
                    </th>
                    <th
                      onClick={() => toggleSort("kyc")}
                      className={`px-5 py-3 text-right text-[11.5px] font-semibold uppercase tracking-[0.06em] cursor-pointer select-none transition-colors ${sortCol === "kyc" ? "text-espresso-900" : "text-muted-foreground hover:text-espresso-700"}`}
                    >
                      <span className="inline-flex items-center gap-1 justify-end w-full">
                        KYC <SortIcon active={sortCol === "kyc"} dir={sortDir} />
                      </span>
                    </th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <TenantRow key={item.tenant.id} item={item} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
