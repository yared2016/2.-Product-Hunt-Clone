"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Share2,
  Check,
  Copy,
  MessageCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { fireUpvoteConfetti } from "@/lib/confetti";

interface ShareModalProps {
  productName: string;
  productTagline: string;
  productSlug: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({
  productName,
  productTagline,
  productSlug,
  isOpen,
  onClose,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/products/${productSlug}`;
    }
    return `https://launchpad.dev/products/${productSlug}`;
  };

  const shareUrl = getShareUrl();
  const shareText = `Check out ${productName} - "${productTagline}" on Launchpad! 🚀`;

  const handleCopyLink = (e: React.MouseEvent) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      fireUpvoteConfetti(e);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareTwitter = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(shareUrl)}&hashtags=buildinpublic,launchpad,tech`;
    window.open(tweetUrl, "_blank", "noopener,noreferrer,width=600,height=500");
  };

  const handleShareLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      shareUrl
    )}`;
    window.open(linkedInUrl, "_blank", "noopener,noreferrer,width=600,height=500");
  };

  const handleShareReddit = () => {
    const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(
      shareUrl
    )}&title=${encodeURIComponent(`${productName} - ${productTagline}`)}`;
    window.open(redditUrl, "_blank", "noopener,noreferrer,width=600,height=500");
  };

  const handleShareWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      `${shareText} ${shareUrl}`
    )}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-5 sm:p-6 gap-5 bg-background border-border rounded-2xl shadow-xl">
        <DialogHeader className="gap-1.5">
          <div className="flex items-center gap-2 text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wider">
            <Sparkles className="size-3.5" />
            <span>Community Spread</span>
          </div>
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            Share {productName}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-normal">
            Spread the word to support this launch across your social networks and developer communities.
          </DialogDescription>
        </DialogHeader>

        {/* Copy Link Input Bar */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-foreground">Direct Product Link</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-border bg-muted/40 text-muted-foreground select-all truncate outline-none focus:ring-1 focus:ring-orange-500/40"
            />
            <Button
              size="sm"
              onClick={handleCopyLink}
              className={`shrink-0 text-xs font-medium gap-1.5 min-h-[38px] px-3.5 transition-all cursor-pointer ${
                copied
                  ? "bg-emerald-600 text-white hover:bg-emerald-600"
                  : "bg-orange-500 hover:bg-orange-600 text-white"
              }`}
            >
              {copied ? (
                <>
                  <Check className="size-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 1-Click Social Buttons Grid */}
        <div className="flex flex-col gap-2.5 pt-2">
          <label className="text-xs font-medium text-foreground">Share to Social</label>
          <div className="grid grid-cols-2 gap-2.5">
            {/* X / Twitter */}
            <button
              type="button"
              onClick={handleShareTwitter}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-border hover:border-black dark:hover:border-white/40 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-medium transition-all active:scale-95 cursor-pointer"
            >
              <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>Share on X</span>
            </button>

            {/* LinkedIn */}
            <button
              type="button"
              onClick={handleShareLinkedIn}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-border hover:border-[#0A66C2]/60 hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] text-xs font-medium transition-all active:scale-95 cursor-pointer"
            >
              <svg className="size-4 fill-current text-[#0A66C2]" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
              <span>LinkedIn</span>
            </button>

            {/* Reddit */}
            <button
              type="button"
              onClick={handleShareReddit}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-border hover:border-[#FF4500]/60 hover:bg-[#FF4500]/10 hover:text-[#FF4500] text-xs font-medium transition-all active:scale-95 cursor-pointer"
            >
              <span className="size-4 rounded-full bg-[#FF4500] text-white flex items-center justify-center text-[10px] font-bold">r/</span>
              <span>Reddit</span>
            </button>

            {/* WhatsApp */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-border hover:border-emerald-500/60 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-medium transition-all active:scale-95 cursor-pointer"
            >
              <MessageCircle className="size-4 text-emerald-500" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
