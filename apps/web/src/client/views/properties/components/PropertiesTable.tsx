"use client";

import type { PropertySummary, UnitDetailItem } from "@repo/data";
import { Overline } from "@repo/ui";
import { strings } from "@repo/tokens";
import { GroupHeaderRow } from "./GroupHeaderRow";
import { PropertyRow } from "./PropertyRow";

const spl = strings.manager.propertiesList;

const GROUPS = [
  { key: "overdue", label: spl.groups.overdue, urgency: "overdue" },
  { key: "outstanding", label: spl.groups.outstanding, urgency: "outstanding" },
  { key: "paid", label: spl.groups.paid, urgency: "paid" },
  { key: "vacant", label: spl.groups.vacant, urgency: "vacant" },
] as const;

export const PropertiesTable = ({
  grouped,
  expanded,
  onToggle,
  onUnitNav,
  onAddLease,
}: {
  grouped: Record<string, PropertySummary[]>;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onUnitNav: (propertyId: string, unitId: string) => void;
  onAddLease: (unit: UnitDetailItem, propertyId: string) => void;
}) => (
  <div className="rounded-xl border border-sand-400 bg-white overflow-x-auto shadow-sm">
    <table className="w-full table-fixed min-w-[700px]">
      <colgroup>
        <col style={{ width: "32px" }} />
        <col style={{ width: "33%" }} />
        <col style={{ width: "16%" }} />
        <col style={{ width: "14%" }} />
        <col style={{ width: "29%" }} />
        <col style={{ width: "48px" }} />
      </colgroup>
      <thead>
        <tr className="bg-sand-100 border-b border-sand-400">
          <th />
          <th className="px-4 py-3 text-left"><Overline>{spl.cols.property}</Overline></th>
          <th className="px-4 py-3 text-left"><Overline>{spl.cols.units}</Overline></th>
          <th className="px-4 py-3 text-right"><Overline>{spl.cols.rentPerMonth}</Overline></th>
          <th className="px-4 py-3 text-right"><Overline>{spl.cols.status}</Overline></th>
          <th />
        </tr>
      </thead>
      <tbody>
        {GROUPS.filter((g) => grouped[g.key]?.length > 0).map((g) => (
          <>
            <GroupHeaderRow
              key={`group-${g.key}`}
              label={g.label}
              count={grouped[g.key].length}
              urgency={g.urgency}
            />
            {grouped[g.key].map((p) => (
              <PropertyRow
                key={p.id}
                property={p}
                expanded={expanded.has(p.id)}
                onToggle={() => onToggle(p.id)}
                onUnitNav={(unitId) => onUnitNav(p.id, unitId)}
                onAddLease={(unit) => onAddLease(unit, p.id)}
              />
            ))}
          </>
        ))}
      </tbody>
    </table>
  </div>
);
