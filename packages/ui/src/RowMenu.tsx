"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, Loader2 } from "lucide-react";

export interface RowMenuItem {
  label: string;
  sublabel?: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "default" | "danger";
}

interface Props {
  items: RowMenuItem[];
}

interface DropdownPos {
  top?: number;
  bottom?: number;
  right: number;
}

export function RowMenu({ items }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<DropdownPos | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!buttonRef.current?.contains(target) && !dropdownRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open]);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const rightOffset = window.innerWidth - rect.right;
      setPos(
        spaceBelow < 160
          ? { bottom: window.innerHeight - rect.top + 4, right: rightOffset }
          : { top: rect.bottom + 4, right: rightOffset },
      );
    }
    setOpen((v) => !v);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleOpen}
        aria-label="Row actions"
        className="flex h-7 w-7 items-center justify-center rounded-md text-espresso-300 hover:bg-sand-200 hover:text-espresso-700 transition-colors duration-fast"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && pos &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{ position: "fixed", top: pos.top, bottom: pos.bottom, right: pos.right }}
            className="z-dropdown w-fit min-w-[160px] rounded-xl border border-sand-400 bg-white py-1 shadow-md"
          >
            {items.map((item) => (
              <button
                key={item.label}
                disabled={item.disabled}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  item.onClick();
                  setOpen(false);
                }}
                className={[
                  "flex w-full items-center gap-2 px-4 py-2.5 text-left text-[13.5px] font-medium transition-colors disabled:opacity-40",
                  item.variant === "danger"
                    ? "text-destructive hover:bg-destructive-bg"
                    : "text-espresso-700 hover:bg-sand-100",
                ].join(" ")}
              >
                <span className="flex flex-col items-start">
                  <span className="flex items-center gap-2">
                    {item.label}
                    {item.loading && <Loader2 className="h-3.5 w-3.5 animate-spin opacity-60" />}
                  </span>
                  {item.sublabel && (
                    <span className="text-[12px] font-normal text-muted-foreground">{item.sublabel}</span>
                  )}
                </span>
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
