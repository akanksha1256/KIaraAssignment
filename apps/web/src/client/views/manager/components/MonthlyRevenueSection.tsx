"use client";

import { useState } from "react";
import { strings, colors } from "@repo/tokens";
import type { MonthlyRevenue } from "@repo/data";
import { BarChartCard } from "@/client/components/BarChartCard";
import { Select } from "@repo/ui";
import type { SelectOption } from "@repo/ui";

const s = strings.manager.dashboard.revenueChart;

const PERIOD_OPTIONS: SelectOption[] = [
  { value: "3", label: s.periodOptions.months3 },
  { value: "6", label: s.periodOptions.months6 },
  { value: "12", label: s.periodOptions.months12 },
];

export const MonthlyRevenueSection = ({ monthlyRevenue }: { monthlyRevenue: MonthlyRevenue[] }) => {
  const [months, setMonths] = useState("6");

  const filtered = monthlyRevenue.slice(-Number(months));

  const barsData = [
    { dataKey: "expected", name: s.barExpected, fill: colors.chart.expected },
    { dataKey: "collected", name: s.barCollected, fill: colors.chart.collected },
  ];

  return (
    <BarChartCard
      data={filtered}
      bars={barsData}
      yAxisFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
      title={s.title}
      subtitle={s.subtitle(Number(months))}
      emptyMessage={s.empty}
      headerRight={
        <Select
          value={months}
          onChange={setMonths}
          options={PERIOD_OPTIONS}
          className="!w-fit min-w-32"
        />
      }
    />
  );
};
