import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={twMerge(clsx("animate-spin h-5 w-5 text-coral-500", className))}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// Skeleton shimmer block
export function Skeleton({ className }: { className?: string }) {
  return <div className={twMerge(clsx("skeleton", className))} aria-hidden="true" />;
}
