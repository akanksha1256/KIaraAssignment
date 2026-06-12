import { Building2, DoorOpen, DollarSign, TrendingUp } from "lucide-react";
import { strings } from "@repo/tokens";
import { StatCard } from "@repo/ui";
import type { DashboardStats } from "@repo/data";

const s = strings.manager.dashboard;

export function StatusSection({ stats }: { stats: DashboardStats }) {
  const collectionRate =
    stats.totalMonthlyRent > 0
      ? Math.round((stats.collectedThisMonth / stats.totalMonthlyRent) * 100)
      : 0;

  return (
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
  );
}
