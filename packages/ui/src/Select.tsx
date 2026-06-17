"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const Select = ({ value, onChange, options, placeholder, className = "", disabled = false }: SelectProps) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !dropdownRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleOpen = () => {
    if (disabled || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow < 260) {
      setPos({ top: rect.top - Math.min(240, options.length * 36 + 8) - 4, left: rect.left, width: rect.width });
    } else {
      setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    setOpen((v) => !v);
  };

  const selected = options.find((o) => o.value === value);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className={`h-9 w-full flex items-center justify-between gap-2 px-3 rounded-lg border border-sand-400 bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-coral-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          value ? "text-espresso-900" : "text-muted-foreground"
        } ${className}`}
      >
        <span className="truncate">{selected?.label ?? placeholder ?? "Select…"}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 flex-none text-muted-foreground transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{ position: "fixed", top: pos.top, left: pos.left, width: pos.width }}
            className="z-[9999] bg-white rounded-xl border border-sand-400 shadow-lg py-1 max-h-[240px] overflow-y-auto"
          >
            {placeholder && (
              <div className="px-3 py-2 text-[13px] text-muted-foreground select-none">
                {placeholder}
              </div>
            )}
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={opt.disabled}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-[13px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  opt.value === value
                    ? "text-coral-600 bg-coral-50 font-medium"
                    : "text-espresso-800 hover:bg-sand-100"
                }`}
              >
                <span>{opt.label}</span>
                {opt.value === value && <Check className="h-3.5 w-3.5 text-coral-500 flex-none" />}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
};
