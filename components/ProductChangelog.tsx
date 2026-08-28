"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  Sparkles,
  Plus,
  Rocket,
  Check,
  Calendar,
  Layers,
  History,
  X,
} from "lucide-react";
import { fireUpvoteConfetti } from "@/lib/confetti";

interface ProductChangelogProps {
  productId: Id<"products">;
  productName: string;
  isMakerOrSubmitter: boolean;
}

export function ProductChangelog({
  productId,
  productName,
  isMakerOrSubmitter,
}: ProductChangelogProps) {
  const { isSignedIn } = useAuth();
  const updates = useQuery(api.productUpdates.listByProduct, { productId });
  const createUpdateMutation = useMutation(api.productUpdates.create);

  const [isPosting, setIsPosting] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCreateUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!version.trim() || !title.trim() || !body.trim()) {
      setErrorMessage("Please fill in all fields (version, title, description).");
      return;
    }

    try {
      setIsPosting(true);
      setErrorMessage(null);
      await createUpdateMutation({
        productId,
        version: version.trim(),
        title: title.trim(),
        body: body.trim(),
      });
      setSuccessMessage("Update published successfully!");
      fireUpvoteConfetti();
      setVersion("");
      setTitle("");
      setBody("");
      setShowNewModal(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Failed to post update:", err);
      const msg = err instanceof Error ? err.message : "Failed to post update.";
      setErrorMessage(msg);
    } finally {
      setIsPosting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(timestamp));
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header & Post Button */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
            <History className="size-4 text-orange-500" />
            <span>Product Updates & Changelog</span>
          </h3>
          <p className="text-xs text-muted-foreground font-normal">
            Track new releases, milestone features, and improvements for {productName}.
          </p>
        </div>

        {isMakerOrSubmitter && (
          <Button
            size="sm"
            onClick={() => setShowNewModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium gap-1.5 min-h-[36px] shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Plus className="size-3.5" />
            <span>Post Update</span>
          </Button>
        )}
      </div>

      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <Check className="size-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Post New Update Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-5 sm:p-6 flex flex-col gap-4 shadow-2xl animate-in zoom-in-95 bg-background border-border rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <div className="flex items-center gap-2">
                <Rocket className="size-4 text-orange-500" />
                <h4 className="font-semibold text-base">Publish Release Note</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreateUpdate} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground block pb-1">Version Tag *</label>
                  <Input
                    required
                    placeholder="e.g. v1.2 or 2.0"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-foreground block pb-1">Update Title *</label>
                  <Input
                    required
                    placeholder="e.g. Launched Dark Mode & API"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block pb-1">What&apos;s New? *</label>
                <Textarea
                  required
                  rows={4}
                  placeholder="Describe the latest features, bug fixes, or enhancements you shipped..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPosting}
                  size="sm"
                  className="bg-[#FF6154] hover:bg-[#FF6154]/90 text-white font-medium text-xs gap-1.5"
                >
                  {isPosting ? <Spinner className="size-3.5" /> : <Rocket className="size-3.5" />}
                  <span>Publish Update</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Timeline of Updates */}
      {updates === undefined ? (
        <div className="p-8 text-center text-xs text-muted-foreground font-normal">
          Loading updates...
        </div>
      ) : updates.length === 0 ? (
        <div className="p-10 text-center flex flex-col items-center gap-2 border border-dashed border-border/80 rounded-2xl bg-muted/20">
          <Layers className="size-8 text-muted-foreground opacity-40" />
          <h4 className="font-semibold text-sm">No changelog updates yet</h4>
          <p className="text-xs text-muted-foreground max-w-sm font-normal">
            {isMakerOrSubmitter
              ? "Keep your supporters informed by posting what you're shipping and improving."
              : "The maker hasn't posted any version updates yet. Check back soon!"}
          </p>
          {isMakerOrSubmitter && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowNewModal(true)}
              className="mt-2 text-xs font-normal hover:border-orange-500/50 hover:text-orange-600 dark:hover:text-orange-400"
            >
              Post First Update
            </Button>
          )}
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 border-l-2 border-orange-500/30 space-y-6">
          {updates.map((up) => (
            <div key={up._id} className="relative group">
              {/* Timeline Dot */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 size-4 rounded-full bg-background border-2 border-orange-500 group-hover:scale-125 transition-transform" />

              <Card className="p-4 sm:p-5 rounded-2xl border border-border/80 hover:border-orange-500/40 hover:shadow-xs transition-all flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <Badge className="bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30 font-mono text-xs font-semibold px-2.5 py-0.5">
                      {up.version}
                    </Badge>
                    <h4 className="font-semibold text-sm sm:text-base text-foreground tracking-tight">
                      {up.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono font-normal">
                    <Calendar className="size-3 text-orange-500" />
                    <span>{formatDate(up.createdAt)}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line font-normal">
                  {up.body}
                </p>

                {up.author && (
                  <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground font-normal">
                    <Avatar className="size-5 rounded-full border border-border bg-muted">
                      {up.author.avatarUrl && (
                        <AvatarImage src={up.author.avatarUrl} alt={up.author.name} />
                      )}
                      <AvatarFallback className="text-[9px] font-semibold">
                        {getInitials(up.author.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span>Posted by <strong className="font-medium text-foreground">{up.author.name}</strong> (@{up.author.username})</span>
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
