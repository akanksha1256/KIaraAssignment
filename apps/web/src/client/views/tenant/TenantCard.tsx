import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/client/commonComponents/Card";
import { strings } from "@/client/designSystems/strings";
import { User, ExternalLink } from "lucide-react";
import type { Tenant } from "@/client/stateManagement/tenant/type";

const s = strings.manager.unitDetail.tenant;

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between py-3 border-b border-neutral-100 last:border-0">
    <span className="text-sm text-neutral-500">{label}</span>
    <span className="text-sm font-medium text-neutral-900">{value}</span>
  </div>
);

export const TenantCard = ({ tenant }: { tenant: Tenant | null }) => {
  const router = useRouter();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-4 w-4 text-neutral-400" />
          {s.heading}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tenant ? (
          <>
            <DetailRow label={s.name} value={tenant.name} />
            <DetailRow label={s.contact} value={tenant.contact} />
            <div className="pt-3">
              <button
                onClick={() => router.push(`/manager/tenants/${tenant.id}`)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {s.viewProfile}
              </button>
            </div>
          </>
        ) : (
          <p className="text-sm text-neutral-400">{s.noTenant}</p>
        )}
      </CardContent>
    </Card>
  );
};
