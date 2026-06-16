export function ErrorState({
  message = "Something went wrong.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6 gap-4">
      <div className="w-[72px] h-[72px] rounded-xl bg-destructive-bg text-destructive grid place-items-center">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div className="max-w-[42ch]">
        <h3 className="font-serif text-[22px] font-semibold text-espresso-900">Something went wrong</h3>
        <p className="mt-1 text-[14px] text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-full bg-coral-500 text-white px-5 h-10 text-[14px] font-medium hover:bg-coral-600 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}
