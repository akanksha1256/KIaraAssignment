"use client";

import { Card, CardContent } from "./Card";
import type { StatCardProps } from "./statCard.types";
import { accentMap } from "./statCard.types";

export const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: StatCardProps) => {
  const { bg, text } = accentMap[accent];
  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bg} ${text}`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">{label}</p>
            <p className="text-2xl font-bold text-neutral-900 leading-tight">
              {value}
            </p>
            {sub && <p className="mt-0.5 text-xs text-neutral-400">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
