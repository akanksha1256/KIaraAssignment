import { PropertyDetail } from "@/client/views/properties/PropertyDetail";

interface Props {
  params: { id: string };
}

export default function PropertyDetailPage({ params }: Props) {
  return <PropertyDetail propertyId={params.id} />;
}
