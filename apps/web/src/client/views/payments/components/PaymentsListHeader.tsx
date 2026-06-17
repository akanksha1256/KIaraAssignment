import { SectionTitle, MutedText } from "@repo/ui";
import { strings } from "@repo/tokens";

const s = strings.manager.paymentsList;

export const PaymentsListHeader = ({ count }: { count: number }) => (
  <div className="mb-6">
    <SectionTitle>{s.title}</SectionTitle>
    <MutedText className="mt-1">{s.subtitle(count)}</MutedText>
  </div>
);
