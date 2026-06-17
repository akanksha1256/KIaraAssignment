import React from "react";
import { cn } from "./utils";
import { FieldLabel } from "./Typography";
import { StatusLabel } from "./Typography";

const inputCls = (error?: string, prefix?: string, className?: string) =>
  cn(
    "h-10 w-full rounded-lg border px-3 text-[13.5px] text-espresso-900 bg-white",
    "placeholder:text-espresso-300 focus:outline-none focus:ring-2 focus:ring-coral-500/30 transition-colors",
    prefix && "pl-6",
    error ? "border-destructive" : "border-sand-400",
    className,
  );

export const LabeledTextField = ({
  label,
  error,
  prefix,
  id,
  onChange,
  className,
  ...inputProps
}: {
  label: string;
  error?: string;
  prefix?: string;
  onChange?: (value: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) => {
  const input = (
    <input
      id={id}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      className={inputCls(error, prefix, className)}
      {...inputProps}
    />
  );

  return (
    <div className="space-y-1.5">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {prefix ? (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13.5px] text-muted-foreground">
            {prefix}
          </span>
          {input}
        </div>
      ) : (
        input
      )}
      {error && <StatusLabel className="text-destructive">{error}</StatusLabel>}
    </div>
  );
};
