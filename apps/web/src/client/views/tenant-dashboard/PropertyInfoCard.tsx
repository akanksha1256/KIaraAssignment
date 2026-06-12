import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/client/commonComponents/Card";
import { Building2 } from "lucide-react";
import { strings } from "@/client/designSystems/strings";
import type { Property } from "@/client/stateManagement/property/type";
import type { Unit } from "@/client/stateManagement/unit/type";

const s = strings.tenant.propertyInfo;

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between py-2.5 border-b border-neutral-100 last:border-0">
    <span className="text-sm text-neutral-500">{label}</span>
    <span className="text-sm font-medium text-neutral-900">{value}</span>
  </div>
);

interface Props {
  property: Property | null;
  unit: Unit | null;
}

export const PropertyInfoCard = ({ property, unit }: Props) => {
  if (!property || !unit) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-neutral-400">
          {s.noProperty}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="h-4 w-4 text-neutral-400" />
          {s.heading}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Row label={s.name} value={property.name} />
        <Row label={s.unit} value={unit.label} />
        <Row label={s.address} value={property.address} />
      </CardContent>
    </Card>
  );
};
