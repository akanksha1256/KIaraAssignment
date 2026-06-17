"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAllPayments } from "@repo/data";
import type {
  PaymentsListSortCol as SortCol,
  SortDir,
  PaymentsListFilterColKey as FilterColKey,
} from "@repo/data";
import { ErrorState } from "@/client/views/ErrorScreen";
import { EmptyState } from "@/client/views/EmptyScreen";
import { PaymentsListHeader } from "./components/PaymentsListHeader";
import { type GenericFilterRow } from "@/client/components/FilterPopup";
import { FilterAndSearchSection } from "@/client/components/FilterAndSearchSection";
import { PaymentsListSkeleton } from "./PaymentsListLoadingScreen";
import { strings } from "@repo/tokens";
import { formatPeriod } from "@/client/views/manager/util";
import { PaymentsTable } from "./components/PaymentsTable";
import { SummaryCardSection } from "./components/SummaryCardSection";

const s = strings.manager.paymentsList;
const sp = strings.statusPill;

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

// ── Main view ─────────────────────────────────────────────────────────────────
export const PaymentsPage = () => {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useAllPayments();

  const [filterOpen, setFilterOpen] = useState(false);
  const [appliedFilterRows, setAppliedFilterRows] = useState<GenericFilterRow[]>([]);
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<SortCol | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filterContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterOpen) return;
    const handler = (e: MouseEvent) => {
      if (filterContainerRef.current && !filterContainerRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [filterOpen]);

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

    for (const row of appliedFilterRows) {
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
      if (sortCol === "property") cmp = a.property.name.localeCompare(b.property.name);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, appliedFilterRows, search, sortCol, sortDir]);

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

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Static top section */}
      <div className="px-8 pt-8 pb-4 flex-none">
        <PaymentsListHeader count={data.length} />

        {/* Summary cards */}
        <SummaryCardSection
          totalCollected={totalCollected}
          paidCount={paidCount}
          totalOutstanding={totalOutstanding}
          unpaidCount={unpaidCount}
          overdueCount={overdueCount}
        />

        <FilterAndSearchSection
          filterOpen={filterOpen}
          setFilterOpen={setFilterOpen}
          filterContainerRef={filterContainerRef}
          appliedFilterRows={appliedFilterRows}
          setAppliedFilterRows={setAppliedFilterRows}
          search={search}
          setSearch={setSearch}
          colLabels={FILTER_COL_LABELS}
          defaultCol="status"
          getOptions={(col) => {
            if (col === "status") return STATUS_OPTIONS;
            if (col === "property")
              return [...new Map(data.map((p) => [p.property.id, p.property])).values()].map(
                (p) => ({ value: p.id, label: p.name }),
              );
            if (col === "period")
              return [...new Set(data.map((p) => p.payment.periodMonth))]
                .sort((a, b) => b.localeCompare(a))
                .map((m) => ({ value: m, label: formatPeriod(m) }));
            if (col === "amount") return AMOUNT_OPTIONS;
            return [];
          }}
          resultCount={filtered.length}
          totalCount={data.length}
          strings={{
            searchPlaceholder: s.searchPlaceholder,
            results: s.results,
          }}
        />
      </div>

      {/* Scrollable table */}
      <div className="flex-1 min-h-0 flex flex-col px-8 pb-8">
        <PaymentsTable
          items={filtered}
          sortCol={sortCol}
          sortDir={sortDir}
          onSort={toggleSort}
          onRowClick={(tenantId) => router.push(`/manager/tenants/${tenantId}`)}
          emptyTitle={s.noMatch}
          emptyDescription={s.noMatchDescription}
        />
      </div>
    </div>
  );
};
