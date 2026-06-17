"use client";

const GROUP_DOT: Record<string, string> = {
  overdue: "bg-destructive",
  outstanding: "bg-warning",
  paid: "bg-teal-600",
  vacant: "bg-espresso-300",
};

export const GroupHeaderRow = ({
  label,
  count,
  urgency,
}: {
  label: string;
  count: number;
  urgency: string;
}) => (
  <tr className="bg-sand-100">
    <td colSpan={6} className="px-4 py-2">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${GROUP_DOT[urgency] ?? "bg-espresso-300"}`} />
        <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-espresso-700">
          {label}
        </span>
        <span className="text-[11.5px] text-muted-foreground">· {count}</span>
      </div>
    </td>
  </tr>
);
