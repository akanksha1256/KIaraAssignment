"use client";

import { PieChart, Pie, Cell } from "recharts";
import { LeadText, Caption } from "@repo/ui";
import { colors } from "@repo/tokens";

const scoreColor = (score: number): string =>
  score >= 90
    ? colors.chart.paid
    : score >= 70
      ? colors.chart.collected
      : score >= 50
        ? colors.chart.outstanding
        : colors.chart.overdue;

const scoreLabel = (score: number): string =>
  score >= 90 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Fair" : "At risk";

interface ScoreRingProps {
  score?: number | null;
  size?: number;
  innerRadius?: number;
  outerRadius?: number;
}

export const ScoreRing = ({ score, size = 120, innerRadius = 38, outerRadius = 52 }: ScoreRingProps) => {
  const half = size / 2 - 5;

  if (score == null) {
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <LeadText className="font-semibold text-espresso-500">-</LeadText>
        </div>
        <PieChart width={size} height={size}>
          <Pie
            data={[{ value: 100 }]}
            cx={half}
            cy={half}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            strokeWidth={0}
          >
            <Cell fill="#EBECDC" />
          </Pie>
        </PieChart>
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <LeadText className="font-semibold text-espresso-900">{scoreLabel(score)}</LeadText>
        <Caption>{score}/100</Caption>
      </div>
      <PieChart width={size} height={size}>
        <Pie
          data={[{ value: score }, { value: 100 - score }]}
          cx={half}
          cy={half}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
          strokeWidth={0}
        >
          <Cell fill={scoreColor(score)} />
          <Cell fill="#EBECDC" />
        </Pie>
      </PieChart>
    </div>
  );
};
