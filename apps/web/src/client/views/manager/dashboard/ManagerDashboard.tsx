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
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/client/uiComponents";
import type { PropertySummary } from "@/platform/types";
import {
  Building2,
  DoorOpen,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

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
  paid: { bg: "bg-success-50", text: "text-success-700", label: "All Paid" },
  outstanding: {
    bg: "bg-warning-50",
    text: "text-warning-700",
    label: "Outstanding",
  },
  overdue: { bg: "bg-danger-50", text: "text-danger-700", label: "Overdue" },
  vacant: { bg: "bg-neutral-100", text: "text-neutral-500", label: "Vacant" },
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

  const {
    loading,
    error,
    stats,
    paymentBreakdown,
    monthlyRevenue,
    properties,
  } = useAppSelector(selectDashboard);

  useEffect(() => {
    dispatch(fetchManagerDashboard());
  }, [dispatch]);

  if (loading) return <LoadingState message="Loading dashboard…" />;
  if (error)
    return (
      <ErrorState
        message="Could not load dashboard data."
        onRetry={() => dispatch(fetchManagerDashboard())}
      />
    );
  if (!stats)
    return (
      <EmptyState
        title="No data yet"
        description="Add properties to see your dashboard."
      />
    );

  // ── Prepare chart data ─────────────────────────────────────────────────────

  const pieData = paymentBreakdown
    ? [
        { name: "Paid", value: paymentBreakdown.paid, fill: CHART_COLORS.paid },
        {
          name: "Outstanding",
          value: paymentBreakdown.outstanding,
          fill: CHART_COLORS.outstanding,
        },
        {
          name: "Overdue",
          value: paymentBreakdown.overdue,
          fill: CHART_COLORS.overdue,
        },
      ].filter((d) => d.value > 0)
    : [];

  const collectionRate =
    stats.totalMonthlyRent > 0
      ? Math.round((stats.collectedThisMonth / stats.totalMonthlyRent) * 100)
      : 0;

  return (
    <div className="space-y-8">
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          Manager Dashboard
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Overview of your portfolio performance.
        </p>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Building2}
          label="Properties"
          value={String(stats.totalProperties)}
          sub={`${stats.totalUnits} total units`}
          accent="brand"
        />
        <StatCard
          icon={DoorOpen}
          label="Occupancy"
          value={`${stats.occupiedUnits}/${stats.totalUnits}`}
          sub={`${stats.vacantUnits} vacant`}
          accent="brand"
        />
        <StatCard
          icon={DollarSign}
          label="Monthly Rent"
          value={`$${stats.totalMonthlyRent.toLocaleString()}`}
          sub="across active leases"
          accent="success"
        />
        <StatCard
          icon={TrendingUp}
          label="Collection Rate"
          value={`${collectionRate}%`}
          sub={`$${stats.collectedThisMonth.toLocaleString()} collected`}
          accent={collectionRate >= 80 ? "success" : "warning"}
        />
      </div>

      {/* ── Charts row ──────────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Bar chart — Monthly Revenue (3/5 width) */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <p className="text-xs text-neutral-400">
              Expected vs collected over last 6 months
            </p>
          </CardHeader>
          <CardContent>
            {monthlyRevenue.length === 0 ? (
              <EmptyState title="No revenue data" />
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
                    name="Expected"
                    fill={CHART_COLORS.expected}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="collected"
                    name="Collected"
                    fill={CHART_COLORS.collected}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Donut chart — Payment status (2/5 width) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
            <p className="text-xs text-neutral-400">
              Breakdown across all leases
            </p>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <EmptyState title="No payment data" />
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
            Properties ({properties.length})
          </h2>
        </div>

        {properties.length === 0 ? (
          <EmptyState
            title="No properties"
            description="Add your first property to get started."
          />
        ) : (
          <Card className="overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead>
                <tr className="bg-neutral-50">
                  {[
                    { label: "ID", align: "left" },
                    { label: "Property Name", align: "left" },
                    { label: "Address", align: "left" },
                    { label: "Units", align: "right" },
                    { label: "Monthly Rent", align: "right" },
                    { label: "Status", align: "left" },
                    { label: "", align: "right" },
                  ].map(({ label, align }) => (
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
                        occupied
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
                        View <ChevronRight className="h-3.5 w-3.5" />
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
