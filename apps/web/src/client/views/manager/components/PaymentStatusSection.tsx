"use client";

import { strings, colors } from "@repo/tokens";
import type { PaymentBreakdown } from "@repo/data";
import { DonutChart } from "@/client/components/DonutChart";

const s = strings.manager.dashboard.paymentChart;

export const PaymentStatusSection = ({
  paymentBreakdown,
}: {
  paymentBreakdown: PaymentBreakdown | null;
}) => {
  const total = paymentBreakdown
    ? paymentBreakdown.paid + paymentBreakdown.outstanding + paymentBreakdown.overdue
    : 0;

  const collectionPct =
    total > 0 && paymentBreakdown ? Math.round((paymentBreakdown.paid / total) * 100) : 0;

  const pieData = paymentBreakdown
    ? [
        { name: s.paid, value: paymentBreakdown.paid, fill: colors.chart.paid },
        { name: s.outstanding, value: paymentBreakdown.outstanding, fill: colors.chart.outstanding },
        { name: s.overdue, value: paymentBreakdown.overdue, fill: colors.chart.overdue },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <DonutChart
      data={pieData}
      size={160}
      centerValue={`${collectionPct}%`}
      centerLabel={s.collected}
      title={s.title}
      subtitle={s.subtitle}
      emptyMessage={s.empty}
    />
  );
};
