import {
  Building2 as Building2Icon,
  DoorOpen as DoorOpenIcon,
  DollarSign as DollarSignIcon,
  TrendingUp as TrendingUpIcon,
} from "lucide-react";
import { strings } from "@repo/tokens";
import { StatCard } from "@repo/ui";
import type { DashboardStats, StatsTrend, MonthlyRevenue } from "@repo/data";

const s = strings.manager.dashboard;

const fmtK = (n: number): string =>
  n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n.toLocaleString()}`;

const formatRentChange = (amount: number): string => {
  if (amount >= 1000) return `+$${(amount / 1000).toFixed(1)}K`;
  return `+$${amount.toLocaleString()}`;
};

export const StatusSection = ({
  stats,
  trend,
  monthlyRevenue,
}: {
  stats: DashboardStats;
  trend: StatsTrend;
  monthlyRevenue: MonthlyRevenue[];
}) => {
  const collectionRate =
    stats.totalMonthlyRent > 0
      ? Math.round((stats.collectedThisMonth / stats.totalMonthlyRent) * 100)
      : 0;

  const collectionDelta = collectionRate - trend.prevCollectionRate;
  const collectionTrendLabel =
    collectionDelta === 0
      ? `${collectionRate}%`
      : collectionDelta > 0
        ? `+${collectionDelta}%`
        : `${collectionDelta}%`;
  const collectionTrendDir =
    collectionDelta > 0 ? "up" : collectionDelta < 0 ? "down" : "flat";

  const collectedSparkline = monthlyRevenue.map((m) =>
    m.expected > 0 ? Math.round((m.collected / m.expected) * 100) : 0,
  );
  const revenueSparkline = monthlyRevenue.map((m) => m.collected);

  return (
    <section aria-label="Portfolio metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        icon={Building2Icon}
        label={s.stats.propertiesLabel(stats.totalUnits)}
        value={String(stats.totalProperties)}
        accent="neutral"
        trend={
          trend.newLeasesThisMonth > 0
            ? { direction: "up", label: `+${trend.newLeasesThisMonth} leases` }
            : { direction: "flat", label: "0 new" }
        }
      />
      <StatCard
        icon={DoorOpenIcon}
        label={s.stats.occupancyLabel(stats.vacantUnits)}
        value={`${stats.occupiedUnits}/${stats.totalUnits}`}
        accent="neutral"
        trend={
          trend.newLeasesThisMonth > 0
            ? { direction: "up", label: `+${trend.newLeasesThisMonth}` }
            : { direction: "flat", label: "0" }
        }
      />
      <StatCard
        icon={DollarSignIcon}
        label={s.stats.monthlyRentLabel}
        value={`$${stats.totalMonthlyRent.toLocaleString()}`}
        accent="neutral"
        trend={
          trend.rentAddedThisMonth > 0
            ? { direction: "up", label: formatRentChange(trend.rentAddedThisMonth) }
            : { direction: "flat", label: "0" }
        }
        sparkline={revenueSparkline}
      />
      <StatCard
        icon={TrendingUpIcon}
        label={s.stats.collectionRateLabel}
        value={`${collectionRate}%`}
        sub={s.stats.collectionRateSubtitle(
          fmtK(stats.collectedThisMonth),
          fmtK(stats.totalMonthlyRent),
        )}
        accent={collectionRate >= 80 ? "teal" : "warning"}
        trend={{ direction: collectionTrendDir, label: collectionTrendLabel }}
        alert={collectionRate < 60}
        sparkline={collectedSparkline}
      />
    </section>
  );
};
