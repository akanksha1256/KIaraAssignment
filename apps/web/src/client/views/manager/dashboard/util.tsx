import type { PropertySummary } from "@/client/stateManagement/property/type";
import { strings } from "@/client/designSystems/strings";
import type { StatCardProps } from "./type";
import { Pill } from "../../../commonComponents/Pill";
import { ChevronRight } from "lucide-react";
import type { TableCell } from "@/client/commonComponents/DataTable";

const s = strings.manager.dashboard;

export const accentMap: Record<
  StatCardProps["accent"],
  { bg: string; text: string }
> = {
  brand: { bg: "bg-brand-50", text: "text-brand-600" },
  success: { bg: "bg-success-50", text: "text-success-700" },
  warning: { bg: "bg-warning-50", text: "text-warning-700" },
  danger: { bg: "bg-danger-50", text: "text-danger-700" },
};

export const statusConfig: Record<
  PropertySummary["status"],
  { bg: string; text: string; label: string }
> = {
  paid: {
    bg: "bg-success-50",
    text: "text-success-700",
    label: s.statusPill.paid,
  },
  outstanding: {
    bg: "bg-warning-50",
    text: "text-warning-700",
    label: s.statusPill.outstanding,
  },
  overdue: {
    bg: "bg-danger-50",
    text: "text-danger-700",
    label: s.statusPill.overdue,
  },
  vacant: {
    bg: "bg-neutral-100",
    text: "text-neutral-500",
    label: s.statusPill.vacant,
  },
};

export const TABLE_COLS = [
  { label: s.propertiesTable.colId, align: "left" as const },
  { label: s.propertiesTable.colName, align: "left" as const },
  { label: s.propertiesTable.colAddress, align: "left" as const },
  { label: s.propertiesTable.colUnits, align: "right" as const },
  { label: s.propertiesTable.colRent, align: "right" as const },
  { label: s.propertiesTable.colStatus, align: "left" as const },
  { label: "", align: "right" as const },
];

export const getTableRow = (row: PropertySummary): TableCell[] => {
    return [
      {
        content: row.id,
        className:
          "whitespace-nowrap px-5 py-4 text-xs font-mono text-neutral-400",
      },
      {
        content: row.name,
        className:
          "whitespace-nowrap px-5 py-4 text-sm font-semibold text-neutral-900",
      },
      { content: row.address, className: "px-5 py-4 text-sm text-neutral-500" },
      {
        content: (
          <>
            {row.leasedCount}/{row.unitCount}
            <span className="ml-1 text-xs text-neutral-400">
              {s.propertiesTable.occupiedSuffix}
            </span>
          </>
        ),
        className:
          "whitespace-nowrap px-5 py-4 text-right text-sm text-neutral-600",
      },
      {
        content:
          row.totalRent > 0 ? `$${row.totalRent.toLocaleString()}/mo` : "—",
        className:
          "whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-neutral-900",
      },
      {
        content: <Pill status={row.status} />,
        className: "whitespace-nowrap px-5 py-4",
      },
      {
        content: (
          <span className="inline-flex items-center gap-1 text-sm text-brand-600">
            {s.propertiesTable.viewLink}{" "}
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        ),
        className: "whitespace-nowrap px-5 py-4 text-right",
      },
    ];
  };
