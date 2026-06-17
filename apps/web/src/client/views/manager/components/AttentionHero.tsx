import { strings } from "@repo/tokens";
import { NeedsAttentionSection } from "./NeedsAttentionSection";
import { AtRiskLeasesSection } from "./AtRiskLeasesSection";
import type { AttentionHeroProps } from "./utils";

const s = strings.manager.dashboard.attentionHero;

export const AttentionHero = ({
  totalAmount,
  overdueAmount,
  overdueCount,
  outstandingAmount,
  outstandingCount,
  atRiskLeases,
}: AttentionHeroProps) => {
  return (
    <section
      aria-label={s.label}
      className="grid grid-cols-[1.3fr_1fr] gap-px bg-sand-400 border border-sand-400 rounded-xl overflow-hidden shadow-md mb-6"
    >
      <NeedsAttentionSection
        totalAmount={totalAmount}
        overdueAmount={overdueAmount}
        overdueCount={overdueCount}
        outstandingAmount={outstandingAmount}
        outstandingCount={outstandingCount}
      />
      <AtRiskLeasesSection atRiskLeases={atRiskLeases} />
    </section>
  );
};
