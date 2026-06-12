import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/client/commonComponents/Card";
import { strings } from "@/client/designSystems/strings";
import { FileText, ExternalLink } from "lucide-react";
import type { Lease } from "@/client/stateManagement/managerDashboard/lease/type";
import { formatDate } from "@/client/helpers/utils";

const s = strings.manager.unitDetail.lease;

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between py-3 border-b border-neutral-100 last:border-0">
    <span className="text-sm text-neutral-500">{label}</span>
    <span className="text-sm font-medium text-neutral-900">{value}</span>
  </div>
);

export const ManagerLeaseCard = ({ lease }: { lease: Lease | null }) => (
  <Card className="h-full">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-base">
        <FileText className="h-4 w-4 text-neutral-400" />
        {s.heading}
      </CardTitle>
    </CardHeader>
    <CardContent>
      {lease ? (
        <>
          <DetailRow
            label={s.monthlyRent}
            value={`$${lease.monthlyRent.toLocaleString()}/mo`}
          />
          <DetailRow
            label={s.leasePeriod}
            value={`${formatDate(lease.startDate)} – ${formatDate(lease.endDate)}`}
          />
          <DetailRow label={s.terms} value={lease.terms} />
          <div className="flex justify-between py-3">
            <span className="text-sm text-neutral-500">{s.leaseDocument}</span>
            {lease.leaseDocument ? (
              <a
                href={lease.leaseDocument}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 transition-colors text-sm font-medium"
              >
                {s.leaseDocumentLink}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <span className="text-sm font-medium text-neutral-400">{s.leaseDocumentNone}</span>
            )}
          </div>
        </>
      ) : (
        <p className="text-sm text-neutral-400">{s.noLease}</p>
      )}
    </CardContent>
  </Card>
);
