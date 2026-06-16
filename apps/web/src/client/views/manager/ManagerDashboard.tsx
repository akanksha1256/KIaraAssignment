"use client";

import { useRouter } from "next/navigation";
import { useManagerDashboard, PropertyStatusValues } from "@repo/data";
import { DashboardSkeleton } from "@/client/views/LoadingScreen";
import { ErrorState } from "@/client/views/ErrorScreen";
import { EmptyState } from "@/client/views/EmptyScreen";
import { strings } from "@repo/tokens";
import {
  Building2 as Building2Icon,
  DoorOpen as DoorOpenIcon,
  DollarSign as DollarSignIcon,
  TrendingUp as TrendingUpIcon,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { Button, StatCard } from "@repo/ui";
import { MonthlyRevenueSection } from "./components/MonthlyRevenueSection";
import { PaymentStatusSection } from "./components/PaymentStatusSection";
import { AttentionHero } from "./components/AttentionHero";

const s = strings.manager.dashboard;

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
            {s.pageTitle}
          </h1>
          <p className="text-muted-foreground mt-1">
            {s.pageSubtitlePrefix}{" "}
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
          icon={Building2Icon}
          label={s.stats.propertiesLabel(stats.totalUnits)}
          value={String(stats.totalProperties)}
          accent="neutral"
          trend={{ direction: "flat", label: "0" }}
        />
        <StatCard
          icon={DoorOpenIcon}
          label={s.stats.occupancyLabel(stats.vacantUnits)}
          value={`${stats.occupiedUnits}/${stats.totalUnits}`}
          accent="neutral"
          trend={{ direction: "up", label: "+2" }}
        />
        <StatCard
          icon={DollarSignIcon}
          label={s.stats.monthlyRentLabel}
          value={`$${stats.totalMonthlyRent.toLocaleString()}`}
          accent="neutral"
          trend={{ direction: "flat", label: "—" }}
        />
        <StatCard
          icon={TrendingUpIcon}
          label={s.stats.collectionRateLabel}
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

      {/* Properties summary link */}
      <Button
        variant="outline"
        onClick={() => router.push("/manager/properties")}
        className="w-full justify-between h-auto py-4 rounded-xl group"
      >
        <div className="flex items-center gap-3">
          <Building2Icon className="h-5 w-5 text-muted-foreground" />
          <span className="text-[15px] font-medium text-espresso-900">
            {s.propertiesSummary(properties.length)}
          </span>
          {properties.filter((p) => p.status === PropertyStatusValues.OVERDUE).length > 0 && (
            <span className="text-[13px] text-destructive font-medium">
              {s.propertiesOverdueCount(properties.filter((p) => p.status === PropertyStatusValues.OVERDUE).length)}
            </span>
          )}
        </div>
        <span className="inline-flex items-center gap-1 text-[13.5px] font-medium text-maroon-600 group-hover:gap-2 transition-all">
          {s.viewAllProperties} <ChevronRightIcon className="h-4 w-4" />
        </span>
      </Button>
    </div>
  );
};
