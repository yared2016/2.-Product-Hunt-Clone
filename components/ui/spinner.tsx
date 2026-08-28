import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SpinnerProps extends React.ComponentProps<typeof Loader2> {}

export function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <Loader2
      data-slot="spinner"
      className={cn("animate-spin size-4 shrink-0 text-current", className)}
      {...props}
    />
  );
}
