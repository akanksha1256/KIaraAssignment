import { Card, CardContent, CardHeader, CardTitle, MutedText, LinkText } from "@repo/ui";
import { strings } from "@repo/tokens";
import { FileText as FileTextIcon, ExternalLink as ExternalLinkIcon } from "lucide-react";
import type { Lease, Unit, Property } from "@repo/data";
import { formatDate } from "@repo/ui";

const s = strings.manager.tenantProfile.lease;

interface Props {
  lease: Lease | null;
  unit: Unit | null;
  property: Property | null;
}

export const TenantCurrentLeaseCard = ({ lease, unit, property }: Props) => (
  <Card className="h-full">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-[15px]">
        <div className="w-8 h-8 rounded-full bg-sand-200 flex items-center justify-center flex-none">
          <FileTextIcon className="h-4 w-4 text-espresso-700" />
        </div>
        {s.heading}
      </CardTitle>
    </CardHeader>
    <CardContent>
      {lease && property && unit ? (
        <>
          {[
            { label: s.property, value: property.name },
            { label: s.unit, value: unit.label },
            { label: s.monthlyRent, value: `$${lease.monthlyRent.toLocaleString()}/mo` },
            { label: s.leaseDate, value: `${formatDate(lease.startDate)} → ${formatDate(lease.endDate)}` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-3 border-b border-sand-200 last:border-0">
              <MutedText>{label}</MutedText>
              <MutedText className="font-medium text-espresso-900">{value}</MutedText>
            </div>
          ))}
          <div className="flex justify-between py-3">
            <MutedText>{s.leaseDocument}</MutedText>
            {lease.leaseDocument ? (
              <a
                href={lease.leaseDocument}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:underline transition-colors"
              >
                <LinkText className="text-[13px]">{s.leaseDocumentLink}</LinkText>
                <ExternalLinkIcon className="h-3 w-3 text-maroon-600" />
              </a>
            ) : (
              <MutedText className="font-medium">{s.leaseDocumentNone}</MutedText>
            )}
          </div>
        </>
      ) : (
        <MutedText>{s.noLease}</MutedText>
      )}
    </CardContent>
  </Card>
);
