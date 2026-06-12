import { Spinner } from "@repo/ui";

export const LoadingState = ({
  message = "Loading...",
}: {
  message?: string;
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-neutral-400">
      <Spinner className="h-8 w-8" />
      <p className="text-sm">{message}</p>
    </div>
  );
};
