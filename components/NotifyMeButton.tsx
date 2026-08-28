"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Bell, BellRing, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotifyMeButtonProps {
  productId: Id<"products">;
  size?: "sm" | "default";
  variant?: "card" | "hero";
}

export function NotifyMeButton({
  productId,
  size = "sm",
  variant = "card",
}: NotifyMeButtonProps) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [isPending, setIsPending] = useState(false);

  const hasSubscribed = useQuery(api.launchSubscriptions.hasSubscribed, {
    productId,
  }) ?? false;

  const subscriberCount = useQuery(
    api.launchSubscriptions.getSubscriberCount,
    { productId }
  ) ?? 0;

  const toggleSubscription = useMutation(api.launchSubscriptions.toggle);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    try {
      setIsPending(true);
      await toggleSubscription({ productId });
    } catch (err) {
      console.error("Failed to toggle launch subscription:", err);
    } finally {
      setIsPending(false);
    }
  };

  if (variant === "hero") {
    return (
      <Button
        size={size}
        disabled={isPending}
        onClick={handleToggle}
        className={cn(
          "gap-2 min-h-[42px] px-4 font-semibold active:scale-95 transition-all shadow-xs cursor-pointer",
          hasSubscribed
            ? "bg-emerald-600 hover:bg-emerald-600/90 text-white"
            : "bg-orange-600 hover:bg-orange-600/90 text-white"
        )}
      >
        {isPending ? (
          <Loader2 data-icon="inline-start" className="size-4 animate-spin shrink-0" />
        ) : hasSubscribed ? (
          <Check data-icon="inline-start" className="size-4 shrink-0" />
        ) : (
          <BellRing data-icon="inline-start" className="size-4 shrink-0" />
        )}
        <span>{hasSubscribed ? "Subscribed to Launch" : "Notify Me on Launch"}</span>
        <span className="bg-black/20 px-1.5 py-0.5 rounded-md text-xs font-mono font-bold">
          {subscriberCount}
        </span>
      </Button>
    );
  }

  return (
    <Button
      variant={hasSubscribed ? "default" : "outline"}
      size="sm"
      disabled={isPending}
      onClick={handleToggle}
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 sm:gap-1 h-12 sm:h-14 w-12 sm:w-14 rounded-xl sm:rounded-2xl border transition-all cursor-pointer select-none active:scale-90",
        hasSubscribed
          ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-600/90 shadow-xs"
          : "border-orange-500/40 hover:border-orange-500 hover:bg-orange-500/10 text-orange-600 bg-background/50"
      )}
      title={hasSubscribed ? "Subscribed to launch notification" : "Notify me when this product launches"}
    >
      {isPending ? (
        <Loader2 className="size-4 sm:size-4.5 animate-spin shrink-0" />
      ) : hasSubscribed ? (
        <Check className="size-4 sm:size-4.5 shrink-0" />
      ) : (
        <Bell className="size-4 sm:size-4.5 shrink-0" />
      )}
      <span className="font-bold text-[10px] sm:text-[11px] tracking-tight font-mono">
        {hasSubscribed ? "Subbed" : subscriberCount}
      </span>
    </Button>
  );
}
