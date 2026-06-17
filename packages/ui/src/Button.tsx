import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 font-medium whitespace-nowrap transition-all duration-normal ease-kiara outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:scale-[.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  {
    variants: {
      variant: {
        default: "rounded-full bg-coral-500 text-white shadow-sm hover:bg-coral-600",
        secondary: "rounded-full bg-sand-200 text-espresso-900 hover:bg-sand-400",
        ghost: "rounded-full bg-transparent text-maroon-600 hover:bg-sand-100",
        outline: "rounded-full border border-sand-400 bg-white text-maroon-600 hover:bg-sand-100",
        teal: "rounded-full bg-teal-600 text-white hover:bg-teal-700",
        destructive: "rounded-full bg-destructive text-white hover:bg-red-800",
        link: "text-coral-500 underline-offset-4 hover:underline rounded-md",
      },
      size: {
        sm: "h-control-sm px-4 text-[13px]",
        default: "h-control-md px-5 text-[14px]",
        lg: "h-control-lg px-6 text-[15px]",
        icon: "h-control-md w-control-md rounded-full",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export type ButtonProps = ButtonPrimitive.Props & VariantProps<typeof buttonVariants>;

export const Button = ({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) => (
  <ButtonPrimitive
    data-slot="button"
    className={cn(buttonVariants({ variant, size, className }))}
    {...props}
  />
);

export { buttonVariants };
