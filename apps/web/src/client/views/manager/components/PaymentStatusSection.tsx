"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui";
import { EmptyState } from "@/client/views/EmptyScreen";
import { strings } from "@repo/tokens";
import { colors } from "@repo/tokens";
import type { PaymentBreakdown } from "@repo/data";

const s = strings.manager.dashboard;

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { name, value, fill } = payload[0];
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-md text-xs">
      <p style={{ color: fill }} className="font-semibold">
        {name}: {value} payment{value !== 1 ? "s" : ""}
      </p>
    </div>
  );
};

export function PaymentStatusSection({ paymentBreakdown }: { paymentBreakdown: PaymentBreakdown | null }) {
  const total = paymentBreakdown
    ? paymentBreakdown.paid + paymentBreakdown.outstanding + paymentBreakdown.overdue
    : 0;

  const pieData = paymentBreakdown
    ? [
        { name: s.paymentChart.paid, value: paymentBreakdown.paid, fill: colors.chart.paid },
        { name: s.paymentChart.outstanding, value: paymentBreakdown.outstanding, fill: colors.chart.outstanding },
        { name: s.paymentChart.overdue, value: paymentBreakdown.overdue, fill: colors.chart.overdue },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>{s.paymentChart.title}</CardTitle>
        <p className="text-xs text-neutral-400">{s.paymentChart.subtitle}</p>
      </CardHeader>
      <CardContent>
        {pieData.length === 0 ? (
          <EmptyState title={s.paymentChart.empty} />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-xs text-neutral-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 grid grid-cols-3 divide-x divide-neutral-100 border-t border-neutral-100 pt-4">
              {pieData.map(({ name, value, fill }) => (
                <div key={name} className="flex flex-col items-center gap-0.5 px-2">
                  <span className="text-lg font-bold text-neutral-900">{value}</span>
                  <span className="text-xs font-medium" style={{ color: fill }}>{name}</span>
                  <span className="text-xs text-neutral-400">
                    {total > 0 ? Math.round((value / total) * 100) : 0}% of total
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
