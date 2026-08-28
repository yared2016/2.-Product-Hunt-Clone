"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Code, Check, Copy, Sparkles, ExternalLink } from "lucide-react";

interface EmbedBadgeModalProps {
  productName: string;
  productSlug: string;
  isOpen: boolean;
  onClose: () => void;
}

export function EmbedBadgeModal({
  productName,
  productSlug,
  isOpen,
  onClose,
}: EmbedBadgeModalProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const badgeUrl = `${origin}/api/badge/${productSlug}?theme=${theme}`;
  const productUrl = `${origin}/products/${productSlug}`;

  const htmlCode = `<a href="${productUrl}" target="_blank">\n  <img src="${badgeUrl}" alt="${productName} - Featured on Launchpad" style="width: 250px; height: 54px;" width="250" height="54" />\n</a>`;
  const markdownCode = `[![${productName} - Featured on Launchpad](${badgeUrl})](${productUrl})`;

  const handleCopy = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-5 sm:p-6 gap-5 bg-background border-border rounded-2xl">
        <DialogHeader className="gap-1.5">
          <div className="flex items-center gap-2 text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wider">
            <Sparkles className="size-3.5" />
            <span>Growth & Distribution</span>
          </div>
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            Embed Launchpad Badge
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-normal">
            Embed this live badge on your website, GitHub README, or docs to showcase your Launchpad ranking and upvotes.
          </DialogDescription>
        </DialogHeader>

        {/* Live Preview Container */}
        <div className="flex flex-col gap-2 p-4 rounded-xl border border-border/80 bg-muted/20 items-center justify-center">
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider pb-1">
            Live Preview
          </div>

          {/* Theme Switcher for Preview */}
          <div className="flex items-center gap-2 pb-2">
            <button
              onClick={() => setTheme("dark")}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                theme === "dark"
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400"
              }`}
            >
              Dark Theme
            </button>
            <button
              onClick={() => setTheme("light")}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                theme === "light"
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400"
              }`}
            >
              Light Theme
            </button>
          </div>

          {/* Badge Image */}
          <div className="p-3 rounded-xl border border-border/60 bg-background/50 shadow-xs flex items-center justify-center">
            {origin ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={badgeUrl}
                alt={`${productName} Badge Preview`}
                className="h-[54px] w-[250px] max-w-full"
              />
            ) : (
              <div className="h-[54px] w-[250px] bg-muted animate-pulse rounded-xl" />
            )}
          </div>
        </div>

        {/* Code Snippets */}
        <Tabs defaultValue="markdown" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="markdown" className="text-xs">
              Markdown (README)
            </TabsTrigger>
            <TabsTrigger value="html" className="text-xs">
              HTML / Website
            </TabsTrigger>
          </TabsList>

          <TabsContent value="markdown" className="pt-3 flex flex-col gap-2">
            <div className="relative">
              <pre className="p-3 rounded-xl bg-muted/60 border border-border text-[11px] font-mono text-foreground overflow-x-auto whitespace-pre-wrap">
                {markdownCode}
              </pre>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleCopy(markdownCode, "markdown")}
                className="absolute top-2 right-2 text-xs gap-1 h-7 px-2.5"
              >
                {copiedType === "markdown" ? (
                  <>
                    <Check className="size-3 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="html" className="pt-3 flex flex-col gap-2">
            <div className="relative">
              <pre className="p-3 rounded-xl bg-muted/60 border border-border text-[11px] font-mono text-foreground overflow-x-auto whitespace-pre-wrap">
                {htmlCode}
              </pre>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleCopy(htmlCode, "html")}
                className="absolute top-2 right-2 text-xs gap-1 h-7 px-2.5"
              >
                {copiedType === "html" ? (
                  <>
                    <Check className="size-3 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
