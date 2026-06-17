"use client";

import { useRouter } from "next/navigation";
import { usePropertyDetail } from "@repo/data";
import { PropertyDetailSkeleton } from "./PropertyDetailLoadingScreen";
import { ErrorState } from "@/client/views/ErrorScreen";
import { EmptyState } from "@/client/views/EmptyScreen";
import { DataTable, Badge, StatCard } from "@repo/ui";
import type { RowGroup } from "@repo/ui";
import { strings } from "@repo/tokens";
import { formatDate } from "@repo/ui";
import { Building2, DoorOpen, DoorClosed, DollarSign, ChevronRight } from "lucide-react";
import { BackButton } from "@/client/components/BackButton";
import type { UnitDetailItem } from "@repo/data";

const s = strings.manager.propertyDetail;


// ── Unit Status Mix Bar (full-width) ──────────────────────────────────────────
function UnitMixBar({ units }: { units: UnitDetailItem[] }) {
  const total = units.length || 1;
  const overdue = units.filter((u) => u.paymentStatus === "overdue").length;
  const outstanding = units.filter((u) => u.paymentStatus === "outstanding").length;
  const paid = units.filter((u) => u.paymentStatus === "paid").length;
  const vacant = units.filter((u) => u.paymentStatus === "vacant").length;

  const pct = (n: number) => `${Math.round((n / total) * 100)}%`;

  const segments = [
    { count: overdue,      pct: pct(overdue),      label: "Overdue",      color: "bg-destructive", textColor: "text-destructive" },
    { count: outstanding,  pct: pct(outstanding),  label: "Outstanding",  color: "bg-warning",     textColor: "text-warning" },
    { count: paid,         pct: pct(paid),          label: "Paid",         color: "bg-teal-600",    textColor: "text-teal-700" },
    { count: vacant,       pct: pct(vacant),        label: "Vacant",       color: "bg-espresso-300",textColor: "text-espresso-500" },
  ].filter((s) => s.count > 0);

  return (
    <div className="rounded-xl border border-sand-400 bg-white p-5">
      <p className="t-overline mb-3">Unit status breakdown</p>
      <div className="flex h-2 w-full rounded-full overflow-hidden gap-px bg-sand-200 mb-4">
        {segments.map((seg) => (
          <span key={seg.label} className={`block h-full ${seg.color}`} style={{ width: seg.pct }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-1">
        {segments.map((seg) => (
          <span key={seg.label} className="flex items-center gap-1.5 text-[12.5px] text-espresso-700">
            <span className={`w-2 h-2 rounded-full inline-block ${seg.color}`} />
            <span className={`font-semibold ${seg.textColor}`}>{seg.count}</span>
            {seg.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Units Table ───────────────────────────────────────────────────────────────
const TABLE_COLS = [
  { label: s.unitsTable.colUnit },
  { label: s.unitsTable.colTenant },
  { label: s.unitsTable.colRent, align: "right" as const },
  { label: s.unitsTable.colLease, align: "right" as const },
  { label: s.unitsTable.colStatus },
  { label: "", align: "right" as const },
];

const URGENCY_ORDER = ["overdue", "outstanding", "paid", "vacant"] as const;

function buildUnitGroups(
  units: UnitDetailItem[],
  propertyId: string,
  onNav: (unitId: string) => void
): RowGroup[] {
  const grouped: Record<string, UnitDetailItem[]> = {
    overdue: [], outstanding: [], paid: [], vacant: [],
  };
  for (const u of units) {
    (grouped[u.paymentStatus] ?? grouped.paid).push(u);
  }

  const groupDefs: Array<{ key: string; label: string; urgency: RowGroup["urgency"] }> = [
    { key: "overdue",     label: "Overdue",     urgency: "overdue" },
    { key: "outstanding", label: "Outstanding", urgency: "outstanding" },
    { key: "paid",        label: "Paid",        urgency: "paid" },
    { key: "vacant",      label: "Vacant",      urgency: "vacant" },
  ];

  return groupDefs
    .filter((g) => (grouped[g.key]?.length ?? 0) > 0)
    .map((g) => ({
      label: g.label,
      count: grouped[g.key].length,
      urgency: g.urgency,
      rows: grouped[g.key].map((unit) => ({
        key: unit.id,
        onClick: () => onNav(unit.id),
        urgent: unit.paymentStatus === "overdue",
        vacant: unit.paymentStatus === "vacant",
        cells: [
          {
            content: (
              <span className="font-mono text-[13px] font-semibold text-espresso-900 bg-sand-100 px-2 py-0.5 rounded">
                {unit.label}
              </span>
            ),
          },
          {
            content: unit.tenant ? (
              <span className="text-[14px] font-medium text-maroon-600 hover:underline cursor-pointer">
                {unit.tenant.name}
              </span>
            ) : (
              <span className="text-espresso-300 text-[14px]">{s.unitsTable.vacant}</span>
            ),
          },
          {
            content: unit.lease ? (
              <span className="font-semibold tabular-nums text-[14px]">
                ${unit.lease.monthlyRent.toLocaleString()}
                <span className="text-muted-foreground font-normal text-[12px]">/mo</span>
              </span>
            ) : (
              <span className="text-espresso-300">—</span>
            ),
            className: "text-right",
          },
          {
            content: unit.lease ? (
              <span className="text-[12.5px] text-muted-foreground tabular-nums">
                {formatDate(unit.lease.startDate)} → {formatDate(unit.lease.endDate)}
              </span>
            ) : (
              <span className="text-espresso-300">—</span>
            ),
            className: "text-right",
          },
          {
            content: (
              <Badge
                variant={
                  unit.paymentStatus === "overdue" ? "overdue"
                  : unit.paymentStatus === "outstanding" ? "outstanding"
                  : unit.paymentStatus === "paid" ? "paid"
                  : "vacant"
                }
              >
                {unit.paymentStatus === "vacant" ? "Vacant"
                  : unit.paymentStatus === "overdue" ? "Overdue"
                  : unit.paymentStatus === "outstanding" ? "Outstanding"
                  : "Paid"}
              </Badge>
            ),
          },
          {
            content: (
              <div className="flex justify-end">
                {unit.paymentStatus === "overdue" ? (
                  <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-coral-500 text-white text-[13px] font-medium hover:bg-coral-600 transition-colors">
                    Send reminder
                  </button>
                ) : unit.paymentStatus === "vacant" ? (
                  <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-teal-600 text-white text-[13px] font-medium hover:bg-teal-700 transition-colors">
                    Add lease
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[13.5px] font-medium text-maroon-600">
                    Open <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
            ),
            className: "text-right",
          },
        ],
      })),
    }));
}

// ── Main View ─────────────────────────────────────────────────────────────────
interface Props {
  propertyId: string;
}

export const PropertyDetail = ({ propertyId }: Props) => {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = usePropertyDetail(propertyId);

  if (isLoading) return <PropertyDetailSkeleton />;
  if (isError) return <ErrorState message={(error as Error)?.message ?? s.error} onRetry={() => refetch()} />;
  if (!data) return <EmptyState title={s.emptyTitle} description={s.emptyDescription} />;

  const { property, units } = data;
  const totalUnits = units.length;
  const occupiedUnits = units.filter((u) => u.paymentStatus !== "vacant").length;
  const vacantUnits = totalUnits - occupiedUnits;
  const totalRent = units.reduce((sum, u) => sum + (u.lease?.monthlyRent ?? 0), 0);
  const overdueCount = units.filter((u) => u.paymentStatus === "overdue").length;

  return (
    <div className="p-8 max-w-[1180px]">
      {/* Back navigation */}
      <BackButton onClick={() => router.back()}>{s.backLink}</BackButton>

      {/* Page header */}
      <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="font-serif text-[36px] font-semibold leading-[1.1] tracking-[-0.01em] text-maroon-600">
            {property.name}
          </h1>
          <p className="text-muted-foreground mt-1">{property.address}</p>
        </div>
        {overdueCount > 0 && (
          <div className="flex items-center gap-2 bg-destructive-bg border border-destructive/20 text-destructive rounded-full px-4 py-2 text-[13px] font-medium">
            <span className="w-2 h-2 rounded-full bg-destructive flex-none" />
            {overdueCount} unit{overdueCount !== 1 ? "s" : ""} overdue — action needed
          </div>
        )}
      </div>

      {/* Stat cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Building2}
          label="Total units"
          value={String(totalUnits)}
          accent="neutral"
        />
        <StatCard
          icon={DoorOpen}
          label={`Occupied · ${vacantUnits} vacant`}
          value={`${occupiedUnits}/${totalUnits}`}
          accent="neutral"
        />
        <StatCard
          icon={DoorClosed}
          label="Vacant"
          value={String(vacantUnits)}
          accent={vacantUnits > 0 ? "warning" : "teal"}
          alert={vacantUnits > 0}
        />
        <StatCard
          icon={DollarSign}
          label="Monthly rent"
          value={`$${totalRent.toLocaleString()}`}
          accent="teal"
        />
      </section>

      {/* Unit status mix bar */}
      <div className="mb-6">
        <UnitMixBar units={units} />
      </div>

      {/* Units table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-semibold text-espresso-900">
            Units
            <span className="ml-2 text-[14px] font-normal text-muted-foreground">({totalUnits})</span>
          </h2>
        </div>

        {units.length === 0 ? (
          <EmptyState title={s.unitsTable.empty} description={s.unitsTable.emptyDescription} />
        ) : (
          <DataTable
            columns={TABLE_COLS}
            groups={buildUnitGroups(units, propertyId, (unitId) =>
              router.push(`/manager/properties/${propertyId}/units/${unitId}`)
            )}
          />
        )}
      </div>
    </div>
  );
};
