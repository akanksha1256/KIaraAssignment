import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { strings } from "@repo/tokens";
import { User, ExternalLink } from "lucide-react";
import type { Tenant } from "@repo/data";

const s = strings.manager.unitDetail.tenant;

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-3 py-3 border-b border-sand-200 last:border-0">
    <span className="text-[13px] text-muted-foreground shrink-0">{label}</span>
    <span className="text-[13px] font-medium text-espresso-900 text-right">{value}</span>
  </div>
);

export const TenantCard = ({ tenant }: { tenant: Tenant | null }) => {
  const router = useRouter();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[15px]">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-none">
            <User className="h-4 w-4 text-teal-700" />
          </div>
          {s.heading}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tenant ? (
          <>
            <DetailRow label={s.name} value={tenant.name} />
            <DetailRow label={s.email} value={tenant.email} />
            <DetailRow label={s.contact} value={tenant.contact} />
            <div className="pt-3">
              <button
                onClick={() => router.push(`/manager/tenants/${tenant.id}`)}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-maroon-600 hover:bg-sand-100 px-2.5 py-1 rounded-full transition-colors -ml-2.5"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {s.viewProfile}
              </button>
            </div>
          </>
        ) : (
          <p className="text-[13px] text-muted-foreground">{s.noTenant}</p>
        )}
      </CardContent>
    </Card>
  );
};
