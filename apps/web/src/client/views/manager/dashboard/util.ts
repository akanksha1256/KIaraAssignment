import type { PropertySummary } from "@/client/stateManagement/property/type";
import { strings } from "@/client/designSystems/strings";
import type { StatCardProps } from "./type";
import { TableColumn } from "@/client/commonComponents/DataTable";

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

export const TABLE_COLS: TableColumn[] = [
  { label: s.propertiesTable.colId, align: "left" },
  { label: s.propertiesTable.colName, align: "left" },
  { label: s.propertiesTable.colAddress, align: "left" },
  { label: s.propertiesTable.colUnits, align: "right" },
  { label: s.propertiesTable.colRent, align: "right" },
  { label: s.propertiesTable.colStatus, align: "left" },
  { label: "", align: "right" },
];

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
