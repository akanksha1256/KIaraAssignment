import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui";
import { User } from "lucide-react";
import { strings } from "@repo/tokens";
import type { Property } from "@repo/data";

const s = strings.tenant.managerInfo;

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between py-2.5 border-b border-neutral-100 last:border-0">
    <span className="text-sm text-neutral-500">{label}</span>
    <span className="text-sm font-medium text-neutral-900">{value}</span>
  </div>
);

interface Props {
  property: Property | null;
}

export const ManagerInfoCard = ({ property }: Props) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-base">
        <User className="h-4 w-4 text-neutral-400" />
        {s.heading}
      </CardTitle>
    </CardHeader>
    <CardContent>
      {property ? (
        <>
          <Row label={s.name} value={property.managerName} />
          <Row label={s.email} value={property.managerEmail} />
          <Row label={s.contact} value={property.managerContact} />
        </>
      ) : (
        <p className="text-sm text-neutral-400">{s.noManager}</p>
      )}
    </CardContent>
  </Card>
);
