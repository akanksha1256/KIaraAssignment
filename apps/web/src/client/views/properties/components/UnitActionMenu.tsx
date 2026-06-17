"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useMarkPaid,
  useSendReminder,
  MANAGER_DASHBOARD_KEY,
  propertyDetailKey,
} from "@repo/data";
import type { UnitDetailItem, PropertyDetailData } from "@repo/data";
import { RowMenu, useToast } from "@repo/ui";
import { strings } from "@repo/tokens";

const spl = strings.manager.propertiesList;

export const UnitActionMenu = ({
  unit,
  propertyId,
  onAddLease,
}: {
  unit: UnitDetailItem;
  propertyId: string;
  onAddLease: (unit: UnitDetailItem) => void;
}) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [reminderSentAt, setReminderSentAt] = useState<Date | null>(null);
  const leaseId = unit.lease?.id ?? "";

  const markPaid = useMarkPaid(leaseId);
  const sendReminder = useSendReminder(leaseId);
  const periodMonth = unit.currentPeriodMonth;

  if (unit.paymentStatus === "vacant") {
    return (
      <div className="flex justify-end">
        <RowMenu items={[{ label: spl.unitMenu.addLease, onClick: () => onAddLease(unit) }]} />
      </div>
    );
  }

  if (unit.paymentStatus === "paid" || !leaseId || !periodMonth) return null;

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) +
    ", " +
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const items = [
    ...(unit.paymentStatus === "overdue"
      ? [
          {
            label: spl.unitMenu.sendReminder,
            sublabel: reminderSentAt
              ? spl.unitMenu.lastSent(formatTime(reminderSentAt))
              : undefined,
            disabled: reminderSentAt !== null || sendReminder.isPending,
            loading: sendReminder.isPending,
            onClick: () =>
              sendReminder.mutate(
                { periodMonth },
                {
                  onSuccess: () => {
                    setReminderSentAt(new Date());
                    showToast(
                      spl.unitMenu.reminderSuccess(unit.tenant?.name ?? "tenant"),
                      "success",
                    );
                  },
                  onError: (err) =>
                    showToast((err as Error).message ?? spl.unitMenu.failedReminder, "error"),
                },
              ),
          },
        ]
      : []),
    ...(unit.paymentStatus === "overdue" || unit.paymentStatus === "outstanding"
      ? [
          {
            label: spl.unitMenu.markPaid,
            loading: markPaid.isPending,
            onClick: () =>
              markPaid.mutate(
                { periodMonth },
                {
                  onSuccess: () => {
                    showToast(spl.unitMenu.paymentSuccess, "success");
                    queryClient.setQueryData<PropertyDetailData>(
                      propertyDetailKey(propertyId),
                      (old) =>
                        old
                          ? {
                              ...old,
                              units: old.units.map((u) =>
                                u.id === unit.id
                                  ? { ...u, paymentStatus: "paid", currentPeriodMonth: null }
                                  : u,
                              ),
                            }
                          : old,
                    );
                    queryClient.invalidateQueries({ queryKey: MANAGER_DASHBOARD_KEY });
                    queryClient.invalidateQueries({ queryKey: propertyDetailKey(propertyId) });
                  },
                  onError: (err) =>
                    showToast((err as Error).message ?? spl.unitMenu.failedMarkPaid, "error"),
                },
              ),
          },
        ]
      : []),
  ];

  return (
    <div className="flex justify-end">
      <RowMenu items={items} />
    </div>
  );
};
