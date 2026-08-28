"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  Check,
  CheckCheck,
  ChevronUp,
  MessageSquare,
  Reply,
  Rocket,
  Trophy,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const unreadCount = useQuery(api.notifications.getUnreadCount) ?? 0;
  const notifications = useQuery(
    api.notifications.getMyNotifications,
    open ? { limit: 30 } : "skip"
  );

  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const clearAllNotifications = useMutation(api.notifications.clearAll);
  const removeNotification = useMutation(api.notifications.remove);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!isSignedIn) {
    return null;
  }

  const resolveLinkUrl = (notif: {
    type: string;
    linkUrl?: string;
    product?: { slug: string } | null;
  }) => {
    if (notif.linkUrl) return notif.linkUrl;
    if (notif.product?.slug) {
      if (notif.type === "comment" || notif.type === "reply") {
        return `/products/${notif.product.slug}#comments`;
      }
      return `/products/${notif.product.slug}`;
    }
    return "/";
  };

  const handleNotificationClick = async (notif: {
    _id: Id<"notifications">;
    type: string;
    linkUrl?: string;
    product?: { slug: string } | null;
  }) => {
    try {
      await markAsRead({ notificationId: notif._id });
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }

    const destination = resolveLinkUrl(notif);
    setOpen(false);
    router.push(destination);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
    } catch (err) {
      console.error("Failed to clear all notifications:", err);
    }
  };

  const handleRemoveSingle = async (
    e: React.MouseEvent,
    notificationId: Id<"notifications">
  ) => {
    e.stopPropagation();
    try {
      await removeNotification({ notificationId });
    } catch (err) {
      console.error("Failed to remove notification:", err);
    }
  };

  const formatRelativeTime = (timestamp: number) => {
    const diffSeconds = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSeconds < 60) return "just now";
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "upvote":
        return <ChevronUp className="size-3.5 text-orange-500" />;
      case "comment":
        return <MessageSquare className="size-3.5 text-blue-500" />;
      case "reply":
        return <Reply className="size-3.5 text-indigo-500" />;
      case "launch_live":
        return <Rocket className="size-3.5 text-emerald-500" />;
      case "leaderboard_rank":
        return <Trophy className="size-3.5 text-amber-500" />;
      default:
        return <Sparkles className="size-3.5 text-purple-500" />;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="relative size-8 sm:size-9 p-0 text-muted-foreground hover:text-foreground active:scale-95 transition-transform cursor-pointer shrink-0"
        aria-label="Notifications"
      >
        <Bell className="size-4 sm:size-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex size-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6154] opacity-75" />
            <span className="relative inline-flex rounded-full size-2.5 bg-[#FF6154]" />
          </span>
        )}
      </Button>

      {/* Backdrop for Mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 sm:hidden z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Notification Dropdown Drawer */}
      {open && (
        <div className="fixed inset-x-3.5 top-16 sm:absolute sm:inset-auto sm:right-0 sm:mt-2 w-auto sm:w-[390px] max-w-[calc(100vw-28px)] bg-background border border-border rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/80 bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-mono font-medium bg-[#FF6154] text-white px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 inline-flex items-center gap-1 font-normal transition-colors cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="size-3.5 text-orange-500" />
                  <span>Mark all read</span>
                </button>
              )}

              {notifications && notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs text-muted-foreground hover:text-red-600 inline-flex items-center gap-1 font-normal transition-colors cursor-pointer ml-1"
                  title="Clear all notifications"
                >
                  <Trash2 className="size-3.5" />
                  <span>Clear</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[380px] sm:max-h-[420px] overflow-y-auto divide-y divide-border/40">
            {notifications === undefined ? (
              <div className="p-8 text-center text-xs text-muted-foreground font-normal">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center gap-2 text-muted-foreground">
                <div className="size-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 mb-1">
                  <Bell className="size-5 text-orange-500 opacity-80" />
                </div>
                <span className="text-sm font-semibold text-foreground">You&apos;re all caught up!</span>
                <span className="text-xs max-w-[260px] leading-relaxed font-normal">
                  No new notifications right now. We&apos;ll alert you when community members upvote, comment, or reply to your launches.
                </span>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={cn(
                    "w-full text-left p-3.5 flex items-start justify-between gap-3 hover:bg-muted/60 transition-colors cursor-pointer group relative",
                    !notif.isRead && "bg-orange-500/[0.06] dark:bg-orange-500/10"
                  )}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Actor Avatar or Type Icon */}
                    <div className="relative shrink-0 mt-0.5">
                      {notif.actor ? (
                        <Avatar className="size-8 rounded-full border border-border bg-muted">
                          {notif.actor.avatarUrl && (
                            <AvatarImage src={notif.actor.avatarUrl} alt={notif.actor.name} />
                          )}
                          <AvatarFallback className="text-[10px] font-semibold">
                            {getInitials(notif.actor.name)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="size-8 rounded-full bg-muted flex items-center justify-center border border-border">
                          {getTypeIcon(notif.type)}
                        </div>
                      )}

                      <div className="absolute -bottom-1 -right-1 size-4 rounded-full bg-background border border-border flex items-center justify-center shadow-xs">
                        {getTypeIcon(notif.type)}
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-medium sm:font-semibold text-foreground truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                          {notif.title}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground shrink-0 font-normal">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-normal">
                        {notif.body}
                      </p>
                    </div>
                  </div>

                  {/* Actions / Read Dot */}
                  <div className="flex items-center gap-1.5 shrink-0 self-center pl-1">
                    {!notif.isRead && (
                      <div className="size-2 rounded-full bg-[#FF6154] shrink-0" />
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleRemoveSingle(e, notif._id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-600 rounded-md transition-opacity cursor-pointer"
                      title="Dismiss notification"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
