"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useAppDispatch,
  useAppSelector,
} from "@/client/stateManagement/mainFile";
import { fetchPropertyById } from "@/client/stateManagement/property/propertySlice";
import { selectPropertyDetailById } from "@/client/stateManagement/property/propertySelectors";
import { selectUnitsForProperty } from "@/client/stateManagement/unit/unitSelectors";
import { LoadingState } from "@/client/views/LoadingScreen";
import { ErrorState } from "@/client/views/ErrorScreen";
import { EmptyState } from "@/client/views/EmptyScreen";
import { StatusSection } from "./StatusSection";
import { DataTable } from "@/client/commonComponents/DataTable";
import { strings } from "@/client/designSystems/strings";
import { ArrowLeft, ChevronRight } from "lucide-react";
import type { UnitDetailItem } from "@/client/stateManagement/property/type";
import type { TableCell } from "@/client/commonComponents/DataTable";
import { statusConfig } from "@/client/helpers/utils";

const s = strings.manager.propertyDetail;

const TABLE_COLS = [
  { label: s.unitsTable.colUnit, align: "left" as const },
  { label: s.unitsTable.colTenant, align: "left" as const },
  { label: s.unitsTable.colRent, align: "right" as const },
  { label: s.unitsTable.colLease, align: "left" as const },
  { label: s.unitsTable.colStatus, align: "left" as const },
  { label: s.unitsTable.colAction, align: "right" as const },
];

const getUnitRow = (unit: UnitDetailItem): TableCell[] => {
  const { bg, text, label } = statusConfig[unit.paymentStatus];
  return [
    {
      content: unit.label,
      className:
        "whitespace-nowrap px-5 py-4 text-sm font-semibold text-neutral-900",
    },
    {
      content: unit.tenant?.name ?? (
        <span className="text-neutral-400">{s.unitsTable.vacant}</span>
      ),
      className: "px-5 py-4 text-sm text-neutral-700",
    },
    {
      content: unit.lease
        ? `$${unit.lease.monthlyRent.toLocaleString()}/mo`
        : "—",
      className:
        "whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-neutral-900",
    },
    {
      content: unit.lease ? (
        s.unitsTable.leasePeriod(unit.lease.startDate, unit.lease.endDate)
      ) : (
        <span className="text-neutral-400">—</span>
      ),
      className: "whitespace-nowrap px-5 py-4 text-sm text-neutral-500",
    },
    {
      content: (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${bg} ${text}`}
        >
          {label}
        </span>
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
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { fetchState: { status, error }, property } = useAppSelector(selectPropertyDetailById(propertyId));
  const { units } = useAppSelector(selectUnitsForProperty(propertyId));

  useEffect(() => {
    dispatch(fetchPropertyById(propertyId));
  }, [dispatch, propertyId]);

  if (status === "pending") return <LoadingState message={s.loading} />;
  if (status === "failed")
    return (
      <ErrorState
        message={error ?? s.error}
        onRetry={() => dispatch(fetchPropertyById(propertyId))}
      />
    );
  if (!property)
    return <EmptyState title={s.emptyTitle} description={s.emptyDescription} />;

  const totalUnits = units.length;
  const occupiedUnits = units.filter(
    (u) => u.paymentStatus !== "vacant",
  ).length;
  const vacantUnits = totalUnits - occupiedUnits;
  const totalRent = units.reduce(
    (sum, u) => sum + (u.lease?.monthlyRent ?? 0),
    0,
  );

  return (
    <div className="space-y-8">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {s.backLink}
      </button>

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

      {/* Units table */}
      <div>
        <div className="mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
            {s.unitsTable.heading(totalUnits)}
          </h2>
        </div>

        {units.length === 0 ? (
          <EmptyState
            title={s.unitsTable.empty}
            description={s.unitsTable.emptyDescription}
          />
        ) : (
          <DataTable
            columns={TABLE_COLS}
            rows={units.map((unit) => ({
              key: unit.id,
              onClick: () =>
                router.push(
                  `/manager/properties/${propertyId}/units/${unit.id}`,
                ),
              cells: getUnitRow(unit),
            }))}
          />
        )}
      </div>
    </div>
  );
};
