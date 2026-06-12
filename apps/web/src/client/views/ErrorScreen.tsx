export function ErrorState({
  message = "Something went wrong.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="rounded-full bg-danger-50 p-4">
        <svg
          className="h-6 w-6 text-danger-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <div>
        <p className="font-medium text-neutral-700">Error</p>
        <p className="mt-1 text-sm text-neutral-400">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="text-sm text-brand-600 hover:underline">
          Try again
        </button>
      )}
    </div>
  );
}
