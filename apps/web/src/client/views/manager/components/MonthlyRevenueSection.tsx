"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent, CommonTooltip } from "@repo/ui";
import { EmptyState } from "@/client/views/EmptyScreen";
import { strings } from "@repo/tokens";
import type { MonthlyRevenue } from "@repo/data";

const s = strings.manager.dashboard;

export function MonthlyRevenueSection({ monthlyRevenue }: { monthlyRevenue: MonthlyRevenue[] }) {
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>{s.revenueChart.title}</CardTitle>
        <p className="text-[13px] text-muted-foreground mt-0.5">{s.revenueChart.subtitle}</p>
      </CardHeader>
      <CardContent>
        {monthlyRevenue.length === 0 ? (
          <EmptyState title={s.revenueChart.empty} />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={monthlyRevenue}
                barCategoryGap="30%"
                barGap={5}
                margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
              >
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11.5, fill: "#8B716E" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11.5, fill: "#8B716E" }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                />
                <Tooltip content={<CommonTooltip />} cursor={{ fill: "#F3F4E9" }} />
                <Bar
                  dataKey="expected"
                  name={s.revenueChart.barExpected}
                  fill="#CDE2E3"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="collected"
                  name={s.revenueChart.barCollected}
                  fill="#FF6139"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-5 mt-5 text-[12.5px] text-espresso-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-[3px] bg-teal-200 inline-block" />
                {s.revenueChart.barExpected}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-[3px] bg-coral-500 inline-block" />
                {s.revenueChart.barCollected}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
