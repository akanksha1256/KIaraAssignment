import { TenantNav } from "@repo/ui";

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <TenantNav />
      <main className="flex-1">{children}</main>
    </div>
  );
}
