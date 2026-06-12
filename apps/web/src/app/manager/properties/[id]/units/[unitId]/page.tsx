import { UnitDetail } from "@/client/views/properties/unit/UnitDetail";

interface Props {
  params: { id: string; unitId: string };
}

export default function UnitDetailPage({ params }: Props) {
  return <UnitDetail propertyId={params.id} unitId={params.unitId} />;
}
