import { useRouter } from "next/navigation";
import type { AtRiskLease } from "@repo/data";
import { strings } from "@repo/tokens";
import {
  Button,
  PrimaryLabelMedium,
  PrimaryLabelSemibold,
  Caption,
  StatusLabel,
  Overline,
} from "@repo/ui";

const s = strings.manager.dashboard.attentionHero;

const LeaseRow = ({ l }: { l: AtRiskLease }) => (
  <div className="flex items-center justify-between py-3 border-t border-sand-200 first:border-t-0">
    <div>
      <PrimaryLabelMedium>{l.tenantName}</PrimaryLabelMedium>
      <Caption>
        {l.propertyName} · {l.unitLabel}
      </Caption>
    </div>
    <div className="text-right">
      <PrimaryLabelSemibold>${l.amountDue.toLocaleString()}</PrimaryLabelSemibold>
      {l.status === "overdue" ? (
        <StatusLabel className="text-destructive">{s.daysOverdue(l.daysOverdue)}</StatusLabel>
      ) : (
        <StatusLabel className="text-warning">{s.outstanding}</StatusLabel>
      )}
    </div>
  </div>
);

export const AtRiskLeasesSection = ({ atRiskLeases }: { atRiskLeases: AtRiskLease[] }) => {
  const router = useRouter();

  return (
    <div className="bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <Overline>{s.atRiskTitle}</Overline>
        <Button variant="ghost" size="sm" onClick={() => router.push("/manager/payments")}>
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
