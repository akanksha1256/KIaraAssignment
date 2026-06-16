"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui";
import { EmptyState } from "@/client/views/EmptyScreen";
import { strings } from "@repo/tokens";
import type { PaymentBreakdown } from "@repo/data";

const s = strings.manager.dashboard;

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { name, value, fill } = payload[0];
  return (
    <div className="rounded-xl border border-sand-400 bg-white px-3 py-2 shadow-md text-[12px]">
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

  const collectionPct = total > 0 && paymentBreakdown
    ? Math.round((paymentBreakdown.paid / total) * 100)
    : 0;

  const pieData = paymentBreakdown
    ? [
        { name: s.paymentChart.paid,        value: paymentBreakdown.paid,        fill: "#467173" },
        { name: s.paymentChart.outstanding, value: paymentBreakdown.outstanding, fill: "#C98A12" },
        { name: s.paymentChart.overdue,     value: paymentBreakdown.overdue,     fill: "#C8341B" },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>{s.paymentChart.title}</CardTitle>
        <p className="text-[13px] text-muted-foreground mt-0.5">{s.paymentChart.subtitle}</p>
      </CardHeader>
      <CardContent>
        {pieData.length === 0 ? (
          <EmptyState title={s.paymentChart.empty} />
        ) : (
          <>
            <div className="flex flex-col items-center gap-5">
              <div className="relative w-[160px] h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[22px] font-semibold tracking-tight text-espresso-900">{collectionPct}%</span>
                  <span className="text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">collected</span>
                </div>
              </div>

              <div className="grid grid-cols-3 w-full border-t border-sand-200 pt-4 gap-3 text-center">
                {pieData.map(({ name, value, fill }) => (
                  <div key={name} className="flex flex-col items-center gap-0.5">
                    <span className="text-[20px] font-semibold text-espresso-900">{value}</span>
                    <span className="text-[12px] font-medium flex items-center gap-1.5 justify-center" style={{ color: fill }}>
                      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: fill }} />
                      {name}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {total > 0 ? Math.round((value / total) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
