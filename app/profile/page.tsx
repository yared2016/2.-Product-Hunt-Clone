"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth, UserProfile as ClerkUserProfile } from "@clerk/nextjs";
import { Navbar } from "@/components/Navbar";
import { MakerBadges } from "@/components/MakerBadges";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/EmptyState";
import { UserAvatar } from "@/components/UserAvatar";
import { FormFeedbackToast, InlineFeedbackBadge } from "@/components/FormFeedbackToast";
import { ROUTES } from "@/lib/constants";
import {
  User,
  Shield,
  Rocket,
  Flame,
  MessageSquare,
  Globe,
  AtSign,
  Check,
  Save,
  Clock,
  Sparkles,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

export default function ProfilePage() {
  const { isSignedIn } = useAuth();
  const profile = useQuery(api.users.getMyProfile);
  const updateProfileMutation = useMutation(api.users.updateProfile);

  // Form State
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<string>("maker");

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setUsername(profile.username || "");
      setBio(profile.bio || "");
      setWebsiteUrl(profile.websiteUrl || "");
      setAvatarUrl(profile.avatarUrl || "");
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      setIsSaving(true);
      await updateProfileMutation({
        name: name.trim(),
        username: username.trim(),
        bio: bio.trim(),
        websiteUrl: websiteUrl.trim(),
        avatarUrl: avatarUrl.trim(),
      });
      setSaveSuccess(true);
      toast.success("Profile saved successfully!", {
        description: "Your maker bio and information have been updated live.",
      });
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to update profile:", err);
      const msg = err instanceof Error ? err.message : "Failed to update profile. Please try again.";
      setErrorMessage(msg);
      toast.error("Failed to update profile", { description: msg });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-[100dvh] bg-background text-foreground flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-md mx-auto flex items-center justify-center p-6 w-full">
          <EmptyState
            icon={User}
            title="Sign in required"
            description="Please sign in to view and manage your maker profile and account settings."
            actionLabel="Sign In to Launchpad"
            actionHref={ROUTES.SIGN_IN}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col w-full">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Profile Hero Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 sm:pb-8 border-b border-border/80 w-full">
          <div className="flex items-center gap-4 min-w-0">
            <UserAvatar
              name={name || profile?.name || "User"}
              src={avatarUrl || profile?.avatarUrl}
              size="xl"
              className="size-16 sm:size-20 rounded-2xl border-2 border-border shadow-xs shrink-0"
            />

            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                  {name || profile?.name || "Maker Profile"}
                </h1>
                <Badge variant="accent" className="text-xs py-0 px-2 font-mono font-normal">
                  @{username || profile?.username || "maker"}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground truncate font-normal">
                {bio || "Tech enthusiast & product creator on Launchpad."}
              </p>
            </div>
          </div>

          <Link href="/dashboard" className="shrink-0">
            <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-[40px] gap-1.5 font-normal hover:border-orange-500/50 hover:text-orange-600 dark:hover:text-orange-400 transition-all cursor-pointer">
              <Rocket className="size-4 text-orange-500" />
              <span>Go to Dashboard</span>
            </Button>
          </Link>
        </div>

        {/* Maker Statistics Overview */}
        {profile?.stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 py-6 border-b border-border/60">
            <Card className="p-3.5 bg-muted/40">
              <div className="flex items-center gap-2 text-xs text-muted-foreground pb-1 font-normal">
                <Rocket className="size-3.5 text-orange-500" />
                <span>Launched</span>
              </div>
              <span className="text-xl sm:text-2xl font-semibold font-mono text-foreground">
                {profile.stats.launchedProducts}
              </span>
            </Card>

            <Card className="p-3.5 bg-muted/40">
              <div className="flex items-center gap-2 text-xs text-muted-foreground pb-1 font-normal">
                <Clock className="size-3.5 text-amber-500" />
                <span>Scheduled</span>
              </div>
              <span className="text-xl sm:text-2xl font-semibold font-mono text-foreground">
                {profile.stats.scheduledProducts}
              </span>
            </Card>

            <Card className="p-3.5 bg-muted/40">
              <div className="flex items-center gap-2 text-xs text-muted-foreground pb-1 font-normal">
                <Flame className="size-3.5 text-orange-500" />
                <span>Upvotes Received</span>
              </div>
              <span className="text-xl sm:text-2xl font-semibold font-mono text-foreground">
                {profile.stats.totalUpvotes}
              </span>
            </Card>

            <Card className="p-3.5 bg-muted/40">
              <div className="flex items-center gap-2 text-xs text-muted-foreground pb-1 font-normal">
                <MessageSquare className="size-3.5 text-blue-500" />
                <span>Comments</span>
              </div>
              <span className="text-xl sm:text-2xl font-semibold font-mono text-foreground">
                {profile.stats.totalComments}
              </span>
            </Card>
          </div>
        )}

        {/* Gamified Maker Badges & Milestones */}
        {profile?.stats && (
          <div className="pt-6">
            <MakerBadges
              stats={{
                launchCount: profile.stats.launchedProducts,
                totalUpvotes: profile.stats.totalUpvotes,
                totalComments: profile.stats.totalComments,
                hasChampionLaunch: profile.stats.totalUpvotes >= 20,
              }}
            />
          </div>
        )}

        {/* Tabs: Maker Profile (Convex) vs Account & Security (Clerk) */}
        <div className="pt-6 sm:pt-8 w-full">
          <Tabs value={activeProfileTab} onValueChange={setActiveProfileTab} className="w-full">
            <TabsList className="mb-3 w-full flex flex-wrap h-auto gap-1.5 p-1.5 bg-muted/60">
              <TabsTrigger
                value="maker"
                className={cn(
                  "flex-1 sm:flex-initial gap-2 text-xs sm:text-sm cursor-pointer min-h-[38px] transition-all duration-200",
                  activeProfileTab === "maker"
                    ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-border/80 border-b-2 border-b-orange-500"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/60 hover:shadow-2xs font-normal"
                )}
              >
                <User className={cn("size-3.5 transition-transform duration-200", activeProfileTab === "maker" ? "text-orange-500 scale-110" : "text-muted-foreground")} />
                <span>Maker Profile</span>
              </TabsTrigger>

              <TabsTrigger
                value="security"
                className={cn(
                  "flex-1 sm:flex-initial gap-2 text-xs sm:text-sm cursor-pointer min-h-[38px] transition-all duration-200",
                  activeProfileTab === "security"
                    ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-border/80 border-b-2 border-b-blue-500"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/60 hover:shadow-2xs font-normal"
                )}
              >
                <Shield className={cn("size-3.5 transition-transform duration-200", activeProfileTab === "security" ? "text-blue-500 scale-110" : "text-muted-foreground")} />
                <span>Account & Security (Clerk)</span>
              </TabsTrigger>
            </TabsList>

            {/* Active View Context Indicator */}
            <div className="flex items-center justify-between pb-4 pt-1 text-xs text-muted-foreground border-b border-border/50 mb-6">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-foreground">Active Section:</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold text-xs border border-orange-500/25">
                  {activeProfileTab === "maker" ? <User className="size-3 text-orange-500" /> : <Shield className="size-3 text-blue-500" />}
                  <span>
                    {activeProfileTab === "maker" ? "Public Maker Profile & Bio" : "Account Security & Credentials (Clerk)"}
                  </span>
                </span>
              </div>
              <span className="hidden sm:inline font-mono text-[11px] text-muted-foreground/80">
                {activeProfileTab === "maker" ? "Visible on your launched products, badges & comments" : "Manage multi-factor auth, email & password"}
              </span>
            </div>

            {/* Maker Profile Tab */}
            <TabsContent value="maker">
              <Card className="p-5 sm:p-6 max-w-2xl">
                <CardHeader className="p-0 pb-6 border-b border-border/60">
                  <CardTitle className="text-base sm:text-lg font-semibold">Public Maker Profile</CardTitle>
                  <CardDescription className="text-xs sm:text-sm font-normal">
                    This information appears on your launched products, maker badges, and discussion replies.
                  </CardDescription>
                </CardHeader>

                <form onSubmit={handleSaveProfile} className="pt-6 flex flex-col gap-5">
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                      {errorMessage}
                    </div>
                  )}

                  {saveSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
                      <Check className="size-4" />
                      <span>Profile saved successfully!</span>
                    </div>
                  )}

                  <FieldGroup>
                    {/* Full Name */}
                    <Field>
                      <FieldLabel>Display Name *</FieldLabel>
                      <Input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="font-normal"
                      />
                    </Field>

                    {/* Username */}
                    <Field>
                      <FieldLabel>Username Handle *</FieldLabel>
                      <div className="relative">
                        <AtSign className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                          placeholder="username"
                          className="pl-9 font-mono text-sm"
                        />
                      </div>
                      <FieldDescription>Your unique handle across Launchpad (letters, numbers, underscores).</FieldDescription>
                    </Field>

                    {/* Bio */}
                    <Field>
                      <FieldLabel>Bio / Headline</FieldLabel>
                      <Textarea
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Founder @ MyStartup • Building the future of AI tools"
                        className="text-sm resize-none font-normal"
                      />
                      <FieldDescription>A brief 1-2 sentence introduction about what you're building.</FieldDescription>
                    </Field>

                    {/* Website / Social URL */}
                    <Field>
                      <FieldLabel>Website or Twitter URL</FieldLabel>
                      <div className="relative">
                        <Globe className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="url"
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                          placeholder="https://twitter.com/yourhandle or https://yourportfolio.dev"
                          className="pl-9 text-sm font-normal"
                        />
                      </div>
                    </Field>

                    {/* Avatar Image URL with Clarity Callout & Live Preview */}
                    <Field>
                      <FieldLabel className="flex items-center justify-between">
                        <span>Custom Avatar URL (Optional)</span>
                        {avatarUrl && (
                          <button
                            type="button"
                            onClick={() => setAvatarUrl("")}
                            className="text-[11px] text-orange-600 hover:underline cursor-pointer font-normal"
                          >
                            Reset to Clerk default
                          </button>
                        )}
                      </FieldLabel>

                      <div className="flex items-center gap-3.5 pt-1">
                        <UserAvatar
                          name={name || "ME"}
                          src={avatarUrl || profile?.avatarUrl}
                          size="lg"
                          className="size-14 rounded-2xl border-2 border-border shadow-2xs shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <Input
                            type="url"
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            placeholder="https://example.com/my-avatar.png"
                            className="text-sm font-mono font-normal"
                          />
                        </div>
                      </div>

                      <div className="mt-2.5 p-3 rounded-xl bg-muted/50 border border-border/70 text-xs text-muted-foreground flex flex-col gap-1 leading-relaxed font-normal">
                        <div className="font-medium text-foreground flex items-center gap-1.5">
                          <Sparkles className="size-3.5 text-amber-500 shrink-0" />
                          <span>How does the Avatar URL work?</span>
                        </div>
                        <p>
                          <strong>Default:</strong> Launchpad automatically syncs your profile image from your authentication provider (Google, GitHub, etc.).
                        </p>
                        <p>
                          <strong>Custom:</strong> If you want a specialized maker avatar, brand logo, or different photo across your launches without changing your primary Google/GitHub account picture, paste any direct image URL (PNG, JPG, SVG, WebP) here.
                        </p>
                      </div>
                    </Field>
                  </FieldGroup>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60 flex-wrap">
                    <InlineFeedbackBadge show={saveSuccess} message="Profile Saved!" />

                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="bg-[#FF6154] hover:bg-[#e04f43] text-white font-semibold gap-2 min-h-[42px] px-5 shadow-xs hover:shadow-md hover:shadow-orange-500/25 cursor-pointer text-xs sm:text-sm active:scale-95 transition-all duration-200"
                    >
                      {isSaving ? <Spinner className="size-4" /> : <Save className="size-4" />}
                      <span>Save Profile Changes</span>
                    </Button>
                  </div>
                </form>
              </Card>
            </TabsContent>

            {/* Account & Security (Clerk UserProfile) */}
            <TabsContent value="security">
              <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-card p-2 sm:p-4">
                <ClerkUserProfile
                  routing="hash"
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "border-0 shadow-none bg-transparent w-full",
                      navbar: "hidden sm:flex",
                    },
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Floating Toast Notification (Always visible wherever user scrolls) */}
        <FormFeedbackToast show={saveSuccess} message="Profile saved successfully! Maker bio & settings updated." />
      </main>
    </div>
  );
}