import type { AtRiskLease } from "@repo/data";
import { strings } from "@repo/tokens";
import { Button } from "@repo/ui";

const s = strings.manager.dashboard.attentionHero;

const LeaseRow = ({ l }: { l: AtRiskLease }) => (
  <div className="flex items-center justify-between py-3 border-t border-sand-200 first:border-t-0">
    <div>
      <div className="text-[14px] font-medium text-espresso-900">{l.tenantName}</div>
      <div className="text-[12.5px] text-muted-foreground">
        {l.propertyName} · {l.unitLabel}
      </div>
    </div>
    <div className="text-right">
      <div className="text-[14px] font-semibold text-espresso-900">
        ${l.amountDue.toLocaleString()}
      </div>
      {l.status === "overdue" ? (
        <div className="text-[11.5px] text-destructive font-medium">
          {s.daysOverdue(l.daysOverdue)}
        </div>
      ) : (
        <div className="text-[11.5px] text-warning font-medium">{s.outstanding}</div>
      )}
    </div>
  </div>
);

export const AtRiskLeasesSection = ({ atRiskLeases }: { atRiskLeases: AtRiskLease[] }) => {
  return (
    <div className="bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="t-overline">{s.atRiskTitle}</span>
        <Button variant="ghost" size="sm">
          {s.viewAll}
        </Button>
      </div>
      <div>
        {atRiskLeases.slice(0, 4).map((l, i) => (
          <LeaseRow key={i} l={l} />
        ))}
      </div>
    </div>
  );
};
