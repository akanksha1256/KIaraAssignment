"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function navClass(active: boolean) {
  return active
    ? "rounded-md bg-white px-4 py-1.5 text-sm font-medium text-neutral-900 shadow-sm"
    : "rounded-md px-4 py-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-700";
}

export function Nav() {
  const pathname  = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-neutral-900">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white text-xs font-bold">R</div>
          RentPortal
        </Link>
        <nav className="flex items-center gap-1 rounded-lg bg-neutral-100 p-1">
          <Link href="/manager" className={navClass(pathname.startsWith("/manager"))}>Manager</Link>
          <Link href="/tenant"  className={navClass(pathname.startsWith("/tenant"))}>Tenant</Link>
        </nav>
      </div>
    </header>
  );
}
