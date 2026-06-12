"use client";

import { PieChart, Pie, Cell } from "recharts";
import { colors } from "@repo/tokens";
import type { Tenant, TenantStanding } from "@repo/data";

const scoreColor = (score: number) =>
  score >= 90
    ? colors.chart.paid
    : score >= 70
      ? colors.chart.collected
      : score >= 50
        ? colors.chart.outstanding
        : colors.chart.overdue;

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

interface Props {
  tenant: Tenant;
  standing: TenantStanding | null;
}

export const TenantHeader = ({ tenant, standing }: Props) => (
  <div className="flex items-center gap-6">
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 text-lg font-bold">
      {initials(tenant.name)}
    </div>

    <div className="flex-1">
      <h1 className="text-2xl font-bold text-neutral-900">{tenant.name}</h1>
      <p className="mt-0.5 text-sm text-neutral-500">{tenant.contact}</p>
    </div>

    {standing && (
      <div className="relative flex items-center justify-center">
        <PieChart width={110} height={110}>
          <Pie
            data={[{ value: standing.score }, { value: 100 - standing.score }]}
            cx={50}
            cy={50}
            innerRadius={34}
            outerRadius={48}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            strokeWidth={0}
          >
            <Cell fill={scoreColor(standing.score)} />
            <Cell fill="#e5e7eb" />
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-sm font-bold text-neutral-900">{standing.label}</span>
          <span className="text-xs text-neutral-400">{standing.score}/100</span>
        </div>
      </div>
    )}
  </div>
);
