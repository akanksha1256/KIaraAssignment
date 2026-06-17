"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  X,
  SlidersHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import {
  useAllPayments,
  useMarkPaid,
  useSendReminder,
  MANAGER_DASHBOARD_KEY,
  allPaymentsKey,
} from "@repo/data";
import { useQueryClient } from "@tanstack/react-query";
import { ErrorState } from "@/client/views/ErrorScreen";
import { EmptyState } from "@/client/views/EmptyScreen";
import { Badge, RowMenu, useToast, SectionTitle, MutedText } from "@repo/ui";
import { PaymentsListSkeleton } from "./PaymentsListLoadingScreen";
import { strings } from "@repo/tokens";
import type { PaymentListItem } from "@repo/data";

const s = strings.manager.paymentsList;
const sp = strings.statusPill;

type SortCol = "period" | "paidOn" | "status" | "amount";
type SortDir = "asc" | "desc";

type FilterColKey = "status" | "property" | "period" | "amount";

interface FilterRow {
  id: number;
  col: FilterColKey;
  value: string;
}

const FILTER_COL_LABELS: Record<FilterColKey, string> = {
  status: s.filterCols.status,
  property: s.filterCols.property,
  period: s.filterCols.period,
  amount: s.filterCols.amount,
};

const STATUS_OPTIONS = [
  { value: "overdue", label: sp.overdue },
  { value: "outstanding", label: sp.outstanding },
  { value: "paid", label: sp.paid },
];

const AMOUNT_OPTIONS = s.amountOptions as unknown as { value: string; label: string }[];

function amountFn(value: string): (n: number) => boolean {
  if (value === "lt1k") return (n) => n < 1000;
  if (value === "1k2k") return (n) => n >= 1000 && n <= 2000;
  if (value === "2k3k") return (n) => n > 2000 && n <= 3000;
  if (value === "gt3k") return (n) => n > 3000;
  return () => true;
}

function formatPeriod(m: string) {
  const [y, mo] = m.split("-");
  return new Date(Number(y), Number(mo) - 1).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Row action menu ───────────────────────────────────────────────────────────
const PaymentRowMenu = ({ item }: { item: PaymentListItem }) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [reminderSentAt, setReminderSentAt] = useState<Date | null>(null);

  const markPaid = useMarkPaid(item.lease.id);
  const sendReminder = useSendReminder(item.lease.id);

  if (item.payment.status === "paid") return null;

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) +
    ", " +
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: allPaymentsKey() });
    queryClient.invalidateQueries({ queryKey: MANAGER_DASHBOARD_KEY });
  };

  const items = [
    ...(item.payment.status === "overdue"
      ? [
          {
            label: s.rowMenu.sendReminder,
            sublabel: reminderSentAt ? s.rowMenu.lastSent(formatTime(reminderSentAt)) : undefined,
            disabled: reminderSentAt !== null || sendReminder.isPending,
            loading: sendReminder.isPending,
            onClick: () =>
              sendReminder.mutate(
                { periodMonth: item.payment.periodMonth },
                {
                  onSuccess: () => {
                    setReminderSentAt(new Date());
                    showToast(s.rowMenu.reminderSuccess(item.tenant.name), "success");
                  },
                  onError: (err) =>
                    showToast((err as Error).message ?? s.rowMenu.failedReminder, "error"),
                },
              ),
          },
        ]
      : []),
    {
      label: s.rowMenu.markPaid,
      loading: markPaid.isPending,
      onClick: () =>
        markPaid.mutate(
          { periodMonth: item.payment.periodMonth },
          {
            onSuccess: () => {
              showToast(s.rowMenu.paymentSuccess, "success");
              invalidate();
            },
            onError: (err) =>
              showToast((err as Error).message ?? s.rowMenu.failedMarkPaid, "error"),
          },
        ),
    },
  ];

  return <RowMenu items={items} />;
};

// ── Filter panel ──────────────────────────────────────────────────────────────
let nextId = 1;

const FilterPanel = ({
  open,
  onClose,
  filterRows,
  onChangeRows,
  search,
  onSearchChange,
  data,
}: {
  open: boolean;
  onClose: () => void;
  filterRows: FilterRow[];
  onChangeRows: (rows: FilterRow[]) => void;
  search: string;
  onSearchChange: (v: string) => void;
  data: PaymentListItem[];
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  const uniqueProperties = [...new Map(data.map((p) => [p.property.id, p.property])).values()];
  const uniquePeriods = [...new Set(data.map((p) => p.payment.periodMonth))].sort((a, b) =>
    b.localeCompare(a),
  );

  function optionsFor(col: FilterColKey): { value: string; label: string }[] {
    if (col === "status") return STATUS_OPTIONS;
    if (col === "property") return uniqueProperties.map((p) => ({ value: p.id, label: p.name }));
    if (col === "period") return uniquePeriods.map((m) => ({ value: m, label: formatPeriod(m) }));
    if (col === "amount") return AMOUNT_OPTIONS;
    return [];
  }

  const addRow = () => {
    onChangeRows([...filterRows, { id: nextId++, col: "status", value: "" }]);
  };

  const removeRow = (id: number) => {
    onChangeRows(filterRows.filter((r) => r.id !== id));
  };

  const updateRow = (id: number, patch: Partial<FilterRow>) => {
    onChangeRows(
      filterRows.map((r) =>
        r.id === id ? { ...r, ...patch, ...(patch.col ? { value: "" } : {}) } : r,
      ),
    );
  };

  const clearAll = () => {
    onChangeRows([]);
    onSearchChange("");
  };

  const anyActive = filterRows.length > 0 || search !== "";

  const inputCls =
    "h-9 rounded-lg border border-sand-400 bg-white px-3 text-[13px] text-espresso-900 focus:outline-none focus:ring-2 focus:ring-coral-500/30 w-full";
  const selectCls =
    "h-9 rounded-lg border border-sand-400 bg-white px-3 text-[13px] text-espresso-900 focus:outline-none focus:ring-2 focus:ring-coral-500/30 w-full";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ pointerEvents: "none" }}>
      <div
        ref={panelRef}
        style={{ pointerEvents: "auto" }}
        className="relative w-[360px] h-full bg-white border-l border-sand-400 shadow-xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-sand-200">
          <span className="text-[15px] font-semibold text-espresso-900">{s.filtersTitle}</span>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-espresso-900 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Search */}
          <div className="space-y-1.5">
            <label className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              {s.searchLabel}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={s.searchPlaceholder}
                className="h-9 w-full rounded-lg border border-sand-400 bg-white pl-8 pr-8 text-[13px] text-espresso-900 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-coral-500/30"
              />
              {search && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-espresso-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter rows */}
          {filterRows.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                {s.columnsLabel}
              </label>
              <div className="space-y-3">
                {filterRows.map((row) => (
                  <div key={row.id} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2">
                      {/* Column selector */}
                      <select
                        value={row.col}
                        onChange={(e) => updateRow(row.id, { col: e.target.value as FilterColKey })}
                        className={selectCls}
                      >
                        {(Object.keys(FILTER_COL_LABELS) as FilterColKey[]).map((k) => (
                          <option key={k} value={k}>
                            {FILTER_COL_LABELS[k]}
                          </option>
                        ))}
                      </select>
                      {/* Value dropdown */}
                      <select
                        value={row.value}
                        onChange={(e) => updateRow(row.id, { value: e.target.value })}
                        className={`${selectCls} ${!row.value ? "text-muted-foreground" : ""}`}
                      >
                        <option value="">Select {FILTER_COL_LABELS[row.col].toLowerCase()}…</option>
                        {optionsFor(row.col).map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => removeRow(row.id)}
                      className="mt-1.5 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-none"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add filter row */}
          <button
            onClick={addRow}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-coral-500 hover:text-coral-600 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> {s.addFilter}
          </button>
        </div>

        {/* Footer */}
        {anyActive && (
          <div className="px-5 py-4 border-t border-sand-200">
            <button
              onClick={clearAll}
              className="w-full h-9 rounded-lg border border-sand-400 text-[13px] font-medium text-espresso-700 hover:bg-sand-100 transition-colors"
            >
              {s.clearAllFilters}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Sort icon ─────────────────────────────────────────────────────────────────
const SortIcon = ({ active, dir }: { active: boolean; dir: SortDir }) => {
  if (!active) return <ChevronsUpDown className="h-3 w-3 opacity-40" />;
  return dir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
};

// ── Main view ─────────────────────────────────────────────────────────────────
export const PaymentsList = () => {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useAllPayments();

  const [filterOpen, setFilterOpen] = useState(false);
  const [filterRows, setFilterRows] = useState<FilterRow[]>([]);
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<SortCol | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const toggleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("desc");
    }
  };

  const statusRank: Record<string, number> = { overdue: 0, outstanding: 1, paid: 2 };

  const filtered = useMemo(() => {
    if (!data) return [];
    let base = [...data];

    for (const row of filterRows) {
      if (!row.value) continue;
      if (row.col === "status") base = base.filter((p) => p.payment.status === row.value);
      if (row.col === "property") base = base.filter((p) => p.property.id === row.value);
      if (row.col === "period") base = base.filter((p) => p.payment.periodMonth === row.value);
      if (row.col === "amount") base = base.filter((p) => amountFn(row.value)(p.payment.amountDue));
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      base = base.filter(
        (p) =>
          p.tenant.name.toLowerCase().includes(q) ||
          p.property.name.toLowerCase().includes(q) ||
          p.unit.label.toLowerCase().includes(q),
      );
    }

    if (!sortCol) return base;
    return [...base].sort((a, b) => {
      let cmp = 0;
      if (sortCol === "period") cmp = a.payment.periodMonth.localeCompare(b.payment.periodMonth);
      if (sortCol === "paidOn")
        cmp = (a.payment.paidDate ?? "").localeCompare(b.payment.paidDate ?? "");
      if (sortCol === "status")
        cmp = (statusRank[a.payment.status] ?? 0) - (statusRank[b.payment.status] ?? 0);
      if (sortCol === "amount") cmp = a.payment.amountDue - b.payment.amountDue;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, filterRows, search, sortCol, sortDir]);

  if (isLoading) return <PaymentsListSkeleton />;
  if (isError)
    return <ErrorState message={(error as Error)?.message ?? s.error} onRetry={() => refetch()} />;
  if (!data) return <EmptyState title={s.emptyTitle} description={s.emptyDescription} />;

  const totalCollected = data
    .filter((p) => p.payment.status === "paid")
    .reduce((sum, p) => sum + p.payment.amountPaid, 0);
  const totalOutstanding = data
    .filter((p) => p.payment.status !== "paid")
    .reduce((sum, p) => sum + p.payment.amountDue, 0);
  const overdueCount = data.filter((p) => p.payment.status === "overdue").length;
  const paidCount = data.filter((p) => p.payment.status === "paid").length;
  const unpaidCount = data.filter((p) => p.payment.status !== "paid").length;

  const activeFilterCount = filterRows.filter((r) => r.value !== "").length + (search ? 1 : 0);

  return (
    <>
      <FilterPanel
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filterRows={filterRows}
        onChangeRows={setFilterRows}
        search={search}
        onSearchChange={setSearch}
        data={data}
      />

      <div className="h-screen flex flex-col overflow-hidden">
        {/* Static top section */}
        <div className="px-8 pt-8 pb-4 flex-none">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <SectionTitle>{s.title}</SectionTitle>
              <MutedText className="mt-1">{s.subtitle(data.length)}</MutedText>
            </div>
            <button
              onClick={() => setFilterOpen(true)}
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
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="rounded-xl border border-sand-400 bg-white px-5 py-4">
              <div className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground mb-1">
                {s.summary.collected}
              </div>
              <div className="text-[24px] font-semibold tabular-nums text-teal-700">
                ${totalCollected.toLocaleString()}
              </div>
              <div className="text-[12px] text-muted-foreground mt-0.5">
                {s.summary.payments(paidCount)}
              </div>
            </div>
            <div className="rounded-xl border border-sand-400 bg-white px-5 py-4">
              <div className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground mb-1">
                {s.summary.outstanding}
              </div>
              <div className="text-[24px] font-semibold tabular-nums text-warning">
                ${totalOutstanding.toLocaleString()}
              </div>
              <div className="text-[12px] text-muted-foreground mt-0.5">
                {s.summary.payments(unpaidCount)}
              </div>
            </div>
            <div className="rounded-xl border border-sand-400 bg-white px-5 py-4">
              <div className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground mb-1">
                {s.summary.overdue}
              </div>
              <div className="text-[24px] font-semibold tabular-nums text-destructive">
                {overdueCount}
              </div>
              <div className="text-[12px] text-muted-foreground mt-0.5">
                {s.needImmediateAction}
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {filterRows
                .filter((r) => r.value)
                .map((row) => {
                  const opts = (() => {
                    if (row.col === "status") return STATUS_OPTIONS;
                    if (row.col === "amount") return AMOUNT_OPTIONS;
                    return [];
                  })();
                  const label = opts.find((o) => o.value === row.value)?.label ?? row.value;
                  return (
                    <span
                      key={row.id}
                      className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-coral-50 border border-coral-200 text-[12px] font-medium text-coral-700"
                    >
                      <span className="text-coral-400">{FILTER_COL_LABELS[row.col]}:</span> {label}
                      <button
                        onClick={() => setFilterRows((rs) => rs.filter((r) => r.id !== row.id))}
                        className="hover:text-coral-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              {search && (
                <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-coral-50 border border-coral-200 text-[12px] font-medium text-coral-700">
                  <span className="text-coral-400">Search:</span> {search}
                  <button onClick={() => setSearch("")} className="hover:text-coral-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              <span className="text-[12px] text-muted-foreground ml-1">
                {s.results(filtered.length, data.length)}
              </span>
            </div>
          )}
        </div>

        {/* Scrollable table */}
        <div className="flex-1 min-h-0 flex flex-col px-8 pb-8">
          {filtered.length === 0 ? (
            <EmptyState title={s.noMatch} description={s.noMatchDescription} />
          ) : (
            <div className="flex-1 min-h-0 rounded-xl border border-sand-400 bg-white overflow-y-auto shadow-sm">
              <table className="w-full table-fixed min-w-[700px]">
                <colgroup>
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "40px" }} />
                </colgroup>
                <thead className="sticky top-0 z-10">
                  <tr className="bg-sand-100 border-b border-sand-400">
                    <th className="px-5 py-3 text-left text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                      {s.cols.tenant}
                    </th>
                    <th className="px-5 py-3 text-left text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                      {s.cols.propertyUnit}
                    </th>
                    <th
                      onClick={() => toggleSort("period")}
                      className={`px-5 py-3 text-left text-[11.5px] font-semibold uppercase tracking-[0.06em] cursor-pointer select-none transition-colors ${sortCol === "period" ? "text-espresso-900" : "text-muted-foreground hover:text-espresso-700"}`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {s.cols.period} <SortIcon active={sortCol === "period"} dir={sortDir} />
                      </span>
                    </th>
                    <th
                      onClick={() => toggleSort("amount")}
                      className={`px-5 py-3 text-right text-[11.5px] font-semibold uppercase tracking-[0.06em] cursor-pointer select-none transition-colors ${sortCol === "amount" ? "text-espresso-900" : "text-muted-foreground hover:text-espresso-700"}`}
                    >
                      <span className="inline-flex items-center gap-1 justify-end w-full">
                        {s.cols.amount} <SortIcon active={sortCol === "amount"} dir={sortDir} />
                      </span>
                    </th>
                    <th
                      onClick={() => toggleSort("paidOn")}
                      className={`px-5 py-3 text-left text-[11.5px] font-semibold uppercase tracking-[0.06em] cursor-pointer select-none transition-colors ${sortCol === "paidOn" ? "text-espresso-900" : "text-muted-foreground hover:text-espresso-700"}`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {s.cols.paidOn} <SortIcon active={sortCol === "paidOn"} dir={sortDir} />
                      </span>
                    </th>
                    <th
                      onClick={() => toggleSort("status")}
                      className={`px-5 py-3 text-right text-[11.5px] font-semibold uppercase tracking-[0.06em] cursor-pointer select-none transition-colors ${sortCol === "status" ? "text-espresso-900" : "text-muted-foreground hover:text-espresso-700"}`}
                    >
                      <span className="inline-flex items-center gap-1 justify-end w-full">
                        {s.cols.status} <SortIcon active={sortCol === "status"} dir={sortDir} />
                      </span>
                    </th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr
                      key={item.payment.id}
                      onClick={() => router.push(`/manager/tenants/${item.tenant.id}`)}
                      className="border-t border-sand-200 hover:bg-coral-50/50 cursor-pointer transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="text-[13.5px] font-semibold text-espresso-900 leading-tight">
                          {item.tenant.name}
                        </div>
                        <div className="text-[12px] text-muted-foreground">{item.tenant.email}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-[13px] font-medium text-espresso-900">
                          {item.property.name}
                        </div>
                        <div className="text-[12px] text-muted-foreground font-mono">
                          {item.unit.label}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[13px] text-espresso-700 font-medium">
                          {formatPeriod(item.payment.periodMonth)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-[13px] font-semibold tabular-nums">
                          ${item.payment.amountDue.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[13px] text-espresso-700">
                          {formatDate(item.payment.paidDate)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex justify-end">
                          <Badge
                            variant={
                              item.payment.status === "overdue"
                                ? "overdue"
                                : item.payment.status === "outstanding"
                                  ? "outstanding"
                                  : "paid"
                            }
                            size="sm"
                          >
                            {item.payment.status === "overdue"
                              ? sp.overdue
                              : item.payment.status === "outstanding"
                                ? sp.outstanding
                                : sp.paid}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-2 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <PaymentRowMenu item={item} />
                      </td>
                    </tr>
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
