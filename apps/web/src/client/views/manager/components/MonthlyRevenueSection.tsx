"use client";

import { strings, colors } from "@repo/tokens";
import type { MonthlyRevenue } from "@repo/data";
import { BarChartCard } from "@/client/components/BarChartCard";

const s = strings.manager.dashboard.revenueChart;

export const MonthlyRevenueSection = ({ monthlyRevenue }: { monthlyRevenue: MonthlyRevenue[] }) => {
  const barsData = [
    { dataKey: "expected", name: s.barExpected, fill: colors.chart.expected },
    { dataKey: "collected", name: s.barCollected, fill: colors.chart.collected },
  ];
  return (
    <BarChartCard
      data={monthlyRevenue}
      bars={barsData}
      yAxisFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
      title={s.title}
      subtitle={s.subtitle}
      emptyMessage={s.empty}
    />
  );
};
