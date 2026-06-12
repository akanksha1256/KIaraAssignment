import type { ElementType } from "react";

export type AccentType = "brand" | "success" | "warning" | "danger";

export interface StatCardProps {
  icon: ElementType;
  label: string;
  value: string;
  sub?: string;
  accent: AccentType;
}

export const accentMap: Record<AccentType, { bg: string; text: string }> = {
  brand:   { bg: "bg-brand-50",   text: "text-brand-600" },
  success: { bg: "bg-success-50", text: "text-success-700" },
  warning: { bg: "bg-warning-50", text: "text-warning-700" },
  danger:  { bg: "bg-danger-50",  text: "text-danger-700" },
};
