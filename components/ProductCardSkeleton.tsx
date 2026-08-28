import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="@container w-full">
      <Card className="bg-card/40">
        <div className="flex flex-col @sm:flex-row items-start @sm:items-center justify-between gap-3.5 w-full">
          <div className="flex items-start @sm:items-center gap-3.5 flex-1 min-w-0">
            {/* Logo placeholder */}
            <Skeleton className="size-12 @sm:size-14 rounded-2xl shrink-0" />

            {/* Info Column */}
            <div className="flex flex-col gap-2 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-4 w-12 rounded-md" />
              </div>
              <Skeleton className="h-3 w-4/5 rounded-md" />
              <div className="flex items-center gap-2 pt-0.5">
                <Skeleton className="h-3.5 w-14 rounded-md" />
                <Skeleton className="h-3.5 w-14 rounded-md" />
              </div>
            </div>
          </div>

          {/* Upvote button placeholder */}
          <div className="w-full @sm:w-auto flex items-center justify-end">
            <Skeleton className="h-8 @sm:h-14 w-full @sm:w-14 rounded-xl" />
          </div>
        </div>
      </Card>
    </div>
  );
}
