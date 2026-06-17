import { StateTitle, BodyText } from "@repo/ui";

export const EmptyState = ({
  title,
  description,
  action,
  icon = "inbox",
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: "inbox" | "building" | "payment";
}) => {
  const icons: Record<string, React.ReactNode> = {
    inbox: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-6l-2 3H10l-2-3H2" />
        <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
      </svg>
    ),
    building: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01" />
      </svg>
    ),
    payment: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  };

  return (
    <div className="flex flex-col items-center text-center py-16 px-6 gap-4">
      <div className="w-[72px] h-[72px] rounded-xl bg-teal-100 text-teal-700 grid place-items-center">
        {icons[icon]}
      </div>
      <div className="max-w-[42ch]">
        <StateTitle>{title}</StateTitle>
        {description && <BodyText className="mt-1 text-muted-foreground">{description}</BodyText>}
      </div>
      {action}
    </div>
  );
};
