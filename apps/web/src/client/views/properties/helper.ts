import { strings } from "../../../../../../packages/tokens/src/strings";
import type { PaymentStatus } from "@repo/data";

export const getUnitStatusVariant = (
  status: PaymentStatus | "vacant" | "upcoming",
): "overdue" | "outstanding" | "paid" | "vacant" | "upcoming" =>
  status === "overdue"
    ? "overdue"
    : status === "outstanding"
      ? "outstanding"
      : status === "vacant"
        ? "vacant"
        : status === "upcoming"
          ? "upcoming"
          : "paid";

export const getUnitStatusLabel = (status: PaymentStatus | "vacant" | "upcoming"): string => {
  const sp = strings.statusPill;
  return status === "overdue"
    ? sp.overdue
    : status === "outstanding"
      ? sp.outstanding
      : status === "vacant"
        ? sp.vacant
        : status === "upcoming"
          ? sp.upcoming
          : sp.paid;
};

export interface DetailRowProps {
  label: string;
  value: string;
}

export interface UnitDetailProps {
  propertyId: string;
  unitId: string;
}

const s = strings.manager.propertyDetail;
export const PROPERTY_TABLE_COLS = [
  { label: s.unitsTable.colUnit },
  { label: s.unitsTable.colTenant },
  { label: s.unitsTable.colRent, align: "right" as const },
  { label: s.unitsTable.colLease, align: "right" as const },
  { label: s.unitsTable.colStatus },
  { label: "", align: "right" as const },
];
