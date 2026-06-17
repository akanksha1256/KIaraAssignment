"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent, MetricValue, MetricCount, Overline, MutedText } from "@repo/ui";
import { EmptyState } from "@/client/views/EmptyScreen";

export interface DonutChartEntry {
  name: string;
  value: number;
  fill: string;
}

interface DonutChartProps {
  data: DonutChartEntry[];
  size?: number;
  innerRadius?: number;
  outerRadius?: number;
  centerValue: string;
  centerLabel: string;
  showMetricCount?: boolean;
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
}

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

export const DonutChart = ({
  data,
  size = 160,
  innerRadius = 50,
  outerRadius = 72,
  centerValue,
  centerLabel,
  showMetricCount = true,
  title,
  subtitle,
  emptyMessage,
}: DonutChartProps) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card>
      {(title || subtitle) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {subtitle && <MutedText className="mt-0.5">{subtitle}</MutedText>}
        </CardHeader>
      )}
      <CardContent>
        {data.length === 0 ? (
          <EmptyState title={emptyMessage ?? ""} />
        ) : (
          <div className="flex flex-col items-center gap-5">
            <div className="relative" style={{ width: size, height: size }}>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <MetricValue>{centerValue}</MetricValue>
                <Overline className="!text-[10px]">{centerLabel}</Overline>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {showMetricCount && (
              <div className="grid grid-cols-3 w-full border-t border-sand-200 pt-4 gap-3 text-center">
                {data.map(({ name, value, fill }) => (
                  <div key={name} className="flex flex-col items-center gap-0.5">
                    <MetricCount>{value}</MetricCount>
                    <span
                      className="text-[12px] font-medium flex items-center gap-1.5 justify-center"
                      style={{ color: fill }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: fill }} />
                      {name}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {total > 0 ? Math.round((value / total) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
