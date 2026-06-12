import type { PropertySummary } from "@repo/data";
import { strings } from "@repo/tokens";
import { Pill } from "@repo/ui";
import { ChevronRight } from "lucide-react";
import type { TableCell } from "@repo/ui";

const s = strings.manager.dashboard;

const STATUS_SORT: Record<string, number> = {
  overdue: 0,
  outstanding: 1,
  allPaid: 2,
  vacant: 3,
};

export const TABLE_COLS = [
  { label: s.propertiesTable.colId, align: "left" as const },
  { label: s.propertiesTable.colName, align: "right" as const },
  { label: s.propertiesTable.colAddress, align: "right" as const },
  { label: s.propertiesTable.colUnits, align: "right" as const },
  { label: s.propertiesTable.colRent, align: "right" as const },
  { label: s.propertiesTable.colStatus, align: "right" as const, sortable: true },
  { label: "", align: "right" as const },
];

export const getTableRow = (row: PropertySummary): TableCell[] => {
  return [
    {
      content: row.id,
      className: "whitespace-nowrap px-5 py-4 text-xs font-mono text-neutral-400",
    },
    {
      content: row.name,
      className: "whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-neutral-900",
    },
    {
      content: row.address,
      className: "px-5 py-4 text-right text-sm text-neutral-500",
    },
    {
      content: (
        <>
          {row.leasedCount}/{row.unitCount}
          <span className="ml-1 text-xs text-neutral-400">{s.propertiesTable.occupiedSuffix}</span>
        </>
      ),
      className: "whitespace-nowrap px-5 py-4 text-right text-sm text-neutral-600",
    },
    {
      content: row.totalRent > 0 ? `$${row.totalRent.toLocaleString()}/mo` : "—",
      className: "whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-neutral-900",
    },
    {
      content: <Pill status={row.status} />,
      sortValue: STATUS_SORT[row.status] ?? 99,
      className: "whitespace-nowrap px-5 py-4 text-right",
    },
    {
      content: (
        <span className="inline-flex items-center gap-1 text-sm text-brand-600">
          {s.propertiesTable.viewLink} <ChevronRight className="h-3.5 w-3.5" />
        </span>
      ),
      className: "whitespace-nowrap px-5 py-4 text-right",
    },
  ];
};
