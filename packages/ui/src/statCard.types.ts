import type { ElementType } from "react";

export type AccentType = "coral" | "teal" | "warning" | "destructive" | "neutral";

export interface StatCardProps {
  icon: ElementType;
  label: string;
  value: string;
  sub?: string;
  accent?: AccentType;
  trend?: { direction: "up" | "down" | "flat"; label: string };
  alert?: boolean;
  progress?: number; // 0-100
}

export const accentMap: Record<AccentType, { bg: string; text: string }> = {
  coral:       { bg: "bg-coral-50",        text: "text-coral-600" },
  teal:        { bg: "bg-teal-100",        text: "text-teal-700" },
  warning:     { bg: "bg-warning-bg",      text: "text-warning" },
  destructive: { bg: "bg-destructive-bg",  text: "text-destructive" },
  neutral:     { bg: "bg-sand-100",        text: "text-maroon-600" },
};
