import type { PropertySummary } from "@/client/stateManagement/property/type";
import { statusConfig } from "@/client/views/manager/dashboard/util";

export const Pill = ({ status }: { status: PropertySummary["status"] }) => {
  const { bg, text, label } = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${bg} ${text}`}
    >
      {label}
    </span>
  );
};
