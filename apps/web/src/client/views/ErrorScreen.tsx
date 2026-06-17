import { Button, StateTitle, BodyText } from "@repo/ui";
import { strings } from "@repo/tokens";

const s = strings.common;

export const ErrorState = ({
  message = s.errorHeading,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) => (
  <div className="flex flex-col items-center text-center py-16 px-6 gap-4">
    <div className="w-[72px] h-[72px] rounded-xl bg-destructive-bg text-destructive grid place-items-center">
      <svg
        width="34"
        height="34"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </div>
    <div className="max-w-[42ch]">
      <StateTitle>{s.errorHeading}</StateTitle>
      <BodyText className="mt-1 text-muted-foreground">{message}</BodyText>
    </div>
    {onRetry && <Button onClick={onRetry}>{s.errorRetry}</Button>}
  </div>
);
