"use client";

import { useRouter } from "next/navigation";
import { useManagerDashboard } from "@repo/data";
import { DashboardSkeleton } from "@/client/views/LoadingScreen";
import { ErrorState } from "@/client/views/ErrorScreen";
import { EmptyState } from "@/client/views/EmptyScreen";
import { strings } from "@repo/tokens";
import {
  ArrowRight,
  Building2,
  DoorOpen,
  DollarSign,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { StatCard, DataTable, Badge } from "@repo/ui";
import type { RowGroup } from "@repo/ui";
import type { PropertySummary, AtRiskLease } from "@repo/data";
import { MonthlyRevenueSection } from "./components/MonthlyRevenueSection";
import { PaymentStatusSection } from "./components/PaymentStatusSection";

const s = strings.manager.dashboard;

// ── Attention Hero ────────────────────────────────────────────────────────────
function AttentionHero({
  totalAmount,
  overdueAmount,
  overdueCount,
  outstandingAmount,
  outstandingCount,
  atRiskLeases,
}: {
  totalAmount: number;
  overdueAmount: number;
  overdueCount: number;
  outstandingAmount: number;
  outstandingCount: number;
  atRiskLeases: AtRiskLease[];
}) {
  const fmt = (n: number) => `$${n.toLocaleString()}`;

  return (
    <section
      aria-label="Needs attention"
      className="grid grid-cols-[1.3fr_1fr] gap-px bg-sand-400 border border-sand-400 rounded-xl overflow-hidden shadow-md mb-6"
    >
      {/* Left — money + actions */}
      <div className="bg-white p-6 bg-gradient-to-br from-white to-coral-50">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-destructive flex-none" />
          <span className="t-overline" style={{ color: "var(--destructive)" }}>
            Needs attention
          </span>
        </div>
        <div className="t-money text-espresso-900">{fmt(totalAmount)}</div>
        <p className="text-espresso-700 mt-2 max-w-[42ch] text-[15px]">
          outstanding across <strong>{overdueCount + outstandingCount} leases</strong> this cycle.{" "}
          {overdueCount > 0 &&
            `${overdueCount} are now overdue — clear these first to protect collection rate.`}
        </p>

        <div className="flex gap-3 mt-5">
          <div className="flex-1 bg-white border border-sand-400 rounded-lg p-3 px-4">
            <div className="text-[22px] font-semibold tracking-tight text-destructive">
              {fmt(overdueAmount)}
            </div>
            <div className="text-[12.5px] text-muted-foreground mt-0.5">
              Overdue · {overdueCount} lease{overdueCount !== 1 ? "s" : ""}
            </div>
          </div>
          <div className="flex-1 bg-white border border-sand-400 rounded-lg p-3 px-4">
            <div className="text-[22px] font-semibold tracking-tight text-warning">
              {fmt(outstandingAmount)}
            </div>
            <div className="text-[12.5px] text-muted-foreground mt-0.5">
              Outstanding · {outstandingCount} lease{outstandingCount !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-coral-500 text-white text-[14px] font-medium hover:bg-coral-600 transition-colors shadow-sm">
            Review overdue <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button className="inline-flex items-center h-10 px-5 rounded-full text-maroon-600 text-[14px] font-medium hover:bg-sand-100 transition-colors">
            Send all reminders
          </button>
        </div>
      </div>

      {/* Right — at-risk list */}
      <div className="bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="t-overline">At-risk leases</span>
          <button className="text-[13.5px] font-medium text-maroon-600 hover:bg-sand-100 px-2.5 py-1 rounded-full transition-colors">
            View all
          </button>
        </div>
        <div>
          {atRiskLeases.slice(0, 4).map((l, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 border-t border-sand-200 first:border-t-0"
            >
              <div>
                <div className="text-[14px] font-medium text-espresso-900">{l.tenantName}</div>
                <div className="text-[12.5px] text-muted-foreground">
                  {l.propertyName} · {l.unitLabel}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[14px] font-semibold text-espresso-900">
                  ${l.amountDue.toLocaleString()}
                </div>
                {l.status === "overdue" ? (
                  <div className="text-[11.5px] text-destructive font-medium">
                    {l.daysOverdue} days overdue
                  </div>
                ) : (
                  <div className="text-[11.5px] text-warning font-medium">Outstanding</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Status Mix Bar ────────────────────────────────────────────────────────────
function StatusMixBar({ property }: { property: PropertySummary }) {
  // Derive segment widths from status (simplified — actual per-unit breakdown needs API change)
  const total = property.unitCount || 1;
  const vacant = property.unitCount - property.leasedCount;

  // For the mix bar we use property-level status as dominant signal
  const overdueW = property.status === "overdue" ? Math.max(20, Math.round((1 / total) * 100)) : 0;
  const outstandW =
    property.status === "outstanding" ? Math.max(20, Math.round((1 / total) * 100)) : 0;
  const vacantW = Math.round((vacant / total) * 100);
  const paidW = Math.max(0, 100 - overdueW - outstandW - vacantW);

  const statusLabel =
    property.status === "overdue"
      ? `${overdueW > 0 ? 1 : 0}/${total} overdue`
      : property.status === "outstanding"
        ? `${outstandW > 0 ? 1 : 0}/${total} outstanding`
        : property.leasedCount === 0
          ? "No active leases"
          : `${total}/${total} paid`;

  return (
    <div className="flex flex-col gap-1.5 items-start">
      <Badge
        variant={
          property.status === "overdue"
            ? "overdue"
            : property.status === "outstanding"
              ? "outstanding"
              : property.status === "paid"
                ? "paid"
                : "vacant"
        }
      >
        {statusLabel}
      </Badge>
      <div className="flex w-[104px] h-1.5 rounded-full overflow-hidden bg-sand-200">
        {overdueW > 0 && (
          <span className="block h-full bg-destructive" style={{ width: `${overdueW}%` }} />
        )}
        {outstandW > 0 && (
          <span className="block h-full bg-warning" style={{ width: `${outstandW}%` }} />
        )}
        {paidW > 0 && <span className="block h-full bg-teal-600" style={{ width: `${paidW}%` }} />}
        {vacantW > 0 && (
          <span className="block h-full bg-espresso-300" style={{ width: `${vacantW}%` }} />
        )}
      </div>
    </div>
  );
}

// ── Properties table with urgency groups ──────────────────────────────────────
const TABLE_COLS = [
  { label: "Property" },
  { label: "Units" },
  { label: "Rent/mo", align: "right" as const },
  { label: "Status" },
  { label: "", align: "right" as const },
];

const URGENCY_ORDER = { overdue: 0, outstanding: 1, paid: 2, vacant: 3 } as const;

function buildGroups(properties: PropertySummary[], onNav: (id: string) => void): RowGroup[] {
  const grouped: Record<string, PropertySummary[]> = {
    overdue: [],
    outstanding: [],
    paid: [],
    vacant: [],
  };
  for (const p of properties) {
    const key = p.status === "paid" ? "paid" : p.status;
    (grouped[key] || grouped.paid).push(p);
  }

  const groupDefs: Array<{ key: string; label: string; urgency: RowGroup["urgency"] }> = [
    { key: "overdue", label: "Overdue", urgency: "overdue" },
    { key: "outstanding", label: "Outstanding", urgency: "outstanding" },
    { key: "paid", label: "Paid", urgency: "paid" },
    { key: "vacant", label: "Vacant", urgency: "vacant" },
  ];

  return groupDefs
    .filter((g) => (grouped[g.key]?.length ?? 0) > 0)
    .map((g) => ({
      label: g.label,
      count: grouped[g.key].length,
      urgency: g.urgency,
      rows: grouped[g.key].map((p) => ({
        key: p.id,
        onClick: () => onNav(p.id),
        urgent: p.status === "overdue",
        vacant: p.status === "vacant",
        cells: [
          {
            content: (
              <div>
                <div className="font-semibold text-espresso-900 text-[14px]">{p.name}</div>
                <div className="text-[13px] text-muted-foreground mt-0.5">{p.address}</div>
              </div>
            ),
          },
          {
            content: (
              <span className="text-[14px]">
                <span className="font-semibold">
                  {p.leasedCount}/{p.unitCount}
                </span>
                <span className="text-muted-foreground text-[12.5px] ml-1">occupied</span>
              </span>
            ),
          },
          {
            content:
              p.totalRent > 0 ? (
                <span className="font-semibold tabular-nums">
                  ${p.totalRent.toLocaleString()}
                  <span className="text-muted-foreground font-normal text-[12px]">/mo</span>
                </span>
              ) : (
                <span className="text-espresso-300">—</span>
              ),
            className: "text-right",
          },
          {
            content: <StatusMixBar property={p} />,
          },
          {
            content: (
              <div className="flex justify-end">
                {p.status === "overdue" ? (
                  <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-coral-500 text-white text-[13px] font-medium hover:bg-coral-600 transition-colors">
                    Send reminder
                  </button>
                ) : p.status === "vacant" ? (
                  <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-teal-600 text-white text-[13px] font-medium hover:bg-teal-700 transition-colors">
                    Add lease
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[13.5px] font-medium text-maroon-600">
                    View <ChevronRight className="h-3.5 w-3.5" />
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

// ── Main Dashboard ────────────────────────────────────────────────────────────
export const ManagerDashboard = () => {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useManagerDashboard();

  if (isLoading) return <DashboardSkeleton />;
  if (isError)
    return <ErrorState message={(error as Error)?.message ?? s.error} onRetry={() => refetch()} />;
  if (!data) return <EmptyState title={s.emptyTitle} description={s.emptyDescription} />;

  const { stats, paymentBreakdown, monthlyRevenue, properties, atRiskLeases } = data;

  const collectionRate =
    stats.totalMonthlyRent > 0
      ? Math.round((stats.collectedThisMonth / stats.totalMonthlyRent) * 100)
      : 0;

  const totalAtRisk = paymentBreakdown.overdueAmount + paymentBreakdown.outstandingAmount;

  return (
    <div className="p-8 max-w-[1180px]">
      {/* Page header */}
      <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="font-serif text-[40px] font-semibold leading-[1.1] tracking-[-0.01em] text-maroon-600">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Your portfolio at a glance —{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
      </div>

      {/* Attention hero — only show when there's something to act on */}
      {totalAtRisk > 0 && (
        <AttentionHero
          totalAmount={totalAtRisk}
          overdueAmount={paymentBreakdown.overdueAmount}
          overdueCount={paymentBreakdown.overdue}
          outstandingAmount={paymentBreakdown.outstandingAmount}
          outstandingCount={paymentBreakdown.outstanding}
          atRiskLeases={atRiskLeases}
        />
      )}

      {/* Secondary KPI row */}
      <section
        aria-label="Portfolio metrics"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <StatCard
          icon={Building2}
          label={`Properties · ${stats.totalUnits} units`}
          value={String(stats.totalProperties)}
          accent="neutral"
          trend={{ direction: "flat", label: "0" }}
        />
        <StatCard
          icon={DoorOpen}
          label={`Occupied · ${stats.vacantUnits} vacant`}
          value={`${stats.occupiedUnits}/${stats.totalUnits}`}
          accent="neutral"
          trend={{ direction: "up", label: "+2" }}
        />
        <StatCard
          icon={DollarSign}
          label="Monthly rent"
          value={`$${stats.totalMonthlyRent.toLocaleString()}`}
          accent="neutral"
          trend={{ direction: "flat", label: "—" }}
        />
        <StatCard
          icon={TrendingUp}
          label="Collection rate"
          value={`${collectionRate}%`}
          accent={collectionRate >= 80 ? "teal" : "warning"}
          trend={{ direction: collectionRate >= 80 ? "up" : "down", label: `${collectionRate}%` }}
          alert={collectionRate < 60}
        />
      </section>

      {/* Charts */}
      <div className="grid grid-cols-[1.5fr_1fr] gap-4 mb-6">
        <MonthlyRevenueSection monthlyRevenue={monthlyRevenue} />
        <PaymentStatusSection paymentBreakdown={paymentBreakdown} />
      </div>

      {/* Properties table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-semibold text-espresso-900">
            Properties
            <span className="ml-2 text-[14px] font-normal text-muted-foreground">
              ({properties.length})
            </span>
          </h2>
        </div>

        {properties.length === 0 ? (
          <EmptyState
            title="No properties yet"
            description="Add your first property to get started."
            icon="building"
          />
        ) : (
          <DataTable
            columns={TABLE_COLS}
            groups={buildGroups(properties, (id) => router.push(`/manager/properties/${id}`))}
          />
        )}
      </div>
    </div>
  );
};
