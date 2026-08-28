"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  productId: Id<"products">;
  variant?: "icon" | "button";
  className?: string;
}

export function BookmarkButton({
  productId,
  variant = "icon",
  className,
}: BookmarkButtonProps) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [isPending, setIsPending] = useState(false);

  const hasBookmarked = useQuery(api.bookmarks.hasBookmarked, { productId }) ?? false;
  const toggleBookmark = useMutation(api.bookmarks.toggle);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    try {
      setIsPending(true);
      await toggleBookmark({ productId });
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
    } finally {
      setIsPending(false);
    }
  };

  if (variant === "button") {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={handleToggle}
        className={cn(
          "gap-1.5 min-h-[42px] px-3.5 transition-all active:scale-95",
          hasBookmarked
            ? "border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20"
            : "hover:text-foreground",
          className
        )}
      >
        {hasBookmarked ? (
          <BookmarkCheck className="size-4 fill-current text-blue-600 dark:text-blue-400" />
        ) : (
          <Bookmark className="size-4 text-muted-foreground" />
        )}
        <span>{hasBookmarked ? "Saved" : "Save"}</span>
      </Button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={hasBookmarked ? "Remove from bookmarks" : "Save product"}
      className={cn(
        "size-7 rounded-lg flex items-center justify-center transition-all cursor-pointer select-none active:scale-90 hover:bg-muted/80",
        hasBookmarked
          ? "text-blue-600 dark:text-blue-400 bg-blue-500/10"
          : "text-muted-foreground/60 hover:text-foreground",
        className
      )}
    >
      {hasBookmarked ? (
        <BookmarkCheck className="size-3.5 fill-current" />
      ) : (
        <Bookmark className="size-3.5" />
      )}
    </button>
  );
}
