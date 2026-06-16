"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useManagerDashboard, usePropertyDetail, useMarkPaid, useSendReminder, MANAGER_DASHBOARD_KEY, propertyDetailKey } from "@repo/data";
import { useQueryClient } from "@tanstack/react-query";
import type { PropertyDetailData } from "@repo/data";
import { ErrorState } from "@/client/views/ErrorScreen";
import { EmptyState } from "@/client/views/EmptyScreen";
import { Badge, Skeleton, RowMenu, useToast } from "@repo/ui";
import type { PropertySummary, UnitDetailItem } from "@repo/data";
import { ChevronRight, ChevronDown } from "lucide-react";


// ── Status mix bar ────────────────────────────────────────────────────────────
function StatusMixBar({ property }: { property: PropertySummary }) {
  const total = property.unitCount || 1;
  const vacant = property.unitCount - property.leasedCount;
  const overdueW  = property.status === "overdue"      ? Math.max(20, Math.round((1 / total) * 100)) : 0;
  const outstandW = property.status === "outstanding"  ? Math.max(20, Math.round((1 / total) * 100)) : 0;
  const vacantW   = Math.round((vacant / total) * 100);
  const paidW     = Math.max(0, 100 - overdueW - outstandW - vacantW);
  const statusLabel =
    property.status === "overdue"      ? `${overdueW > 0 ? 1 : 0}/${total} overdue`
    : property.status === "outstanding" ? `${outstandW > 0 ? 1 : 0}/${total} outstanding`
    : property.leasedCount === 0        ? "No active leases"
    : `${total}/${total} paid`;

  return (
    <div className="flex flex-col gap-1.5 items-end">
      <Badge
        variant={
          property.status === "overdue" ? "overdue"
          : property.status === "outstanding" ? "outstanding"
          : property.status === "paid" ? "paid"
          : "vacant"
        }
      >
        {statusLabel}
      </Badge>
      <div className="flex w-[104px] h-1.5 rounded-full overflow-hidden bg-sand-200">
        {overdueW  > 0 && <span className="block h-full bg-destructive"  style={{ width: `${overdueW}%` }} />}
        {outstandW > 0 && <span className="block h-full bg-warning"      style={{ width: `${outstandW}%` }} />}
        {paidW     > 0 && <span className="block h-full bg-teal-600"     style={{ width: `${paidW}%` }} />}
        {vacantW   > 0 && <span className="block h-full bg-espresso-300" style={{ width: `${vacantW}%` }} />}
      </div>
    </div>
  );
}

// ── Unit action menu ──────────────────────────────────────────────────────────
function UnitActionMenu({ unit, propertyId }: { unit: UnitDetailItem; propertyId: string }) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [reminderSentAt, setReminderSentAt] = useState<Date | null>(null);
  const leaseId = unit.lease?.id ?? "";

  const markPaid = useMarkPaid(leaseId);
  const sendReminder = useSendReminder(leaseId);

  const periodMonth = unit.currentPeriodMonth;
  if (unit.paymentStatus === "paid" || !leaseId || !periodMonth) return null;

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) +
    ", " +
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const items = [
    ...(unit.paymentStatus === "overdue" ? [{
      label: "Send reminder",
      sublabel: reminderSentAt ? `Last sent ${formatTime(reminderSentAt)}` : undefined,
      disabled: reminderSentAt !== null || sendReminder.isPending,
      loading: sendReminder.isPending,
      onClick: () => sendReminder.mutate(
        { periodMonth },
        {
          onSuccess: () => {
            setReminderSentAt(new Date());
            showToast(`Reminder sent to ${unit.tenant?.name ?? "tenant"}.`, "success");
          },
          onError: (err) => showToast((err as Error).message ?? "Failed to send reminder.", "error"),
        },
      ),
    }] : []),
    ...(unit.paymentStatus === "overdue" || unit.paymentStatus === "outstanding" ? [{
      label: "Mark as paid",
      loading: markPaid.isPending,
      onClick: () => markPaid.mutate(
        { periodMonth },
        {
          onSuccess: () => {
            showToast("Payment marked as paid.", "success");
            // Optimistically flip this unit to paid in the property detail cache
            queryClient.setQueryData<PropertyDetailData>(
              propertyDetailKey(propertyId),
              (old) => old ? {
                ...old,
                units: old.units.map((u) =>
                  u.id === unit.id ? { ...u, paymentStatus: "paid", currentPeriodMonth: null } : u
                ),
              } : old,
            );
            queryClient.invalidateQueries({ queryKey: MANAGER_DASHBOARD_KEY });
            queryClient.invalidateQueries({ queryKey: propertyDetailKey(propertyId) });
          },
          onError: (err) => showToast((err as Error).message ?? "Failed to mark as paid.", "error"),
        },
      ),
    }] : []),
    ...(unit.paymentStatus === "vacant" ? [{
      label: "Add lease",
      onClick: () => {},
    }] : []),
  ];

  return (
    <div className="flex justify-end">
      <RowMenu items={items} />
    </div>
  );
}

// ── Unit sub-rows (fetched on expand) ─────────────────────────────────────────
function UnitRows({ propertyId, onNav }: { propertyId: string; onNav: (unitId: string) => void }) {
  const { data, isLoading } = usePropertyDetail(propertyId);

  if (isLoading) {
    return (
      <>
        {[1, 2, 3].map((i) => (
          <tr key={i} className="border-t border-sand-200 bg-sand-100/50">
            <td />
            <td className="px-4 py-3"><Skeleton className="h-3 w-14" /></td>
            <td className="px-4 py-3"><Skeleton className="h-3 w-28" /></td>
            <td className="px-4 py-3 text-right"><Skeleton className="h-3 w-16 ml-auto" /></td>
            <td className="px-4 py-3 text-right"><Skeleton className="h-5 w-20 ml-auto rounded-full" /></td>
            <td className="px-4 py-3 text-right"><Skeleton className="h-3 w-20 ml-auto" /></td>
          </tr>
        ))}
      </>
    );
  }

  if (!data?.units.length) {
    return (
      <tr className="border-t border-sand-200 bg-sand-100/50">
        <td colSpan={6} className="px-8 py-3 text-[13px] text-muted-foreground italic">
          No units found
        </td>
      </tr>
    );
  }

  return (
    <>
      {data.units.map((unit: UnitDetailItem) => (
        <tr
          key={unit.id}
          onClick={() => onNav(unit.id)}
          className="border-t border-sand-200 bg-sand-100/40 hover:bg-coral-50/60 cursor-pointer transition-colors"
        >
          {/* indent spacer */}
          <td />
          {/* unit label */}
          <td className="px-4 py-2.5">
            <span className="font-mono text-[12px] font-semibold text-espresso-700 bg-white border border-sand-400 px-2 py-0.5 rounded">
              {unit.label}
            </span>
          </td>
          {/* tenant */}
          <td className="px-4 py-2.5">
            {unit.tenant ? (
              <span className="text-[13px] font-medium text-maroon-600">{unit.tenant.name}</span>
            ) : (
              <span className="text-[13px] text-espresso-300 italic">Vacant</span>
            )}
          </td>
          {/* rent */}
          <td className="px-4 py-2.5 text-right">
            {unit.lease ? (
              <span className="text-[13px] font-semibold tabular-nums">
                ${unit.lease.monthlyRent.toLocaleString()}
                <span className="text-muted-foreground font-normal text-[11px]">/mo</span>
              </span>
            ) : (
              <span className="text-espresso-300 text-[13px]">—</span>
            )}
          </td>
          {/* status — right aligned */}
          <td className="px-4 py-2.5 text-right">
            <div className="flex justify-end">
              <Badge
                variant={
                  unit.paymentStatus === "overdue" ? "overdue"
                  : unit.paymentStatus === "outstanding" ? "outstanding"
                  : unit.paymentStatus === "paid" ? "paid"
                  : "vacant"
                }
                size="sm"
              >
                {unit.paymentStatus === "vacant" ? "Vacant"
                  : unit.paymentStatus === "overdue" ? "Overdue"
                  : unit.paymentStatus === "outstanding" ? "Outstanding"
                  : "Paid"}
              </Badge>
            </div>
          </td>
          {/* action */}
          <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
            <UnitActionMenu unit={unit} propertyId={propertyId} />
          </td>
        </tr>
      ))}
    </>
  );
}

// ── Property row ──────────────────────────────────────────────────────────────
function PropertyRow({
  property,
  expanded,
  onToggle,
  onUnitNav,
}: {
  property: PropertySummary;
  expanded: boolean;
  onToggle: () => void;
  onUnitNav: (unitId: string) => void;
}) {
  const isUrgent = property.status === "overdue";

  return (
    <>
      <tr
        className={[
          "border-t border-sand-200 cursor-pointer transition-colors group",
          isUrgent ? "border-l-[3px] border-l-destructive hover:bg-coral-50" : "hover:bg-coral-50/40",
        ].join(" ")}
        onClick={onToggle}
      >
        {/* empty first cell — toggle moved to end */}
        <td />
        {/* property name + address */}
        <td className="px-4 py-4">
          <div className="font-semibold text-espresso-900 text-[14px]">{property.name}</div>
          <div className="text-[12.5px] text-muted-foreground mt-0.5">{property.address}</div>
        </td>
        {/* units occupancy */}
        <td className="px-4 py-4">
          <span className="text-[14px]">
            <span className="font-semibold">{property.leasedCount}/{property.unitCount}</span>
            <span className="text-muted-foreground text-[12.5px] ml-1">occupied</span>
          </span>
        </td>
        {/* rent */}
        <td className="px-4 py-4 text-right">
          {property.totalRent > 0 ? (
            <span className="font-semibold tabular-nums text-[14px]">
              ${property.totalRent.toLocaleString()}
              <span className="text-muted-foreground font-normal text-[12px]">/mo</span>
            </span>
          ) : (
            <span className="text-espresso-300">—</span>
          )}
        </td>
        {/* status mix bar — right aligned */}
        <td className="px-4 py-4 text-right">
          <StatusMixBar property={property} />
        </td>
        {/* expand toggle at end */}
        <td className="px-4 py-4 text-right">
          <div className="flex justify-end">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground group-hover:bg-sand-200 transition-colors">
              {expanded
                ? <ChevronDown className="h-3.5 w-3.5" />
                : <ChevronRight className="h-3.5 w-3.5" />}
            </div>
          </div>
        </td>
      </tr>

      {/* expanded unit sub-rows */}
      {expanded && (
        <UnitRows
          propertyId={property.id}
          onNav={(unitId) => onUnitNav(unitId)}
        />
      )}
    </>
  );
}

// ── Group header row ──────────────────────────────────────────────────────────
const GROUP_DOT: Record<string, string> = {
  overdue:     "bg-destructive",
  outstanding: "bg-warning",
  paid:        "bg-teal-600",
  vacant:      "bg-espresso-300",
};

function GroupHeaderRow({ label, count, urgency }: { label: string; count: number; urgency: string }) {
  return (
    <tr className="bg-sand-100">
      <td colSpan={6} className="px-4 py-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${GROUP_DOT[urgency] ?? "bg-espresso-300"}`} />
          <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-espresso-700">
            {label}
          </span>
          <span className="text-[11.5px] text-muted-foreground">· {count}</span>
        </div>
      </td>
    </tr>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function PropertiesListSkeleton() {
  return (
    <div className="p-8 max-w-[1180px] space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="rounded-xl border border-sand-400 bg-white overflow-hidden">
        <div className="bg-sand-100 px-5 py-3 flex gap-4">
          {[200, 80, 80, 120, 40].map((w, i) => (
            <Skeleton key={i} className={`h-3 w-[${w}px]`} />
          ))}
        </div>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="px-5 py-4 border-t border-sand-200 flex gap-4 items-center">
            {[160, 80, 80, 110, 24].map((w, j) => (
              <Skeleton key={j} className={`h-3 w-[${w}px]`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────
const GROUPS = [
  { key: "overdue",     label: "Overdue",     urgency: "overdue" },
  { key: "outstanding", label: "Outstanding", urgency: "outstanding" },
  { key: "paid",        label: "Paid",        urgency: "paid" },
  { key: "vacant",      label: "Vacant",      urgency: "vacant" },
] as const;

export function PropertiesList() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useManagerDashboard();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  if (isLoading) return <PropertiesListSkeleton />;
  if (isError) return <ErrorState message={(error as Error)?.message ?? "Failed to load properties."} onRetry={() => refetch()} />;
  if (!data) return <EmptyState title="No properties" description="No properties found." icon="building" />;

  const { properties } = data;
  const overdueCount = properties.filter((p) => p.status === "overdue").length;
  const vacantCount  = properties.filter((p) => p.status === "vacant").length;

  const grouped: Record<string, PropertySummary[]> = { overdue: [], outstanding: [], paid: [], vacant: [] };
  for (const p of properties) {
    (grouped[p.status] ?? grouped.paid).push(p);
  }

  return (
    <div className="p-8 max-w-[1180px]">
      <div className="mb-8">
        <h1 className="font-serif text-[36px] font-semibold leading-[1.1] tracking-[-0.01em] text-maroon-600">
          Properties
        </h1>
        <p className="text-muted-foreground mt-1">
          {properties.length} properties
          {overdueCount > 0 && (
            <> · <span className="text-destructive font-medium">{overdueCount} overdue</span></>
          )}
          {vacantCount > 0 && <> · {vacantCount} vacant</>}
        </p>
      </div>

      {properties.length === 0 ? (
        <EmptyState title="No properties yet" description="Add your first property to get started." icon="building" />
      ) : (
        <div className="rounded-xl border border-sand-400 bg-white overflow-x-auto shadow-sm">
          <table className="w-full table-fixed min-w-[700px]">
            <colgroup>
              <col style={{ width: "32px" }} />
              <col style={{ width: "33%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "29%" }} />
              <col style={{ width: "48px" }} />
            </colgroup>
            <thead>
              <tr className="bg-sand-100 border-b border-sand-400">
                <th />
                <th className="px-4 py-3 text-left text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Property</th>
                <th className="px-4 py-3 text-left text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Units</th>
                <th className="px-4 py-3 text-right text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Rent/mo</th>
                <th className="px-4 py-3 text-right text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {GROUPS.filter((g) => grouped[g.key]?.length > 0).map((g) => (
                <>
                  <GroupHeaderRow key={`group-${g.key}`} label={g.label} count={grouped[g.key].length} urgency={g.urgency} />
                  {grouped[g.key].map((p) => (
                    <PropertyRow
                      key={p.id}
                      property={p}
                      expanded={expanded.has(p.id)}
                      onToggle={() => toggle(p.id)}
                      onUnitNav={(unitId) => router.push(`/manager/properties/${p.id}/units/${unitId}`)}
                    />
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
