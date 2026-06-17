"use client";

import {
  ChevronUp as ChevronUpIcon,
  ChevronDown as ChevronDownIcon,
  ChevronsUpDown as ChevronsUpDownIcon,
} from "lucide-react";
import type { PropertiesTableProps, SortDir } from "@repo/data";
import { Overline } from "@repo/ui";
import { strings } from "@repo/tokens";
import { PropertyRow } from "./PropertyRow";

const spl = strings.manager.propertiesList;

const SortIcon = ({ active, dir }: { active: boolean; dir: SortDir }) => {
  if (!active) return <ChevronsUpDownIcon className="h-3 w-3 opacity-40" />;
  return dir === "asc" ? (
    <ChevronUpIcon className="h-3 w-3" />
  ) : (
    <ChevronDownIcon className="h-3 w-3" />
  );
};

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
  <div className="h-full rounded-xl border border-sand-400 bg-white overflow-y-auto shadow-sm">
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
);
