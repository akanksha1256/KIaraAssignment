"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/client/commonComponents/Card";
import { EmptyState } from "@/client/views/EmptyScreen";
import { CommonTooltip } from "@/client/commonComponents/Tooltip";
import { strings } from "@/client/designSystems/strings";
import { colors } from "@/client/designSystems/colors";
import type { PaymentBreakdown } from "@/client/stateManagement/manager/type";

const s = strings.manager.dashboard;

export function PaymentStatusSection({ paymentBreakdown }: { paymentBreakdown: PaymentBreakdown | null }) {
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
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<CommonTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span className="text-xs text-neutral-600">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
