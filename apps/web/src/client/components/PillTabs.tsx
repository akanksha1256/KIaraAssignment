"use client";

import { Button, cn } from "@repo/ui";

export type TabColorScheme = "default" | "overdue" | "outstanding" | "paid" | "vacant";

export interface PillTab<K extends string = string> {
  key: K;
  label: string;
  count?: number;
  color?: TabColorScheme;
}

const COLOR_CONFIG: Record<TabColorScheme, { active: string; inactive: string }> = {
  default: {
    active: "bg-espresso-900 border-espresso-900 text-white hover:bg-espresso-800",
    inactive: "border-espresso-300 text-espresso-600 hover:border-espresso-600 hover:text-espresso-900",
  },
  overdue: {
    active: "bg-destructive border-destructive text-white hover:bg-red-700",
    inactive: "border-destructive/50 text-destructive hover:border-destructive hover:bg-destructive/5",
  },
  outstanding: {
    active: "bg-warning border-warning text-espresso-900",
    inactive: "border-warning/60 text-warning hover:border-warning hover:bg-warning/5",
  },
  paid: {
    active: "bg-teal-600 border-teal-600 text-white hover:bg-teal-700",
    inactive: "border-teal-300 text-teal-700 hover:border-teal-600 hover:bg-teal-50",
  },
  vacant: {
    active: "bg-espresso-500 border-espresso-500 text-white hover:bg-espresso-700",
    inactive: "border-espresso-200 text-espresso-500 hover:border-espresso-500 hover:bg-sand-100",
  },
};

interface PillTabsProps<K extends string> {
  tabs: PillTab<K>[];
  activeTab: K;
  onChange: (key: K) => void;
  className?: string;
}

export const PillTabs = <K extends string>({
  tabs,
  activeTab,
  onChange,
  className,
}: PillTabsProps<K>) => (
  <div className={cn("flex items-center gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden", className)}>
    {tabs.map(({ key, label, count, color = "default" }) => {
      const isActive = activeTab === key;
      const styles = COLOR_CONFIG[color];
      return (
        <Button
          key={key}
          variant="outline"
          size="sm"
          onClick={() => onChange(key)}
          className={cn(
            "gap-1.5 text-[12.5px] font-semibold px-3 flex-none",
            isActive ? styles.active : styles.inactive,
          )}
        >
          {label}
          {count !== undefined && count > 0 && (
            <span
              className={cn(
                "text-[11px] font-bold rounded-full px-1.5 py-0.5 leading-none",
                isActive ? "bg-white/25" : "bg-current/10",
              )}
            >
              {count}
            </span>
          )}
        </Button>
      );
    })}
  </div>
);
