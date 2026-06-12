"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";

export interface RowMenuItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
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

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (!buttonRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const rightOffset = window.innerWidth - rect.right;
      if (spaceBelow < 160) {
        setPos({
          bottom: window.innerHeight - rect.top + 4,
          right: rightOffset,
        });
      } else {
        setPos({ top: rect.bottom + 4, right: rightOffset });
      }
    }
    setOpen((v) => !v);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: pos.top,
              bottom: pos.bottom,
              right: pos.right,
            }}
            className="z-50 w-fit rounded-lg border border-neutral-200 bg-white py-1 shadow-lg"
          >
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
                ${
                  item.variant === "danger"
                    ? "text-danger-600 hover:bg-danger-50"
                    : "text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
