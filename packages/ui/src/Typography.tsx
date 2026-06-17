import * as React from "react";
import { cn } from "./utils";

export function PageTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        "font-serif text-[40px] font-semibold leading-[1.1] tracking-[-0.01em] text-maroon-600",
        className,
      )}
      {...props}
    />
  );
}

export function SectionTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "font-serif text-[36px] font-semibold leading-[1.1] tracking-[-0.01em] text-maroon-600",
        className,
      )}
      {...props}
    />
  );
}

export function SubpageTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        "font-serif text-[32px] font-semibold leading-[1.1] tracking-[-0.01em] text-maroon-600",
        className,
      )}
      {...props}
    />
  );
}

export function ModalHeading({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "font-serif text-[28px] font-semibold leading-tight text-espresso-900",
        className,
      )}
      {...props}
    />
  );
}

export function StateTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-serif text-[22px] font-semibold text-espresso-900", className)}
      {...props}
    />
  );
}

export function MetricValue({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("text-[22px] font-semibold tracking-tight text-espresso-900", className)}
      {...props}
    />
  );
}

export function MetricCount({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("text-[20px] font-semibold text-espresso-900", className)} {...props} />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-[18px] font-semibold text-espresso-900", className)} {...props} />;
}

export function LeadText({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-[15px] text-espresso-700", className)} {...props} />;
}

export function BodyText({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-[14px] text-espresso-700", className)} {...props} />;
}

export function PrimaryLabelMedium({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-[14px] font-medium text-espresso-900", className)} {...props} />;
}

export function PrimaryLabelSemibold({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("text-[14px] font-semibold text-espresso-900", className)} {...props} />
  );
}
export function MutedText({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-[13px] text-muted-foreground", className)} {...props} />;
}

export function Caption({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-[12.5px] text-muted-foreground", className)} {...props} />;
}

export function MoneyText({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("t-money", className)} {...props} />;
}

export function StatusLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-[11.5px] font-medium", className)} {...props} />;
}
export function LinkText({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("text-[13.5px] font-medium text-maroon-600", className)} {...props} />;
}

export function Overline({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
