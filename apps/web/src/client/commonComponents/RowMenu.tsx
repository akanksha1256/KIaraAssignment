"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";

export interface RowMenuItem {
  label:     string;
  onClick:   () => void;
  disabled?: boolean;
  variant?:  "default" | "danger";
}

interface Props {
  items: RowMenuItem[];
}

export function RowMenu({ items }: Props) {
  const [open, setOpen]   = useState(false);
  const containerRef      = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 min-w-[160px] rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
          {items.map((item) => (
            <button
              key={item.label}
              disabled={item.disabled}
              onClick={(e) => {
                e.stopPropagation();
                item.onClick();
                setOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm transition-colors disabled:opacity-40
                ${item.variant === "danger"
                  ? "text-danger-600 hover:bg-danger-50"
                  : "text-neutral-700 hover:bg-neutral-50"
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
