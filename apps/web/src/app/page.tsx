import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-24 text-center">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">RentPortal</h1>
        <p className="mt-2 text-neutral-500">A rent management portal.</p>
      </div>
      <div className="flex gap-4">
        <Link href="/manager" className="rounded-md bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700">
          Manager View
        </Link>
        <Link href="/tenant" className="rounded-md border border-neutral-200 bg-white px-6 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50">
          Tenant View
        </Link>
      </div>
    </div>
  );
}
