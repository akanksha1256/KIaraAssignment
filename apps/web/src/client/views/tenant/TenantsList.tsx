"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAllTenants, useCreateTenant } from "@repo/data";
import { ErrorState } from "@/client/views/ErrorScreen";
import { EmptyState } from "@/client/views/EmptyScreen";
import { Badge, SectionTitle, MutedText, useToast } from "@repo/ui";
import { TenantsListSkeleton } from "./TenantsListLoadingScreen";
import { strings } from "@repo/tokens";
import type { TenantListItem } from "@repo/data";
import { ShieldCheck, Clock, ShieldOff, ChevronRight, Plus, X } from "lucide-react";

const s = strings.manager.tenantsList;
const sa = strings.manager.tenantsList.addTenant;
const sc = strings.common;

const KYC_ICON: Record<string, React.ReactNode> = {
  verified: <ShieldCheck className="h-3.5 w-3.5" />,
  pending: <Clock className="h-3.5 w-3.5" />,
  not_submitted: <ShieldOff className="h-3.5 w-3.5" />,
};

const KYC_CLASS: Record<string, string> = {
  verified: "text-teal-700 bg-teal-50 border border-teal-200",
  pending: "text-warning bg-amber-50 border border-amber-200",
  not_submitted: "text-muted-foreground bg-sand-100 border border-sand-300",
};

const KYC_LABEL: Record<string, string> = {
  verified: "Verified",
  pending: "Pending",
  not_submitted: "Not submitted",
};

// ── Add tenant modal ─────────────────────────────────────────────────────────
const AddTenantModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { showToast } = useToast();
  const createTenant = useCreateTenant();
  const overlayRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) { setName(""); setEmail(""); setContact(""); setErrors({}); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const inputCls = (field: string) =>
    `h-10 w-full rounded-lg border px-3 text-[13.5px] text-espresso-900 bg-white placeholder:text-espresso-300 focus:outline-none focus:ring-2 focus:ring-coral-500/30 transition-colors ${
      errors[field] ? "border-destructive" : "border-sand-400"
    }`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = sc.validation.required;
    if (!email.trim()) errs.email = sc.validation.required;
    if (Object.keys(errs).length) { setErrors(errs); return; }

    createTenant.mutate(
      { name: name.trim(), email: email.trim(), contact: contact.trim() },
      {
        onSuccess: () => {
          showToast(sa.successToast(name.trim()), "success");
          onClose();
        },
        onError: (err) => showToast((err as Error).message ?? sa.failedToast, "error"),
      },
    );
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onMouseDown={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="relative w-full max-w-[440px] mx-4 bg-white rounded-2xl shadow-2xl border border-sand-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-sand-200 flex-none">
          <div>
            <p className="font-serif text-[20px] font-semibold text-maroon-600">{sa.title}</p>
            <MutedText className="mt-0.5">{sa.subtitle}</MutedText>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-espresso-900 hover:bg-sand-100 transition-colors mt-0.5">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form id="add-tenant-form" onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 flex-1 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[12.5px] font-semibold text-espresso-700">{sa.fieldName}</label>
            <input
              type="text" value={name}
              onChange={(e) => { setName(e.target.value); setErrors((er) => ({ ...er, name: "" })); }}
              placeholder={sa.fieldNamePlaceholder}
              className={inputCls("name")} disabled={createTenant.isPending}
            />
            {errors.name && <p className="text-[11.5px] text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-[12.5px] font-semibold text-espresso-700">{sa.fieldEmail}</label>
            <input
              type="email" value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((er) => ({ ...er, email: "" })); }}
              placeholder={sa.fieldEmailPlaceholder}
              className={inputCls("email")} disabled={createTenant.isPending}
            />
            {errors.email && <p className="text-[11.5px] text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-[12.5px] font-semibold text-espresso-700">{sa.fieldContact}</label>
            <input
              type="text" value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder={sa.fieldContactPlaceholder}
              className={inputCls("contact")} disabled={createTenant.isPending}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-sand-200 flex-none">
          <button type="button" onClick={onClose} disabled={createTenant.isPending}
            className="h-9 px-4 rounded-lg border border-sand-400 text-[13px] font-medium text-espresso-700 hover:bg-sand-100 transition-colors disabled:opacity-50">
            {sa.cancel}
          </button>
          <button type="submit" form="add-tenant-form" disabled={createTenant.isPending}
            className="h-9 px-5 rounded-lg bg-coral-500 hover:bg-coral-600 text-white text-[13px] font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {createTenant.isPending ? sa.submitting : sa.submit}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Tenant row ────────────────────────────────────────────────────────────────
const TenantRow = ({ item }: { item: TenantListItem }) => {
  const router = useRouter();
  const { tenant, lease, unit, property, paymentStatus } = item;
  const kycClass = KYC_CLASS[tenant.kycStatus] ?? KYC_CLASS.not_submitted;

  return (
    <tr
      onClick={() => router.push(`/manager/tenants/${tenant.id}`)}
      className="border-t border-sand-200 hover:bg-coral-50/50 cursor-pointer transition-colors group"
    >
      {/* Avatar + name */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral-500 to-maroon-600 text-white grid place-items-center text-[12px] font-semibold flex-none select-none">
            {tenant.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <div className="text-[13.5px] font-semibold text-espresso-900 leading-tight">
              {tenant.name}
            </div>
            <div className="text-[12px] text-muted-foreground">{tenant.email}</div>
          </div>
        </div>
      </td>

      {/* Property / unit */}
      <td className="px-5 py-3.5">
        {property && unit ? (
          <div>
            <div className="text-[13px] font-medium text-espresso-900">{property.name}</div>
            <div className="text-[12px] text-muted-foreground font-mono">{unit.label}</div>
          </div>
        ) : (
          <MutedText className="italic">{s.noActiveLease}</MutedText>
        )}
      </td>

      {/* Rent */}
      <td className="px-5 py-3.5 text-right">
        {lease ? (
          <span className="text-[13px] font-semibold tabular-nums">
            ${lease.monthlyRent.toLocaleString()}
            <span className="text-muted-foreground font-normal text-[11px]">/mo</span>
          </span>
        ) : (
          <span className="text-espresso-300 text-[13px]">—</span>
        )}
      </td>

      {/* Payment status */}
      <td className="px-5 py-3.5 text-right">
        <div className="flex justify-end">
          <Badge
            variant={
              paymentStatus === "overdue"
                ? "overdue"
                : paymentStatus === "outstanding"
                  ? "outstanding"
                  : paymentStatus === "paid"
                    ? "paid"
                    : "vacant"
            }
            size="sm"
          >
            {paymentStatus === "vacant"
              ? "No lease"
              : paymentStatus === "overdue"
                ? "Overdue"
                : paymentStatus === "outstanding"
                  ? "Outstanding"
                  : "Paid"}
          </Badge>
        </div>
      </td>

      {/* KYC */}
      <td className="px-5 py-3.5 text-right">
        <div className="flex justify-end">
          <span
            className={`inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full ${kycClass}`}
          >
            {KYC_ICON[tenant.kycStatus]}
            {KYC_LABEL[tenant.kycStatus]}
          </span>
        </div>
      </td>

      {/* Chevron */}
      <td className="px-4 py-3.5 text-right w-10">
        <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:text-maroon-600 transition-colors" />
      </td>
    </tr>
  );
}


export const TenantsList = () => {
  const { data, isLoading, isError, error, refetch } = useAllTenants();
  const [addOpen, setAddOpen] = useState(false);

  if (isLoading) return <TenantsListSkeleton />;
  if (isError)
    return <ErrorState message={(error as Error)?.message ?? s.error} onRetry={() => refetch()} />;
  if (!data)
    return <EmptyState title={s.emptyTitle} description={s.emptyDescription} icon="inbox" />;

  const overdueCount = data.filter((t) => t.paymentStatus === "overdue").length;
  const pendingKyc = data.filter((t) => t.tenant.kycStatus !== "verified").length;

  return (
    <>
      <AddTenantModal open={addOpen} onClose={() => setAddOpen(false)} />
    <div className="p-8 max-w-[1180px]">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <SectionTitle>{s.title}</SectionTitle>
          <MutedText className="mt-1">
            {data.length} tenant{data.length !== 1 ? "s" : ""}
            {overdueCount > 0 && (
              <>
                {" "}
                · <span className="text-destructive font-medium">{overdueCount} overdue</span>
              </>
            )}
            {pendingKyc > 0 && <> · {pendingKyc} KYC pending</>}
          </MutedText>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-coral-500 hover:bg-coral-600 text-white text-[13px] font-semibold transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          {s.addTenantButton}
        </button>
      </div>

      {data.length === 0 ? (
        <EmptyState title={s.emptyTitle} description={s.emptyDescription} icon="inbox" />
      ) : (
        <div className="rounded-xl border border-sand-400 bg-white overflow-x-auto shadow-sm">
          <table className="w-full table-fixed min-w-[700px]">
            <colgroup>
              <col style={{ width: "28%" }} />
              <col style={{ width: "22%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "17%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "40px" }} />
            </colgroup>
            <thead>
              <tr className="bg-sand-100 border-b border-sand-400">
                <th className="px-5 py-3 text-left text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  Tenant
                </th>
                <th className="px-5 py-3 text-left text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  Property / Unit
                </th>
                <th className="px-5 py-3 text-right text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  Rent/mo
                </th>
                <th className="px-5 py-3 text-right text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  Payment
                </th>
                <th className="px-5 py-3 text-right text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  KYC
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <TenantRow key={item.tenant.id} item={item} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </>
  );
}
