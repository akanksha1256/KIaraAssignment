"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui";
import { EmptyState } from "@/client/views/EmptyScreen";
import { CommonTooltip } from "@repo/ui";
import { strings } from "@repo/tokens";
import { colors } from "@repo/tokens";
import type { MonthlyRevenue } from "@repo/data";

const s = strings.manager.dashboard;

export function MonthlyRevenueSection({ monthlyRevenue }: { monthlyRevenue: MonthlyRevenue[] }) {
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>{s.revenueChart.title}</CardTitle>
        <p className="text-xs text-neutral-400">{s.revenueChart.subtitle}</p>
      </CardHeader>
      <CardContent>
        {monthlyRevenue.length === 0 ? (
          <EmptyState title={s.revenueChart.empty} />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={monthlyRevenue}
              barCategoryGap="30%"
              barGap={4}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip content={<CommonTooltip />} cursor={{ fill: "#f1f5f9" }} />
              <Bar
                dataKey="expected"
                name={s.revenueChart.barExpected}
                fill={colors.chart.expected}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="collected"
                name={s.revenueChart.barCollected}
                fill={colors.chart.collected}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
