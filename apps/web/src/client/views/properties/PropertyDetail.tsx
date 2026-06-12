"use client";

import { useRouter } from "next/navigation";
import { usePropertyDetail } from "@repo/data";
import { LoadingState } from "@/client/views/LoadingScreen";
import { ErrorState } from "@/client/views/ErrorScreen";
import { EmptyState } from "@/client/views/EmptyScreen";
import { StatusSection } from "./StatusSection";
import { DataTable } from "@repo/ui";
import { strings } from "@repo/tokens";
import { ChevronRight } from "lucide-react";
import { MainHeader } from "@repo/ui";
import type { UnitDetailItem } from "@repo/data";
import type { TableCell } from "@repo/ui";
import { statusConfig, formatDate } from "@repo/ui";

const s = strings.manager.propertyDetail;

const TABLE_COLS = [
  { label: s.unitsTable.colUnit, align: "left" as const },
  { label: s.unitsTable.colTenant, align: "left" as const },
  { label: s.unitsTable.colRent, align: "right" as const },
  { label: s.unitsTable.colLease, align: "right" as const, className: "w-64" },
  { label: s.unitsTable.colStatus, align: "right" as const },
  { label: s.unitsTable.colAction, align: "right" as const },
];

const getUnitRow = (unit: UnitDetailItem): TableCell[] => {
  const { bg, text, label } = statusConfig[unit.paymentStatus];
  return [
    {
      content: unit.label,
      className: "whitespace-nowrap px-5 py-4 text-sm font-semibold text-neutral-900",
    },
    {
      content: unit.tenant?.name ?? <span className="text-neutral-400">{s.unitsTable.vacant}</span>,
      className: "px-5 py-4 text-sm text-neutral-700",
    },
    {
      content: unit.lease ? `$${unit.lease.monthlyRent.toLocaleString()}/mo` : "—",
      className: "whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-neutral-900",
    },
    {
      content: unit.lease ? (
        s.unitsTable.leasePeriod(formatDate(unit.lease.startDate), formatDate(unit.lease.endDate))
      ) : (
        <span className="text-neutral-400">—</span>
      ),
      className: "whitespace-nowrap px-5 py-4 text-right text-sm text-neutral-500 w-64",
    },
    {
      content: (
        <div className="flex justify-end">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${bg} ${text}`}
          >
            {label}
          </span>
        </div>
      ),
      className: "whitespace-nowrap px-5 py-4",
    },
    {
      content: (
        <span className="inline-flex items-center gap-1 text-sm text-brand-600">
          {s.unitsTable.viewLink} <ChevronRight className="h-3.5 w-3.5" />
        </span>
      ),
      className: "whitespace-nowrap px-5 py-4 text-right",
    },
  ];
};

interface Props {
  propertyId: string;
}

export const PropertyDetail = ({ propertyId }: Props) => {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = usePropertyDetail(propertyId);

  if (isLoading) return <LoadingState message={s.loading} />;
  if (isError)
    return <ErrorState message={(error as Error)?.message ?? s.error} onRetry={() => refetch()} />;
  if (!data) return <EmptyState title={s.emptyTitle} description={s.emptyDescription} />;

  const { property, units } = data;
  const totalUnits = units.length;
  const occupiedUnits = units.filter((u) => u.paymentStatus !== "vacant").length;
  const vacantUnits = totalUnits - occupiedUnits;
  const totalRent = units.reduce((sum, u) => sum + (u.lease?.monthlyRent ?? 0), 0);

  return (
    <div className="space-y-8">
      <MainHeader label={s.backLink} />

      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{property.name}</h1>
        <p className="mt-1 text-sm text-neutral-500">{property.address}</p>
      </div>

      <StatusSection
        totalUnits={totalUnits}
        occupiedUnits={occupiedUnits}
        vacantUnits={vacantUnits}
        totalRent={totalRent}
      />

      <div>
        <div className="mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
            {s.unitsTable.heading(totalUnits)}
          </h2>
        </div>

        {units.length === 0 ? (
          <EmptyState title={s.unitsTable.empty} description={s.unitsTable.emptyDescription} />
        ) : (
          <DataTable
            columns={TABLE_COLS}
            rows={units.map((unit) => ({
              key: unit.id,
              onClick: () => router.push(`/manager/properties/${propertyId}/units/${unit.id}`),
              cells: getUnitRow(unit),
            }))}
          />
        )}
      </div>
    </div>
  );
};
