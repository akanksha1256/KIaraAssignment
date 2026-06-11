"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  useAppDispatch,
  useAppSelector,
} from "@/client/stateManagement/mainFile";
import { fetchManagerDashboard } from "@/client/stateManagement/manager/managerSlice";
import { selectDashboard } from "@/client/stateManagement/manager/managerSelectors";
import { selectPropertiesList } from "@/client/stateManagement/property/propertySelectors";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/client/uiComponents";
import { strings } from "@/client/designSystems/strings";
import type { PropertySummary } from "@/client/stateManagement/property/type";
import {
  Building2,
  DoorOpen,
  DollarSign,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

const s = strings.manager.dashboard;

// ── Colour tokens shared across charts ────────────────────────────────────────

const CHART_COLORS = {
  paid: "#22c55e",
  outstanding: "#f59e0b",
  overdue: "#ef4444",
  expected: "#c0d2fe",
  collected: "#2440ed",
};

// ── Stat card ──────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent: "brand" | "success" | "warning" | "danger";
}

const accentMap: Record<StatCardProps["accent"], { bg: string; text: string }> =
  {
    brand: { bg: "bg-brand-50", text: "text-brand-600" },
    success: { bg: "bg-success-50", text: "text-success-700" },
    warning: { bg: "bg-warning-50", text: "text-warning-700" },
    danger: { bg: "bg-danger-50", text: "text-danger-700" },
  };

function StatCard({ icon: Icon, label, value, sub, accent }: StatCardProps) {
  const { bg, text } = accentMap[accent];
  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bg} ${text}`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">{label}</p>
            <p className="text-2xl font-bold text-neutral-900 leading-tight">
              {value}
            </p>
            {sub && <p className="mt-0.5 text-xs text-neutral-400">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Property status badge ──────────────────────────────────────────────────────

const statusConfig: Record<
  PropertySummary["status"],
  { bg: string; text: string; label: string }
> = {
  paid: {
    bg: "bg-success-50",
    text: "text-success-700",
    label: s.statusPill.paid,
  },
  outstanding: {
    bg: "bg-warning-50",
    text: "text-warning-700",
    label: s.statusPill.outstanding,
  },
  overdue: {
    bg: "bg-danger-50",
    text: "text-danger-700",
    label: s.statusPill.overdue,
  },
  vacant: {
    bg: "bg-neutral-100",
    text: "text-neutral-500",
    label: s.statusPill.vacant,
  },
};

function StatusPill({ status }: { status: PropertySummary["status"] }) {
  const { bg, text, label } = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${bg} ${text}`}
    >
      {label}
    </span>
  );
}

// ── Custom bar chart tooltip ───────────────────────────────────────────────────

function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-neutral-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.fill }}>
          {p.name}: ${p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

// ── Custom pie/donut tooltip ───────────────────────────────────────────────────

function PaymentTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-md text-xs">
      <p className="font-semibold" style={{ color: payload[0].payload.fill }}>
        {name}
      </p>
      <p className="text-neutral-600">
        {value} payment{value !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ManagerDashboard() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { status, error, stats, paymentBreakdown, monthlyRevenue } =
    useAppSelector(selectDashboard);

  const { properties } = useAppSelector(selectPropertiesList);

  useEffect(() => {
    dispatch(fetchManagerDashboard());
  }, [dispatch]);

  if (status === "pending") return <LoadingState message={s.loading} />;
  if (status === "failed")
    return (
      <ErrorState
        message={s.error}
        onRetry={() => dispatch(fetchManagerDashboard())}
      />
    );
  if (!stats)
    return <EmptyState title={s.emptyTitle} description={s.emptyDescription} />;

  const pieData = paymentBreakdown
    ? [
        {
          name: s.paymentChart.paid,
          value: paymentBreakdown.paid,
          fill: CHART_COLORS.paid,
        },
        {
          name: s.paymentChart.outstanding,
          value: paymentBreakdown.outstanding,
          fill: CHART_COLORS.outstanding,
        },
        {
          name: s.paymentChart.overdue,
          value: paymentBreakdown.overdue,
          fill: CHART_COLORS.overdue,
        },
      ].filter((d) => d.value > 0)
    : [];

  const collectionRate =
    stats.totalMonthlyRent > 0
      ? Math.round((stats.collectedThisMonth / stats.totalMonthlyRent) * 100)
      : 0;

  const TABLE_COLS = [
    { label: s.propertiesTable.colId, align: "left" },
    { label: s.propertiesTable.colName, align: "left" },
    { label: s.propertiesTable.colAddress, align: "left" },
    { label: s.propertiesTable.colUnits, align: "right" },
    { label: s.propertiesTable.colRent, align: "right" },
    { label: s.propertiesTable.colStatus, align: "left" },
    { label: "", align: "right" },
  ];

  return (
    <div className="space-y-8">
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{s.title}</h1>
        <p className="mt-1 text-sm text-neutral-500">{s.subtitle}</p>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Building2}
          label={s.stats.properties}
          value={String(stats.totalProperties)}
          sub={s.stats.propertiesSubtitle(stats.totalUnits)}
          accent="brand"
        />
        <StatCard
          icon={DoorOpen}
          label={s.stats.occupancy}
          value={`${stats.occupiedUnits}/${stats.totalUnits}`}
          sub={s.stats.occupancySubtitle(stats.vacantUnits)}
          accent="brand"
        />
        <StatCard
          icon={DollarSign}
          label={s.stats.monthlyRent}
          value={`$${stats.totalMonthlyRent.toLocaleString()}`}
          sub={s.stats.monthlyRentSubtitle}
          accent="success"
        />
        <StatCard
          icon={TrendingUp}
          label={s.stats.collectionRate}
          value={`${collectionRate}%`}
          sub={s.stats.collectionRateSubtitle(
            `$${stats.collectedThisMonth.toLocaleString()}`,
          )}
          accent={collectionRate >= 80 ? "success" : "warning"}
        />
      </div>

      {/* ── Charts row ──────────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{s.revenueChart.title}</CardTitle>
            <p className="text-xs text-neutral-400">
              {s.revenueChart.subtitle}
            </p>
          </CardHeader>
          <CardContent>
            {monthlyRevenue.length === 0 ? (
              <EmptyState title={s.revenueChart.empty} />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={monthlyRevenue}
                  barCategoryGap="30%"
                  barGap={4}
                  margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                >
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                  />
                  <Tooltip
                    content={<RevenueTooltip />}
                    cursor={{ fill: "#f1f5f9" }}
                  />
                  <Bar
                    dataKey="expected"
                    name={s.revenueChart.barExpected}
                    fill={CHART_COLORS.expected}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="collected"
                    name={s.revenueChart.barCollected}
                    fill={CHART_COLORS.collected}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{s.paymentChart.title}</CardTitle>
            <p className="text-xs text-neutral-400">
              {s.paymentChart.subtitle}
            </p>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <EmptyState title={s.paymentChart.empty} />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<PaymentTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-xs text-neutral-600">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Properties table ────────────────────────────────────────────────── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
            {s.propertiesTable.heading(properties.length)}
          </h2>
        </div>

        {properties.length === 0 ? (
          <EmptyState
            title={s.propertiesTable.empty}
            description={s.propertiesTable.emptyDescription}
          />
        ) : (
          <Card className="overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead>
                <tr className="bg-neutral-50">
                  {TABLE_COLS.map(({ label, align }) => (
                    <th
                      key={label}
                      className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-400 text-${align}`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {properties.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => router.push(`/manager/properties/${p.id}`)}
                    className="cursor-pointer transition-colors hover:bg-neutral-50"
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-xs font-mono text-neutral-400">
                      {p.id}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-neutral-900">
                      {p.name}
                    </td>
                    <td className="px-5 py-4 text-sm text-neutral-500">
                      {p.address}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right text-sm text-neutral-600">
                      {p.leasedCount}/{p.unitCount}
                      <span className="ml-1 text-xs text-neutral-400">
                        {s.propertiesTable.occupiedSuffix}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-neutral-900">
                      {p.totalRent > 0
                        ? `$${p.totalRent.toLocaleString()}/mo`
                        : "—"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <StatusPill status={p.status} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <span className="inline-flex items-center gap-1 text-sm text-brand-600">
                        {s.propertiesTable.viewLink}{" "}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
