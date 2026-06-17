"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useManagerDashboard, PropertyStatusValues } from "@repo/data";
import type { PropertySummary, UnitDetailItem } from "@repo/data";
import { strings } from "@repo/tokens";
import { PropertiesListHeader } from "./components/PropertiesListHeader";
import { ErrorState } from "@/client/views/ErrorScreen";
import { EmptyState } from "@/client/views/EmptyScreen";
import { PropertiesListSkeleton } from "./PropertiesListLoadingScreen";
import { AddLeaseModal } from "./components/AddLeaseModal";
import { AddPropertyModal } from "./components/AddPropertyModal";
import { PropertiesTable } from "./components/PropertiesTable";

const spl = strings.manager.propertiesList;

export const PropertiesList = () => {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useManagerDashboard();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [addOpen, setAddOpen] = useState(false);
  const [leaseTarget, setLeaseTarget] = useState<{
    unit: UnitDetailItem;
    propertyId: string;
  } | null>(null);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  if (isLoading) return <PropertiesListSkeleton />;
  if (isError)
    return (
      <ErrorState message={(error as Error)?.message ?? spl.error} onRetry={() => refetch()} />
    );
  if (!data)
    return <EmptyState title={spl.emptyTitle} description={spl.emptyDescription} icon="building" />;

  const { properties } = data;
  const overdueCount = properties.filter((p) => p.status === PropertyStatusValues.OVERDUE).length;
  const vacantCount = properties.filter((p) => p.status === PropertyStatusValues.VACANT).length;

  const grouped: Record<string, PropertySummary[]> = {
    overdue: [],
    outstanding: [],
    paid: [],
    vacant: [],
  };
  for (const p of properties) {
    (grouped[p.status] ?? grouped.paid).push(p);
  }

  return (
    <>
      <AddPropertyModal open={addOpen} onClose={() => setAddOpen(false)} />
      {leaseTarget && (
        <AddLeaseModal
          unit={leaseTarget.unit}
          propertyId={leaseTarget.propertyId}
          onClose={() => setLeaseTarget(null)}
        />
      )}
      <div className="p-8 max-w-[1180px]">
        <PropertiesListHeader
          count={properties.length}
          overdueCount={overdueCount}
          vacantCount={vacantCount}
          onAdd={() => setAddOpen(true)}
        />

        {properties.length === 0 ? (
          <EmptyState title={spl.emptyTitle} description={spl.emptyDescription} icon="building" />
        ) : (
          <PropertiesTable
            grouped={grouped}
            expanded={expanded}
            onToggle={toggle}
            onUnitNav={(propertyId, unitId) =>
              router.push(`/manager/properties/${propertyId}/units/${unitId}`)
            }
            onAddLease={(unit, propertyId) => setLeaseTarget({ unit, propertyId })}
          />
        )}
      </div>
    </>
  );
};
