import * as React from "react";
import { cn } from "./utils";

export const PageTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h1
    className={cn(
      "font-serif text-[40px] font-semibold leading-[1.1] tracking-[-0.01em] text-maroon-600",
      className,
    )}
    {...props}
  />
);

export const SectionTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2
    className={cn(
      "font-serif text-[36px] font-semibold leading-[1.1] tracking-[-0.01em] text-maroon-600",
      className,
    )}
    {...props}
  />
);

export const SubpageTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h1
    className={cn(
      "font-serif text-[32px] font-semibold leading-[1.1] tracking-[-0.01em] text-maroon-600",
      className,
    )}
    {...props}
  />
);

export const ModalHeading = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2
    className={cn(
      "font-serif text-[28px] font-semibold leading-tight text-espresso-900",
      className,
    )}
    {...props}
  />
);

export const StateTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn("font-serif text-[22px] font-semibold text-espresso-900", className)}
    {...props}
  />
);

export const StatValue = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn("text-[24px] font-semibold tabular-nums text-espresso-900", className)}
    {...props}
  />
);

export const MetricValue = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn("text-[22px] font-semibold tracking-tight text-espresso-900", className)}
    {...props}
  />
);

export const MetricCount = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("text-[20px] font-semibold text-espresso-900", className)} {...props} />
);

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-[18px] font-semibold text-espresso-900", className)} {...props} />
);

export const LeadText = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-[15px] text-espresso-700", className)} {...props} />
);

export const BodyText = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-[14px] text-espresso-700", className)} {...props} />
);

export const PrimaryLabelMedium = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("text-[14px] font-medium text-espresso-900", className)} {...props} />
);

export const PrimaryLabelSemibold = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("text-[14px] font-semibold text-espresso-900", className)} {...props} />
);

export const MutedText = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-[13px] text-muted-foreground", className)} {...props} />
);

export const Caption = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("text-[12.5px] text-muted-foreground", className)} {...props} />
);

export const FieldLabel = ({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label
    className={cn("block text-[12.5px] font-semibold text-espresso-700", className)}
    {...props}
  />
);

export const MoneyText = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("t-money", className)} {...props} />
);

export const StatusLabel = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("text-[11.5px] font-medium", className)} {...props} />
);

export const LinkText = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("text-[13.5px] font-medium text-maroon-600", className)} {...props} />
);

export const Overline = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      "text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground",
      className,
    )}
    {...props}
  />
);
