export function StatTile({
  amount,
  label,
  accent,
}: {
  amount: string;
  label: string;
  accent: "destructive" | "warning";
}) {
  const amountClass = accent === "destructive" ? "text-destructive" : "text-warning";

  return (
    <div className="flex-1 bg-white border border-sand-400 rounded-lg p-3 px-4">
      <div className={`text-[22px] font-semibold tracking-tight ${amountClass}`}>{amount}</div>
      <div className="text-[12.5px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}
