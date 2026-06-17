"use client";

import { ChevronRight, ChevronDown } from "lucide-react";
import type { PropertySummary, UnitDetailItem } from "@repo/data";
import { strings } from "@repo/tokens";
import { StatusMixBar } from "./StatusMixBar";
import { UnitRows } from "./UnitRows";

const spl = strings.manager.propertiesList;

export const PropertyRow = ({
  property,
  expanded,
  onToggle,
  onUnitNav,
  onAddLease,
}: {
  property: PropertySummary;
  expanded: boolean;
  onToggle: () => void;
  onUnitNav: (unitId: string) => void;
  onAddLease: (unit: UnitDetailItem) => void;
}) => {
  const isUrgent = property.status === "overdue";

  return (
    <>
      <tr
        className={[
          "border-t border-sand-200 cursor-pointer transition-colors group",
          isUrgent
            ? "border-l-[3px] border-l-destructive hover:bg-coral-50"
            : "hover:bg-coral-50/40",
        ].join(" ")}
        onClick={onToggle}
      >
        <td />
        <td className="px-4 py-4">
          <div className="font-semibold text-espresso-900 text-[14px]">{property.name}</div>
          <div className="text-[12.5px] text-muted-foreground mt-0.5">{property.address}</div>
        </td>
        <td className="px-4 py-4">
          <span className="text-[14px]">
            <span className="font-semibold">
              {property.leasedCount}/{property.unitCount}
            </span>
            <span className="text-muted-foreground text-[12.5px] ml-1">{spl.occupied}</span>
          </span>
        </td>
        <td className="px-4 py-4 text-right">
          {property.totalRent > 0 ? (
            <span className="font-semibold tabular-nums text-[14px]">
              ${property.totalRent.toLocaleString()}
              <span className="text-muted-foreground font-normal text-[12px]">/mo</span>
            </span>
          ) : (
            <span className="text-espresso-500">-</span>
          )}
        </td>
        <td className="px-4 py-4 text-right">
          <StatusMixBar property={property} />
        </td>
        <td className="px-4 py-4 text-right">
          <div className="flex justify-end">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground group-hover:bg-sand-200 transition-colors">
              {expanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </div>
          </div>
        </td>
      </tr>

      {expanded && (
        <UnitRows
          propertyId={property.id}
          onNav={(unitId) => onUnitNav(unitId)}
          onAddLease={onAddLease}
        />
      )}
    </>
  );
};
