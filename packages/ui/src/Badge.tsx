import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap",
  {
    variants: {
      variant: {
        overdue: "bg-destructive-bg text-destructive",
        outstanding: "bg-warning-bg text-warning",
        paid: "bg-success-bg text-success",
        vacant: "bg-sand-200 text-espresso-700",
        upcoming: "bg-sky-100 text-sky-700",
        info: "bg-teal-100 text-teal-700",
        default: "bg-sand-200 text-espresso-700",
      },
      size: {
        sm: "px-2.5 py-0.5 text-[11px]",
        default: "px-2.5 py-1 text-[12px]",
        lg: "px-3.5 py-1.5 text-[13px]",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  children?: React.ReactNode;
}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}
