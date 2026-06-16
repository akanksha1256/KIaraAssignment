"use client";

import { Card, CardContent } from "./Card";
import type { StatCardProps } from "./statCard.types";
import { accentMap } from "./statCard.types";

function TrendPill({ direction, label }: { direction: "up" | "down" | "flat"; label: string }) {
  const cls =
    direction === "up"
      ? "text-teal-700 bg-teal-100"
      : direction === "down"
      ? "text-destructive bg-destructive-bg"
      : "text-muted-foreground bg-sand-100";
  const arrow = direction === "up" ? "▲" : direction === "down" ? "▼" : "—";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold ${cls}`}>
      {arrow} {label}
    </span>
  );
}

export const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  accent = "neutral",
  trend,
  alert,
  progress,
}: StatCardProps) => {
  const { bg, text } = accentMap[accent];
  return (
    <Card className={alert ? "border-destructive bg-gradient-to-b from-white to-destructive-bg" : ""}>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between gap-2">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${alert ? "bg-white text-destructive" : `${bg} ${text}`}`}>
            <Icon className="h-[18px] w-[18px]" />
          </div>
          {trend && <TrendPill direction={trend.direction} label={trend.label} />}
        </div>
        <div className="mt-4">
          <p className={`text-[28px] font-semibold leading-none tracking-tight ${alert ? "text-destructive" : "text-espresso-900"}`}>
            {value}
          </p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{label}</p>
          {sub && <p className="mt-0.5 text-[12px] text-muted-foreground">{sub}</p>}
        </div>
        {progress !== undefined && (
          <div className="mt-3 h-1.5 rounded-full bg-sand-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-destructive transition-all duration-slow"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
