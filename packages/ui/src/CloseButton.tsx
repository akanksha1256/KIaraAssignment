import { X as XIcon } from "lucide-react";
import { cn } from "./utils";

export const CloseButton = ({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "p-1.5 rounded-lg text-muted-foreground hover:text-espresso-900 hover:bg-sand-100 transition-colors",
      className,
    )}
  >
    <XIcon className="h-4 w-4" />
  </button>
);
