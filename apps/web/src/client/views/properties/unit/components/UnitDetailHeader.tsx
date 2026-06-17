"use client";

import type { PaymentStatus } from "@repo/data";
import { Badge, SubpageTitle, BodyText } from "@repo/ui";
import { getUnitStatusVariant, getUnitStatusLabel } from "../../helper";

export const UnitDetailHeader = ({
  label,
  propertyName,
  paymentStatus,
}: {
  label: string;
  propertyName: string;
  paymentStatus: PaymentStatus | "vacant" | "upcoming";
}) => (
  <div className="flex items-center justify-between mb-8">
    <div>
      <SubpageTitle>{label}</SubpageTitle>
      <BodyText className="text-muted-foreground mt-1">{propertyName}</BodyText>
    </div>
    <Badge variant={getUnitStatusVariant(paymentStatus)} size="lg">
      {getUnitStatusLabel(paymentStatus)}
    </Badge>
  </div>
);
