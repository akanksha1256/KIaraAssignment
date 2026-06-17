"use client";

import { Plus as PlusIcon } from "lucide-react";
import { Button, SectionTitle, MutedText } from "@repo/ui";
import { strings } from "@repo/tokens";

const spl = strings.manager.propertiesList;

export const PropertiesListHeader = ({
  count,
  overdueCount,
  vacantCount,
  onAdd,
}: {
  count: number;
  overdueCount: number;
  vacantCount: number;
  onAdd: () => void;
}) => (
  <div className="mb-8 flex items-start justify-between">
    <div>
      <SectionTitle>{spl.title}</SectionTitle>
      <MutedText className="mt-1">
        {spl.subtitle(count)}
        {overdueCount > 0 && (
          <> ·{" "}<span className="text-destructive font-medium">{spl.overdueCount(overdueCount)}</span></>
        )}
        {vacantCount > 0 && <> · {spl.vacantCount(vacantCount)}</>}
      </MutedText>
    </div>
    <Button size="sm" className="rounded-lg gap-2 font-semibold" onClick={onAdd}>
      <PlusIcon className="h-3.5 w-3.5" />
      {spl.addPropertyButton}
    </Button>
  </div>
);
