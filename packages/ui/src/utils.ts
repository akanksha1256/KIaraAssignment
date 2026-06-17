import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { strings } from "@repo/tokens";
import type { PropertyStatus } from "@repo/data";

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

/** "2024-06-15T10:30:00.000Z" → "15 Jun 2024, 10:30 AM" (local time) */
export function formatDateTime(isoUtc: string): string {
  return dayjs.utc(isoUtc).local().format("D MMM YYYY, h:mm A");
}

/** Returns the number of hours elapsed since the given UTC ISO string */
export function hoursSince(isoUtc: string): number {
  return dayjs.utc().diff(dayjs.utc(isoUtc), "hour");
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const statusConfig: Record<PropertyStatus, { bg: string; text: string; label: string }> = {
  paid: {
    bg: "bg-success-bg",
    text: "text-success",
    label: strings.statusPill.paid,
  },
  outstanding: {
    bg: "bg-warning-bg",
    text: "text-warning",
    label: strings.statusPill.outstanding,
  },
  overdue: {
    bg: "bg-destructive-bg",
    text: "text-destructive",
    label: strings.statusPill.overdue,
  },
  vacant: {
    bg: "bg-sand-200",
    text: "text-espresso-700",
    label: strings.statusPill.vacant,
  },
  upcoming: {
    bg: "bg-sky-100",
    text: "text-sky-700",
    label: strings.statusPill.upcoming,
  },
};
