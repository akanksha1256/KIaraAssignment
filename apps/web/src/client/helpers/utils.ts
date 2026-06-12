import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { strings } from "@/client/designSystems/strings";
import { PropertyStatus } from "../stateManagement/property/type";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

/** "2024-06-15T00:00:00.000Z" → "15 June 2024" */
export function formatDate(isoUtc: string): string {
  return dayjs.utc(isoUtc).format("DD MMM YYYY");
}

/** "2024-06" → "June 2024" */
export function formatPeriodMonth(ym: string): string {
  return dayjs.utc(`${ym}-01`).format("MMM YYYY");
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const statusConfig: Record<
  PropertyStatus,
  { bg: string; text: string; label: string }
> = {
  paid: {
    bg: "bg-success-50",
    text: "text-success-700",
    label: strings.statusPill.paid,
  },
  outstanding: {
    bg: "bg-warning-50",
    text: "text-warning-700",
    label: strings.statusPill.outstanding,
  },
  overdue: {
    bg: "bg-danger-50",
    text: "text-danger-700",
    label: strings.statusPill.overdue,
  },
  vacant: {
    bg: "bg-neutral-100",
    text: "text-neutral-500",
    label: strings.statusPill.vacant,
  },
};
