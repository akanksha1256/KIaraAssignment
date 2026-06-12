interface TooltipItem {
  name: string;
  value: number;
  fill: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipItem[];
  label?: string;
}

export const CommonTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-neutral-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.fill }}>
          {p.name}: ${p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};
