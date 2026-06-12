import type { PropertyStatus } from "@repo/data";
import { statusConfig } from "./utils";

export const Pill = ({ status }: { status: PropertyStatus }) => {
  const { bg, text, label } = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${bg} ${text}`}
    >
      {label}
    </span>
  );
};
