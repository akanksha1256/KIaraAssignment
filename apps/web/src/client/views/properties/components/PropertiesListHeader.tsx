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
  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
    <div>
      <SectionTitle>{spl.title}</SectionTitle>
      <MutedText className="mt-1">
        <span>{spl.subtitle(count)}</span>
        {overdueCount > 0 && (
          <>
            <span className="mx-1.5 text-sand-400">•</span>
            <span className="text-destructive font-medium">{spl.overdueCount(overdueCount)}</span>
          </>
        )}
        {vacantCount > 0 && (
          <>
            <span className="mx-1.5 text-sand-400">•</span>
            <span>{spl.vacantCount(vacantCount)}</span>
          </>
        )}
      </MutedText>
    </div>
    <Button size="sm" className="rounded-lg gap-2 font-semibold sm:flex-none" onClick={onAdd}>
      <PlusIcon className="h-3.5 w-3.5" />
      {spl.addPropertyButton}
    </Button>
  </div>
);
