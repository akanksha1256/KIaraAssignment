import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { strings } from "@repo/tokens";
import { Button, Overline, MoneyText, LeadText, StatTile, useToast } from "@repo/ui";
import { useSendAllReminders } from "@repo/data";
import type { NeedsAttentionSectionProps } from "./utils";

const s = strings.manager.dashboard.attentionHero;

export const NeedsAttentionSection = ({
  totalAmount,
  overdueAmount,
  overdueCount,
  outstandingAmount,
  outstandingCount,
  atRiskLeases,
}: NeedsAttentionSectionProps) => {
  const router = useRouter();
  const { showToast } = useToast();
  const sendAllReminders = useSendAllReminders();

  const fmt = (n: number) => `$${n.toLocaleString()}`;

  const handleSendAllReminders = () => {
    sendAllReminders.mutate(atRiskLeases, {
      onSuccess: () => showToast(s.sendAllRemindersSuccess(atRiskLeases.length), "success"),
      onError: () => showToast(s.sendAllRemindersError, "error"),
    });
  };

  return (
    <div className="bg-white p-6 bg-gradient-to-br from-white to-coral-50">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-destructive flex-none" />
        <Overline className="text-destructive">{s.label}</Overline>
      </div>
      <MoneyText className="text-espresso-900">{fmt(totalAmount)}</MoneyText>
      <LeadText className="mt-2 max-w-[42ch]">
        {s.outstandingPrefix}{" "}
        <strong>
          {overdueCount + outstandingCount} {s.outstandingCycleSuffix}
        </strong>{" "}
        {overdueCount > 0 && s.overdueWarning(overdueCount)}
      </LeadText>

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
        <Button variant="default" onClick={() => router.push("/manager/payments")}>
          {s.reviewOverdue} <ArrowRight className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          onClick={handleSendAllReminders}
          disabled={sendAllReminders.isPending}
        >
          {sendAllReminders.isPending ? "Sending…" : s.sendAllReminders}
        </Button>
      </div>
    </div>
  );
};
