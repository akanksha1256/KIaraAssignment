import type { AtRiskLease } from "@repo/data";

export type NeedsAttentionSectionProps = {
  totalAmount: number;
  overdueAmount: number;
  overdueCount: number;
  outstandingAmount: number;
  outstandingCount: number;
};

export type AttentionHeroProps = NeedsAttentionSectionProps & {
  atRiskLeases: AtRiskLease[];
};
