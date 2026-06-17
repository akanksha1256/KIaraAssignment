"use client";

import {
  ChevronUp as ChevronUpIcon,
  ChevronDown as ChevronDownIcon,
  ChevronsUpDown as ChevronsUpDownIcon,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import type { PropertiesTableProps, SortDir, UnitDetailItem, PropertySummary } from "@repo/data";
import { usePropertyDetail } from "@repo/data";
import { Badge, Overline } from "@repo/ui";
import { strings } from "@repo/tokens";
import { PropertyRow } from "./PropertyRow";
import { StatusMixBar } from "./StatusMixBar";

const spl = strings.manager.propertiesList;

const SortIcon = ({ active, dir }: { active: boolean; dir: SortDir }) => {
  if (!active) return <ChevronsUpDownIcon className="h-3 w-3 opacity-40" />;
  return dir === "asc" ? (
    <ChevronUpIcon className="h-3 w-3" />
  ) : (
    <ChevronDownIcon className="h-3 w-3" />
  );
};

// ── Mobile card components ────────────────────────────────────────────────────

const PropertyCardUnits = ({
  propertyId,
  onNav,
  onAddLease,
}: {
  propertyId: string;
  onNav: (unitId: string) => void;
  onAddLease: (unit: UnitDetailItem) => void;
}) => {
  const { data, isLoading } = usePropertyDetail(propertyId);

  if (isLoading) return (
    <div className="border-t border-sand-200 px-4 py-3 text-[12.5px] text-muted-foreground">
      Loading units…
    </div>
  );
  if (!data?.units.length) return (
    <div className="border-t border-sand-200 px-4 py-3 text-[12.5px] text-muted-foreground italic">
      {spl.noUnitsFound}
    </div>
  );

  const badgeVariant = (status: string) =>
    status === "overdue" ? "overdue"
    : status === "outstanding" ? "outstanding"
    : status === "paid" ? "paid"
    : status === "upcoming" ? "upcoming"
    : "vacant" as const;

  const badgeLabel = (status: string) =>
    status === "vacant" ? spl.groups.vacant
    : status === "overdue" ? spl.groups.overdue
    : status === "outstanding" ? spl.groups.outstanding
    : status === "upcoming" ? spl.groups.upcoming
    : spl.groups.paid;

  return (
    <div className="border-t border-sand-200">
      {data.units.map((unit: UnitDetailItem) => (
        <div
          key={unit.id}
          onClick={(e) => { e.stopPropagation(); onNav(unit.id); }}
          className="flex items-center gap-3 px-4 py-2.5 border-b border-sand-100 last:border-0 bg-sand-100/40 cursor-pointer active:bg-coral-50/60 transition-colors"
        >
          <span className="font-mono text-[12px] font-semibold text-espresso-700 bg-white border border-sand-400 px-2 py-0.5 rounded flex-none">
            {unit.label}
          </span>
          <span className="flex-1 text-[13px] text-espresso-900 min-w-0 truncate">
            {unit.tenant?.name ?? <span className="italic text-espresso-500">{spl.vacant}</span>}
          </span>
          {unit.lease && (
            <span className="text-[12.5px] font-semibold tabular-nums text-espresso-900 shrink-0">
              ${unit.lease.monthlyRent.toLocaleString()}
            </span>
          )}
          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            <Badge variant={badgeVariant(unit.paymentStatus)} size="sm">
              {badgeLabel(unit.paymentStatus)}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
};

const PropertyCardItem = ({
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
    <div className={`border-b border-sand-200 last:border-0 ${isUrgent ? "border-l-[3px] border-l-destructive" : ""}`}>
      <div
        onClick={onToggle}
        className={`px-4 py-4 cursor-pointer transition-colors ${isUrgent ? "active:bg-coral-50" : "active:bg-coral-50/40"}`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold text-espresso-900 truncate">{property.name}</div>
            <div className="text-[12.5px] text-muted-foreground truncate">{property.address}</div>
          </div>
          <StatusMixBar property={property} />
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] text-espresso-700">
            <span className="font-semibold">{property.leasedCount}/{property.unitCount}</span>
            <span className="text-muted-foreground text-[12px] ml-1">{spl.occupied}</span>
          </span>
          <div className="flex items-center gap-2">
            {property.totalRent > 0 && (
              <span className="text-[13px] font-semibold tabular-nums">
                ${property.totalRent.toLocaleString()}/mo
              </span>
            )}
            {expanded
              ? <ChevronDownIcon className="h-3.5 w-3.5 text-muted-foreground flex-none" />
              : <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground flex-none" />}
          </div>
        </div>
      </div>
      {expanded && (
        <PropertyCardUnits
          propertyId={property.id}
          onNav={onUnitNav}
          onAddLease={onAddLease}
        />
      )}
    </div>
  );
};

// ── Main export ───────────────────────────────────────────────────────────────

export const PropertiesTable = ({
  properties,
  expanded,
  onToggle,
  onUnitNav,
  onAddLease,
  sortCol,
  sortDir,
  onSort,
  canSortStatus,
}: PropertiesTableProps) => (
  <>
    {/* Mobile: card view */}
    <div className="sm:hidden rounded-xl border border-sand-400 bg-white shadow-sm overflow-hidden">
      {properties.map((p) => (
        <PropertyCardItem
          key={p.id}
          property={p}
          expanded={expanded.has(p.id)}
          onToggle={() => onToggle(p.id)}
          onUnitNav={(unitId) => onUnitNav(p.id, unitId)}
          onAddLease={(unit) => onAddLease(unit, p.id)}
        />
      ))}
    </div>

    {/* Desktop: table view */}
    <div className="hidden sm:block h-full rounded-xl border border-sand-400 bg-white overflow-y-auto shadow-sm">
      <table className="w-full table-fixed min-w-[700px]">
        <colgroup>
          <col style={{ width: "32px" }} />
          <col style={{ width: "33%" }} />
          <col style={{ width: "16%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "29%" }} />
          <col style={{ width: "48px" }} />
        </colgroup>
        <thead className="sticky top-0 z-10">
          <tr className="bg-sand-100 border-b border-sand-400">
            <th />
            <th className="px-4 py-3 text-left">
              <Overline>{spl.cols.property}</Overline>
            </th>
            <th className="px-4 py-3 text-left">
              <Overline>{spl.cols.units}</Overline>
            </th>
            <th
              className="px-4 py-3 text-right cursor-pointer select-none transition-colors"
              onClick={() => onSort("rent")}
            >
              <Overline
                className={`inline-flex items-center justify-end gap-1 w-full ${
                  sortCol === "rent" ? "text-espresso-900" : "hover:text-espresso-700"
                }`}
              >
                {spl.cols.rentPerMonth}
                <SortIcon active={sortCol === "rent"} dir={sortDir} />
              </Overline>
            </th>
            <th
              className={`px-4 py-3 text-right ${canSortStatus ? "cursor-pointer select-none transition-colors" : ""}`}
              onClick={canSortStatus ? () => onSort("status") : undefined}
            >
              <Overline
                className={`inline-flex items-center justify-end gap-1 w-full ${
                  canSortStatus && sortCol === "status"
                    ? "text-espresso-900"
                    : canSortStatus
                      ? "hover:text-espresso-700"
                      : ""
                }`}
              >
                {spl.cols.status}
                {canSortStatus && <SortIcon active={sortCol === "status"} dir={sortDir} />}
              </Overline>
            </th>
            <th />
          </tr>
        </thead>
        <tbody>
          {properties.map((p) => (
            <PropertyRow
              key={p.id}
              property={p}
              expanded={expanded.has(p.id)}
              onToggle={() => onToggle(p.id)}
              onUnitNav={(unitId) => onUnitNav(p.id, unitId)}
              onAddLease={(unit) => onAddLease(unit, p.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  </>
);
