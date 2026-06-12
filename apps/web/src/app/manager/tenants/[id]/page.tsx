import { TenantProfile } from "@/client/views/tenant/TenantProfile";

interface Props {
  params: { id: string };
}

export default function TenantProfilePage({ params }: Props) {
  return <TenantProfile tenantId={params.id} />;
}
