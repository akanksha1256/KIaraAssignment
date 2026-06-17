"use client";

import { usePropertyDetail } from "@repo/data";
import type { UnitDetailItem } from "@repo/data";
import { Badge } from "@repo/ui";
import { strings } from "@repo/tokens";
import { UnitRowsSkeleton } from "../PropertiesListLoadingScreen";
import { UnitActionMenu } from "./UnitActionMenu";

const spl = strings.manager.propertiesList;

export const UnitRows = ({
  propertyId,
  onNav,
  onAddLease,
}: {
  propertyId: string;
  onNav: (unitId: string) => void;
  onAddLease: (unit: UnitDetailItem) => void;
}) => {
  const { data, isLoading } = usePropertyDetail(propertyId);

  if (isLoading) return <UnitRowsSkeleton />;

  if (!data?.units.length) {
    return (
      <tr className="border-t border-sand-200 bg-sand-100/50">
        <td colSpan={6} className="px-8 py-3 text-[13px] text-muted-foreground italic">
          {spl.noUnitsFound}
        </td>
      </tr>
    );
  }

  return (
    <>
      {data.units.map((unit: UnitDetailItem) => (
        <tr
          key={unit.id}
          onClick={() => onNav(unit.id)}
          className="border-t border-sand-200 bg-sand-100/40 hover:bg-coral-50/60 cursor-pointer transition-colors"
        >
          <td />
          <td className="px-4 py-2.5">
            <span className="font-mono text-[12px] font-semibold text-espresso-700 bg-white border border-sand-400 px-2 py-0.5 rounded">
              {unit.label}
            </span>
          </td>
          <td className="px-4 py-2.5">
            {unit.tenant ? (
              <span className="text-[13px] font-medium text-maroon-600">{unit.tenant.name}</span>
            ) : (
              <span className="text-[13px] text-espresso-500 italic">{spl.vacant}</span>
            )}
          </td>
          <td className="px-4 py-2.5 text-right">
            {unit.lease ? (
              <span className="text-[13px] font-semibold tabular-nums">
                ${unit.lease.monthlyRent.toLocaleString()}
                <span className="text-muted-foreground font-normal text-[11px]">/mo</span>
              </span>
            ) : (
              <span className="text-espresso-500 text-[13px]">-</span>
            )}
          </td>
          <td className="px-4 py-2.5 text-right">
            <div className="flex justify-end">
              <Badge
                variant={
                  unit.paymentStatus === "overdue"
                    ? "overdue"
                    : unit.paymentStatus === "outstanding"
                      ? "outstanding"
                      : unit.paymentStatus === "paid"
                        ? "paid"
                        : unit.paymentStatus === "upcoming"
                          ? "upcoming"
                          : "vacant"
                }
                size="sm"
              >
                {unit.paymentStatus === "vacant"
                  ? spl.groups.vacant
                  : unit.paymentStatus === "overdue"
                    ? spl.groups.overdue
                    : unit.paymentStatus === "outstanding"
                      ? spl.groups.outstanding
                      : unit.paymentStatus === "upcoming"
                        ? spl.groups.upcoming
                        : spl.groups.paid}
              </Badge>
            </div>
          </td>
          <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
            <UnitActionMenu unit={unit} propertyId={propertyId} onAddLease={onAddLease} />
          </td>
        </tr>
      ))}
    </>
  );
};
