import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const spinnerVariants = "w-8 h-8 border-4 border-t-4 border-gray-200 border-t-gray-600 rounded-full animate-spin";

export const LoadingSpinner = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(spinnerVariants, className)}
      role="status"
      aria-label="Loading"
      {...props}
    />
  )
);
LoadingSpinner.displayName = "LoadingSpinner";

