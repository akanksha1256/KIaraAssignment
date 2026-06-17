import {
  Building2 as Building2Icon,
  DoorOpen as DoorOpenIcon,
  DollarSign as DollarSignIcon,
  TrendingUp as TrendingUpIcon,
} from "lucide-react";
import { strings } from "@repo/tokens";
import { StatCard } from "@repo/ui";
import type { DashboardStats } from "@repo/data";

const s = strings.manager.dashboard;

export const StatusSection = ({ stats }: { stats: DashboardStats }) => {
  const collectionRate =
    stats.totalMonthlyRent > 0
      ? Math.round((stats.collectedThisMonth / stats.totalMonthlyRent) * 100)
      : 0;

  return (
    <section aria-label="Portfolio metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
  );
};
