import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { strings } from "@/client/designSystems/strings";
import { PropertyStatus } from "../stateManagement/property/type";

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
