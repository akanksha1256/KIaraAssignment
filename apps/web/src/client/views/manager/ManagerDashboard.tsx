"use client";

import { useRouter } from "next/navigation";
import { useManagerDashboard, PropertyStatusValues } from "@repo/data";
import { ManagerDashboardSkeleton } from "./ManagerLoadingScreen";
import { ErrorState } from "@/client/views/ErrorScreen";
import { EmptyState } from "@/client/views/EmptyScreen";
import { strings } from "@repo/tokens";
import { ChevronRight as ChevronRightIcon, Building2 as Building2Icon } from "lucide-react";
import { Button, PageTitle, MutedText, LeadText, LinkText } from "@repo/ui";
import { MonthlyRevenueSection } from "./components/MonthlyRevenueSection";
import { PaymentStatusSection } from "./components/PaymentStatusSection";
import { AttentionHero } from "./components/AttentionHero";
import { StatusSection } from "./components/StatusSection";

const s = strings.manager.dashboard;

// ── Main Dashboard ────────────────────────────────────────────────────────────
export const ManagerDashboard = () => {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useManagerDashboard();

  if (isLoading) return <ManagerDashboardSkeleton />;
  if (isError)
    return <ErrorState message={(error as Error)?.message ?? s.error} onRetry={() => refetch()} />;
  if (!data) return <EmptyState title={s.emptyTitle} description={s.emptyDescription} />;

  const { stats, statsTrend, paymentBreakdown, monthlyRevenue, properties, atRiskLeases } = data;

  const totalAtRisk = paymentBreakdown.overdueAmount + paymentBreakdown.outstandingAmount;

  return (
    <div className="p-4 md:p-8 max-w-[1180px]">
      {/* Page header */}
      <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
        <div>
          <PageTitle>{s.pageTitle}</PageTitle>
          <MutedText className="mt-1">
            {s.pageSubtitlePrefix}{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </MutedText>
        </div>
      </div>

      {/* Attention hero - only show when there's something to act on */}
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
      <StatusSection stats={stats} trend={statsTrend} />

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-4 mb-6">
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
          <LeadText className="font-medium text-espresso-900">
            {s.propertiesSummary(properties.length)}
          </LeadText>
          {properties.filter((p) => p.status === PropertyStatusValues.OVERDUE).length > 0 && (
            <MutedText className="text-destructive font-medium">
              {s.propertiesOverdueCount(
                properties.filter((p) => p.status === PropertyStatusValues.OVERDUE).length,
              )}
            </MutedText>
          )}
        </div>
        <span className="inline-flex items-center gap-1 group-hover:gap-2 transition-all">
          <LinkText>{s.viewAllProperties}</LinkText>
          <ChevronRightIcon className="h-4 w-4 text-maroon-600" />
        </span>
      </Button>
    </div>
  );
};
