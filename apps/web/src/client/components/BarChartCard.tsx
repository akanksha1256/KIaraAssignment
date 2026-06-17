"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent, CommonTooltip, MutedText } from "@repo/ui";
import { EmptyState } from "@/client/views/EmptyScreen";

export interface BarDefinition {
  dataKey: string;
  name: string;
  fill: string;
  radius?: [number, number, number, number];
  stackId?: string;
}

interface BarChartCardProps {
  data: object[];
  bars: BarDefinition[];
  xAxisKey?: string;
  yAxisFormatter?: (value: number) => string;
  height?: number;
  barCategoryGap?: string | number;
  barGap?: number;
  showLegend?: boolean;
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
}

const LegendItem = ({ fill, label }: { fill: string; label: string }) => (
  <span className="flex items-center gap-1.5 text-[12.5px] text-espresso-700">
    <span className="w-2.5 h-2.5 rounded-[3px] inline-block" style={{ background: fill }} />
    {label}
  </span>
);

export const BarChartCard = ({
  data,
  bars,
  xAxisKey = "month",
  yAxisFormatter,
  height = 200,
  barCategoryGap = "30%",
  barGap = 5,
  showLegend = true,
  title,
  subtitle,
  emptyMessage,
}: BarChartCardProps) => (
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
        <>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={data}
              barCategoryGap={barCategoryGap}
              barGap={barGap}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey={xAxisKey}
                tick={{ fontSize: 11.5, fill: "#8B716E" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={yAxisFormatter}
                tick={{ fontSize: 11.5, fill: "#8B716E" }}
                axisLine={false}
                tickLine={false}
                width={44}
              />
              <Tooltip content={<CommonTooltip />} cursor={{ fill: "#F3F4E9" }} />
              {bars.map((bar) => (
                <Bar
                  key={bar.dataKey}
                  dataKey={bar.dataKey}
                  name={bar.name}
                  fill={bar.fill}
                  radius={bar.radius ?? [4, 4, 0, 0]}
                  stackId={bar.stackId}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
          {showLegend && (
            <div className="flex gap-5 mt-5">
              {bars.map((bar) => (
                <LegendItem key={bar.dataKey} fill={bar.fill} label={bar.name} />
              ))}
            </div>
          )}
        </>
      )}
    </CardContent>
  </Card>
);
