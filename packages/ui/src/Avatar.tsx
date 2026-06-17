import { cn } from "./utils";

const sizeMap = {
  sm: { container: "w-8 h-8 text-[12px]", },
  md: { container: "w-10 h-10 text-[14px]", },
  lg: { container: "w-14 h-14 text-[18px]", },
};

interface AvatarProps {
  initials: string;
  size?: keyof typeof sizeMap;
  className?: string;
}

export const Avatar = ({ initials, size = "lg", className }: AvatarProps) => (
  <div
    className={cn(
      "rounded-full bg-maroon-500 flex items-center justify-center text-white font-semibold flex-none",
      sizeMap[size].container,
      className,
    )}
  >
    {initials}
  </div>
);
