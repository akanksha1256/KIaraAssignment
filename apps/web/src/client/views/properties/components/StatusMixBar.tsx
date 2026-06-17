"use client";

import type { PropertySummary } from "@repo/data";
import { Badge } from "@repo/ui";
import { strings } from "@repo/tokens";

const spl = strings.manager.propertiesList;

export const StatusMixBar = ({ property }: { property: PropertySummary }) => {
  const total = property.unitCount || 1;
  const vacant = property.unitCount - property.leasedCount;
  const overdueW = property.status === "overdue" ? Math.max(20, Math.round((1 / total) * 100)) : 0;
  const outstandW =
    property.status === "outstanding" ? Math.max(20, Math.round((1 / total) * 100)) : 0;
  const vacantW = Math.round((vacant / total) * 100);
  const paidW = Math.max(0, 100 - overdueW - outstandW - vacantW);
  const statusLabel =
    property.status === "overdue"
      ? `${overdueW > 0 ? 1 : 0}/${total} ${spl.groups.overdue.toLowerCase()}`
      : property.status === "outstanding"
        ? `${outstandW > 0 ? 1 : 0}/${total} ${spl.groups.outstanding.toLowerCase()}`
        : property.status === "upcoming"
          ? spl.groups.upcoming
          : property.leasedCount === 0
            ? "No active leases"
            : `${total}/${total} ${spl.groups.paid.toLowerCase()}`;

  return (
    <div className="flex flex-col gap-1.5 items-end">
      <Badge
        variant={
          property.status === "overdue"
            ? "overdue"
            : property.status === "outstanding"
              ? "outstanding"
              : property.status === "paid"
                ? "paid"
                : property.status === "upcoming"
                  ? "upcoming"
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
};
