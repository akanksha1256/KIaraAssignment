import React from "react";
import { X as XIcon } from "lucide-react";
import { cn } from "./utils";

export const CloseButton = ({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type="button"
    className={cn(
      "p-1.5 rounded-lg text-muted-foreground hover:text-espresso-900 hover:bg-sand-100 transition-colors disabled:opacity-40",
      className,
    )}
    {...props}
  >
    <XIcon className="h-4 w-4" />
  </button>
);
