"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

function PinwheelIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true" fill="none">
      <path d="M16 16 L16 2 A14 14 0 0 1 30 16 Z" fill="#FF6139" />
      <path d="M16 16 L30 16 A14 14 0 0 1 16 30 Z" fill="#733635" />
      <path d="M16 16 L16 30 A14 14 0 0 1 2 16 Z" fill="#FF6139" opacity=".7" />
      <path d="M16 16 L2 16 A14 14 0 0 1 16 2 Z" fill="#733635" opacity=".7" />
      <circle cx="16" cy="16" r="3.2" fill="#F5F5ED" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function PaymentIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

const managerNav = [
  { href: "/manager", label: "Dashboard", icon: <HomeIcon /> },
  { href: "/manager/properties", label: "Properties", icon: <BuildingIcon /> },
  { href: "/manager/tenants", label: "Tenants", icon: <UsersIcon /> },
  { href: "/manager/payments", label: "Payments", icon: <PaymentIcon /> },
];

export const TenantNav = () => {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-sticky border-b border-sand-400 bg-cream/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-container-xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <PinwheelIcon />
          <span className="font-semibold tracking-[0.12em] text-espresso-900 text-[17px]">KIARA</span>
        </div>
        <button
          onClick={() => router.push("/manager")}
          className="flex items-center gap-2 rounded-full bg-sand-200 px-4 py-2 text-sm font-medium text-espresso-700 hover:bg-sand-400 transition-colors duration-normal"
        >
          Switch to Manager
        </button>
      </div>
    </header>
  );
};

export const Nav = () => {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/") return null;

  return (
    <aside className="w-[56px] md:w-[250px] flex-none bg-cream border-r border-sand-400 sticky top-0 h-screen flex flex-col py-5 px-2 md:px-4 transition-all duration-200">
      {/* Brand */}
      <div className="flex items-center gap-3 px-1 md:px-3 pb-6 justify-center md:justify-start">
        <PinwheelIcon />
        <span className="hidden md:inline font-semibold tracking-[0.12em] text-espresso-900 text-[16px]">KIARA</span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5 flex-1" aria-label="Main navigation">
        <p className="hidden md:block text-[11px] font-semibold tracking-[0.09em] uppercase text-espresso-300 px-3 py-2 mt-2">
          Management
        </p>
        {managerNav.map(({ href, label, icon }) => {
          const active = href === "/manager"
            ? pathname === "/manager"
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={[
                "relative flex items-center gap-3 rounded-md px-2 md:px-3 py-2 font-medium text-[14.5px] transition-colors duration-fast justify-center md:justify-start",
                active
                  ? "bg-coral-50 text-coral-600"
                  : "text-espresso-700 hover:bg-sand-200",
              ].join(" ")}
            >
              {active && (
                <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-[3px] bg-coral-500" />
              )}
              <span className="w-5 h-5 flex items-center justify-center flex-none">{icon}</span>
              <span className="hidden md:flex flex-1">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-sand-400 pt-3 mt-3 flex flex-col gap-3">
        {/* Role switch - full only on md+ */}
        <div className="hidden md:flex bg-sand-200 rounded-full p-[3px]">
          <button
            onClick={() => router.push("/manager")}
            className="flex-1 text-[12.5px] font-medium rounded-full py-1.5 bg-white text-espresso-900 shadow-sm transition-all duration-normal"
          >
            Manager
          </button>
          <button
            onClick={() => router.push("/tenant")}
            className="flex-1 text-[12.5px] font-medium rounded-full py-1.5 text-muted-foreground hover:text-espresso-900 transition-all duration-normal"
          >
            Tenant
          </button>
        </div>
        {/* Role switch - icon-only on small */}
        <button
          onClick={() => router.push("/tenant")}
          title="Switch to Tenant"
          className="md:hidden w-9 h-9 mx-auto rounded-full bg-sand-200 text-espresso-700 hover:bg-sand-400 text-[11px] font-semibold grid place-items-center transition-colors"
        >
          T
        </button>
        {/* Profile */}
        <div className="flex items-center gap-3 px-0.5 md:px-2.5 py-1.5 rounded-md hover:bg-sand-200 cursor-pointer transition-colors duration-fast justify-center md:justify-start">
          <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-coral-500 to-maroon-600 text-white grid place-items-center text-[13px] font-semibold flex-none">
            JC
          </div>
          <div className="hidden md:block flex-1 leading-tight">
            <div className="text-[13.5px] font-semibold text-espresso-900">James Carter</div>
            <div className="text-[11.5px] text-muted-foreground">Manager</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
