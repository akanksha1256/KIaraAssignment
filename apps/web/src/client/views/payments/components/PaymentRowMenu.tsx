"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useMarkPaid,
  useSendReminder,
  MANAGER_DASHBOARD_KEY,
  allPaymentsKey,
} from "@repo/data";
import type { PaymentListItem } from "@repo/data";
import { RowMenu, useToast } from "@repo/ui";
import { strings } from "@repo/tokens";

const s = strings.manager.paymentsList;

export const PaymentRowMenu = ({ item }: { item: PaymentListItem }) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [reminderSentAt, setReminderSentAt] = useState<Date | null>(null);

  const markPaid = useMarkPaid(item.lease.id);
  const sendReminder = useSendReminder(item.lease.id);

  if (item.payment.status === "paid") return null;

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) +
    ", " +
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: allPaymentsKey() });
    queryClient.invalidateQueries({ queryKey: MANAGER_DASHBOARD_KEY });
  };

  const menuItems = [
    ...(item.payment.status === "overdue"
      ? [
          {
            label: s.rowMenu.sendReminder,
            sublabel: reminderSentAt ? s.rowMenu.lastSent(formatTime(reminderSentAt)) : undefined,
            disabled: reminderSentAt !== null || sendReminder.isPending,
            loading: sendReminder.isPending,
            onClick: () =>
              sendReminder.mutate(
                { periodMonth: item.payment.periodMonth },
                {
                  onSuccess: () => {
                    setReminderSentAt(new Date());
                    showToast(s.rowMenu.reminderSuccess(item.tenant.name), "success");
                  },
                  onError: (err) =>
                    showToast((err as Error).message ?? s.rowMenu.failedReminder, "error"),
                },
              ),
          },
        ]
      : []),
    {
      label: s.rowMenu.markPaid,
      loading: markPaid.isPending,
      onClick: () =>
        markPaid.mutate(
          { periodMonth: item.payment.periodMonth },
          {
            onSuccess: () => {
              showToast(s.rowMenu.paymentSuccess, "success");
              invalidate();
            },
            onError: (err) =>
              showToast((err as Error).message ?? s.rowMenu.failedMarkPaid, "error"),
          },
        ),
    },
  ];

  return <RowMenu items={menuItems} />;
};
