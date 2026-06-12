"use client";

import { useRouter } from "next/navigation";
import { useManagerDashboard } from "@repo/data";
import { EmptyState } from "@/client/views/EmptyScreen";
import { ErrorState } from "@/client/views/ErrorScreen";
import { LoadingState } from "@/client/views/LoadingScreen";
import { strings } from "@repo/tokens";
import { ChevronRight } from "lucide-react";
import { TABLE_COLS } from "./util";
import { StatusSection } from "./components/StatusSection";
import { MonthlyRevenueSection } from "./components/MonthlyRevenueSection";
import { PaymentStatusSection } from "./components/PaymentStatusSection";
import { Pill } from "@repo/ui";
import { DataTable } from "@repo/ui";
import type { PropertySummary } from "@repo/data";

const s = strings.manager.dashboard;

export const ManagerDashboard = () => {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useManagerDashboard();

  if (isLoading) return <LoadingState message={s.loading} />;
  if (isError)
    return (
      <ErrorState
        message={(error as Error)?.message ?? s.error}
        onRetry={() => refetch()}
      />
    );
  if (!data)
    return <EmptyState title={s.emptyTitle} description={s.emptyDescription} />;

  const { stats, paymentBreakdown, monthlyRevenue, properties } = data;

  const getTableRow = (row: PropertySummary) => [
    {
      content: row.id,
      className: "whitespace-nowrap px-5 py-4 text-xs font-mono text-neutral-400",
    },
    {
      content: row.name,
      className: "whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-neutral-900",
    },
    { content: row.address, className: "px-5 py-4 text-right text-sm text-neutral-500 w-78" },
    {
      content: (
        <>
          {row.leasedCount}/{row.unitCount}
          <span className="ml-1 text-xs text-neutral-400">
            {s.propertiesTable.occupiedSuffix}
          </span>
        </>
      ),
      className: "whitespace-nowrap px-5 py-4 text-right text-sm text-neutral-600",
    },
    {
      content: row.totalRent > 0 ? `$${row.totalRent.toLocaleString()}/mo` : "—",
      className: "whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-neutral-900",
    },
    {
      content: <div className="flex justify-end"><Pill status={row.status} /></div>,
      sortValue: ({ overdue: 0, outstanding: 1, allPaid: 2, vacant: 3 } as Record<string, number>)[row.status] ?? 99,
      className: "whitespace-nowrap w-28 px-5 py-4",
    },
    {
      content: (
        <span className="inline-flex items-center gap-1 text-sm text-brand-600">
          {s.propertiesTable.viewLink} <ChevronRight className="h-3.5 w-3.5" />
        </span>
      ),
      className: "whitespace-nowrap px-5 py-4 text-right",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{s.title}</h1>
        <p className="mt-1 text-sm text-neutral-500">{s.subtitle}</p>
      </div>

      <StatusSection stats={stats} />

      <div className="grid gap-6 lg:grid-cols-5">
        <MonthlyRevenueSection monthlyRevenue={monthlyRevenue} />
        <PaymentStatusSection paymentBreakdown={paymentBreakdown} />
      </div>

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
          <DataTable
            columns={TABLE_COLS}
            rows={properties.map((p) => ({
              key: p.id,
              onClick: () => router.push(`/manager/properties/${p.id}`),
              cells: getTableRow(p),
            }))}
          />
        )}
      </div>
    </div>
  );
};
