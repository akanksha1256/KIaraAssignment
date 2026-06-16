import { StatCard } from "@repo/ui";
import { strings } from "@repo/tokens";
import { Building2, DoorOpen, DoorClosed, DollarSign } from "lucide-react";

const s = strings.manager.propertyDetail;

interface Props {
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  totalRent: number;
}

export function StatusSection({ totalUnits, occupiedUnits, vacantUnits, totalRent }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        icon={Building2}
        label={s.stats.totalUnits}
        value={String(totalUnits)}
        sub={s.stats.occupancySub(occupiedUnits, totalUnits)}
        accent="neutral"
      />
      <StatCard
        icon={DoorOpen}
        label={s.stats.occupied}
        value={String(occupiedUnits)}
        sub={s.stats.occupancySub(occupiedUnits, totalUnits)}
        accent="neutral"
      />
      <StatCard
        icon={DoorClosed}
        label={s.stats.vacant}
        value={String(vacantUnits)}
        sub={s.stats.vacantSub(vacantUnits)}
        accent={vacantUnits > 0 ? "warning" : "teal"}
      />
      <StatCard
        icon={DollarSign}
        label={s.stats.monthlyRent}
        value={`$${totalRent.toLocaleString()}`}
        sub={s.stats.rentSub}
        accent="teal"
      />
    </div>
  );
}
