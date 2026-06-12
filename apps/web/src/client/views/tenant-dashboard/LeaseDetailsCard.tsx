import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/client/commonComponents/Card";
import { FileText, ExternalLink } from "lucide-react";
import { strings } from "@/client/designSystems/strings";
import { formatDate } from "@/client/helpers/utils";
import type { Lease } from "@/client/types";

const s = strings.tenant.leaseDetails;

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between py-2.5 border-b border-neutral-100 last:border-0">
    <span className="text-sm text-neutral-500">{label}</span>
    <span className="text-sm font-medium text-neutral-900">{value}</span>
  </div>
);

interface Props {
  lease: Lease | null;
}

export const LeaseDetailsCard = ({ lease }: Props) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-base">
        <FileText className="h-4 w-4 text-neutral-400" />
        {s.heading}
      </CardTitle>
    </CardHeader>
    <CardContent>
      {lease ? (
        <>
          <Row label={s.monthlyRent} value={`$${lease.monthlyRent.toLocaleString()}/mo`} />
          <Row label={s.leasePeriod} value={`${formatDate(lease.startDate)} – ${formatDate(lease.endDate)}`} />
          <div className="flex gap-4 py-2.5 border-b border-neutral-100">
            <span className="shrink-0 text-sm text-neutral-500">{s.terms}</span>
            <span className="ml-auto text-right text-sm font-medium text-neutral-900">{lease.terms}</span>
          </div>
          <div className="flex justify-between py-2.5">
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
              <span className="text-sm font-medium text-neutral-400">
                {s.leaseDocumentNone}
              </span>
            )}
          </div>
        </>
      ) : (
        <p className="text-sm text-neutral-400">{s.noLease}</p>
      )}
    </CardContent>
  </Card>
);
