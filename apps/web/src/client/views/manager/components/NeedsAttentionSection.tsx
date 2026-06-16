import { ArrowRight } from "lucide-react";
import { strings } from "@repo/tokens";
import { Button } from "@repo/ui";
import type { NeedsAttentionSectionProps } from "./utils";
import { StatTile } from "@repo/ui";

const s = strings.manager.dashboard.attentionHero;

export const NeedsAttentionSection = ({
  totalAmount,
  overdueAmount,
  overdueCount,
  outstandingAmount,
  outstandingCount,
}: NeedsAttentionSectionProps) => {
  const fmt = (n: number) => `$${n.toLocaleString()}`;

  return (
    <div className="bg-white p-6 bg-gradient-to-br from-white to-coral-50">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-destructive flex-none" />
        <span className="t-overline" style={{ color: "var(--destructive)" }}>
          {s.label}
        </span>
      </div>
      <div className="t-money text-espresso-900">{fmt(totalAmount)}</div>
      <p className="text-espresso-700 mt-2 max-w-[42ch] text-[15px]">
        {s.outstandingPrefix}{" "}
        <strong>
          {overdueCount + outstandingCount} {s.outstandingCycleSuffix}
        </strong>{" "}
        {overdueCount > 0 && s.overdueWarning(overdueCount)}
      </p>

      <div className="flex gap-3 mt-5">
        <StatTile
          amount={fmt(overdueAmount)}
          label={s.overdueLabel(overdueCount)}
          accent="destructive"
        />
        <StatTile
          amount={fmt(outstandingAmount)}
          label={s.outstandingLabel(outstandingCount)}
          accent="warning"
        />
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="default">
          {s.reviewOverdue} <ArrowRight className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost">{s.sendAllReminders}</Button>
      </div>
    </div>
  );
};
