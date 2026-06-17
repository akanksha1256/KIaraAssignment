"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useManagerDashboard, PropertyStatusValues } from "@repo/data";
import type { UnitDetailItem, SortDir } from "@repo/data";
import { strings } from "@repo/tokens";
import { PropertiesListHeader } from "./components/PropertiesListHeader";
import { PillTabs } from "@/client/components/PillTabs";
import type { PillTab } from "@/client/components/PillTabs";
import { ErrorState } from "@/client/views/ErrorScreen";
import { EmptyState } from "@/client/views/EmptyScreen";
import { PropertiesListSkeleton } from "./PropertiesListLoadingScreen";
import { AddLeaseModal } from "./components/AddLeaseModal";
import { AddPropertyModal } from "./components/AddPropertyModal";
import { PropertiesTable } from "./components/PropertiesTable";

const spl = strings.manager.propertiesList;

type Tab = "all" | "overdue" | "outstanding" | "paid" | "vacant";
type PropSortCol = "rent" | "status";

const TABS: PillTab<Tab>[] = [
  { key: "all", label: spl.tabs.all, color: "default" },
  { key: "overdue", label: spl.tabs.overdue, color: "overdue" },
  { key: "outstanding", label: spl.tabs.outstanding, color: "outstanding" },
  { key: "paid", label: spl.tabs.paid, color: "paid" },
  { key: "vacant", label: spl.tabs.vacant, color: "vacant" },
];

const STATUS_RANK: Record<string, number> = {
  overdue: 0,
  outstanding: 1,
  paid: 2,
  vacant: 3,
};

export const PropertiesList = () => {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useManagerDashboard();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [sortCol, setSortCol] = useState<PropSortCol | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
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

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab !== "all" && sortCol === "status") setSortCol(null);
  };

  const toggleSort = (col: PropSortCol) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("desc");
    }
  };

  const displayProperties = useMemo(() => {
    const properties = data?.properties ?? [];
    const base =
      activeTab === "all" ? properties : properties.filter((p) => p.status === activeTab);
    if (!sortCol) return base;
    return [...base].sort((a, b) => {
      let cmp = 0;
      if (sortCol === "rent") cmp = a.totalRent - b.totalRent;
      if (sortCol === "status") cmp = (STATUS_RANK[a.status] ?? 0) - (STATUS_RANK[b.status] ?? 0);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data?.properties, activeTab, sortCol, sortDir]);

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

  const tabCounts: Record<Tab, number> = {
    all: properties.length,
    overdue: overdueCount,
    outstanding: properties.filter((p) => p.status === PropertyStatusValues.OUTSTANDING).length,
    paid: properties.filter((p) => p.status === PropertyStatusValues.PAID).length,
    vacant: vacantCount,
  };

  return (
    <>
      {addOpen && <AddPropertyModal onClose={() => setAddOpen(false)} />}
      {leaseTarget && (
        <AddLeaseModal
          unit={leaseTarget.unit}
          propertyId={leaseTarget.propertyId}
          onClose={() => setLeaseTarget(null)}
        />
      )}
      <div className="h-screen flex flex-col overflow-hidden">
        <div className="px-8 pt-8 pb-4 flex-none">
          <PropertiesListHeader
            count={properties.length}
            overdueCount={overdueCount}
            vacantCount={vacantCount}
            onAdd={() => setAddOpen(true)}
          />

          <PillTabs
            tabs={TABS.map((t) => ({ ...t, count: tabCounts[t.key] }))}
            activeTab={activeTab}
            onChange={handleTabChange}
            className="mb-4"
          />
        </div>

        {/* Scrollable table section */}
        <div className="flex-1 min-h-0 px-8 pb-8">
          {displayProperties.length === 0 ? (
            <EmptyState title={spl.emptyTitle} description={spl.emptyDescription} icon="building" />
          ) : (
            <PropertiesTable
              properties={displayProperties}
              expanded={expanded}
              onToggle={toggle}
              onUnitNav={(propertyId, unitId) =>
                router.push(`/manager/properties/${propertyId}/units/${unitId}`)
              }
              onAddLease={(unit, propertyId) => setLeaseTarget({ unit, propertyId })}
              sortCol={sortCol}
              sortDir={sortDir}
              onSort={toggleSort}
              canSortStatus={activeTab === "all"}
            />
          )}
        </div>
      </div>
    </>
  );
};
