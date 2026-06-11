import type { ElementType } from "react";

export type AccentType = "brand" | "success" | "warning" | "danger";

export interface StatCardProps {
  icon: ElementType;
  label: string;
  value: string;
  sub?: string;
  accent: AccentType;
}
