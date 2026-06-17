import { Overline, StatValue, Caption } from "@repo/ui";
import { strings } from "@repo/tokens";

const s = strings.manager.paymentsList;

const SummaryCard = ({
  label,
  value,
  valueClassName,
  sublabel,
}: {
  label: string;
  value: string;
  valueClassName: string;
  sublabel: string;
}) => (
  <div className="rounded-xl border border-sand-400 bg-white px-5 py-4 flex flex-col justify-between">
    <Overline className="mb-1">{label}</Overline>
    <StatValue className={valueClassName}>{value}</StatValue>
    <Caption className="mt-0.5">{sublabel}</Caption>
  </div>
);

export const SummaryCardSection = ({
  totalCollected,
  paidCount,
  totalOutstanding,
  unpaidCount,
  overdueCount,
}: {
  totalCollected: number;
  paidCount: number;
  totalOutstanding: number;
  unpaidCount: number;
  overdueCount: number;
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
    <SummaryCard
      label={s.summary.collected}
      value={`$${totalCollected.toLocaleString()}`}
      valueClassName="text-teal-700"
      sublabel={s.summary.payments(paidCount)}
    />
    <SummaryCard
      label={s.summary.outstanding}
      value={`$${totalOutstanding.toLocaleString()}`}
      valueClassName="text-warning"
      sublabel={s.summary.payments(unpaidCount)}
    />
    <SummaryCard
      label={s.summary.overdue}
      value={String(overdueCount)}
      valueClassName="text-destructive"
      sublabel={s.needImmediateAction}
    />
  </div>
);
