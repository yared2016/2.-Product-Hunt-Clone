"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";
import { Navbar } from "@/components/Navbar";
import { DatePickerField } from "@/components/DatePickerField";
import { AiLaunchAssistant } from "@/components/AiLaunchAssistant";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  ChevronLeft,
  Save,
  Trash2,
  AlertTriangle,
  Eye,
  Check,
  X,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const AVAILABLE_CATEGORIES = [
  "AI",
  "Developer Tools",
  "SaaS",
  "Design Tools",
  "Productivity",
  "Marketing",
  "Crypto",
  "Open Source",
];

const STANDARD_MAKER_ROLES = [
  "CEO",
  "Founder",
  "Co-Founder",
  "CTO",
  "Lead Developer",
  "Product Designer",
  "Head of Product",
  "Marketing & Growth",
  "Maker",
];

// Helper to strictly validate website URLs
const isValidHttpUrl = (str: string): boolean => {
  const trimmed = str.trim();
  if (!trimmed) return false;
  try {
    const urlString = trimmed.startsWith("http://") || trimmed.startsWith("https://") ? trimmed : `https://${trimmed}`;
    const url = new URL(urlString);
    const hostParts = url.hostname.split(".");
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      hostParts.length >= 2 &&
      hostParts[hostParts.length - 1].length >= 2 &&
      !url.hostname.includes(" ")
    );
  } catch {
    return false;
  }
};

interface EditPageProps {
  params: Promise<{ slug: string }>;
}

export default function EditProductPage({ params }: EditPageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const product = useQuery(api.products.getBySlug, { slug });
  const currentUser = useQuery(api.users.getCurrentUser);

  const updateProductMutation = useMutation(api.products.update);
  const publishNowMutation = useMutation(api.products.publishNow);
  const removeProductMutation = useMutation(api.products.remove);

  // Form State
  const [name, setName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [pricing, setPricing] = useState<"free" | "freemium" | "paid">("freemium");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["AI"]);
  const [launchDate, setLaunchDate] = useState("2026-08-28");
  const [status, setStatus] = useState<"draft" | "scheduled" | "launched">("launched");
  const [showAiAssistant, setShowAiAssistant] = useState(false);

  // Maker management state
  const [makerSearch, setMakerSearch] = useState("");
  const [taggedMakers, setTaggedMakers] = useState<
    Array<{ _id: Id<"users">; name: string; username: string; avatarUrl?: string; role: string }>
  >([]);

  const searchResults = useQuery(
    api.users.searchUsers,
    makerSearch.trim().length > 1 ? { search: makerSearch } : "skip"
  );

  // Real-time slug availability query
  const slugCheck = useQuery(
    api.products.isSlugAvailable,
    newSlug.trim()
      ? {
          slug: newSlug.trim(),
          excludeProductId: product?._id,
        }
      : "skip"
  );

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setName(product.name);
      setNewSlug(product.slug);
      setTagline(product.tagline);
      setDescription(product.description);
      setWebsiteUrl(product.websiteUrl);
      setVideoUrl(product.videoUrl || "");
      setPricing(product.pricing);
      setSelectedCategories(product.categories);
      setLaunchDate(product.launchDate);
      setStatus(product.status);

      if (product.makers && product.makers.length > 0) {
        setTaggedMakers(
          product.makers.map((m) => ({
            _id: m._id,
            name: m.name,
            username: m.username,
            avatarUrl: m.avatarUrl,
            role: m.role || "Maker",
          }))
        );
      }
    }
  }, [product]);

  const toggleCategory = (cat: string) => {
    let next: string[];
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        next = selectedCategories.filter((c) => c !== cat);
      } else {
        next = selectedCategories;
      }
    } else {
      next = [...selectedCategories, cat];
    }
    setSelectedCategories(next);
    if (fieldErrors.categories && next.length > 0) {
      setFieldErrors((prev) => ({ ...prev, categories: "" }));
    }
  };

  const addMaker = (user: { _id: Id<"users">; name: string; username: string; avatarUrl?: string }) => {
    if (!taggedMakers.some((m) => m._id === user._id)) {
      setTaggedMakers([
        ...taggedMakers,
        { ...user, role: taggedMakers.length === 0 ? "Co-Founder" : "Maker" },
      ]);
    }
    setMakerSearch("");
  };

  const updateMakerRole = (id: Id<"users">, role: string) => {
    setTaggedMakers((prev) =>
      prev.map((m) => (m._id === id ? { ...m, role } : m))
    );
  };

  const removeMaker = (id: Id<"users">) => {
    setTaggedMakers(taggedMakers.filter((m) => m._id !== id));
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setErrorMessage(null);
    setSaveSuccess(false);

    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = "Product name is required.";
    }

    if (!tagline.trim()) {
      errors.tagline = "Tagline is required.";
    } else if (tagline.length > 60) {
      errors.tagline = "Tagline must be 60 characters or less.";
    }

    if (!newSlug.trim()) {
      errors.slug = "URL slug is required.";
    } else if (slugCheck && !slugCheck.available) {
      errors.slug = `The slug "/products/${newSlug.trim()}" is already taken. Please choose a unique slug.`;
    }

    if (!websiteUrl.trim()) {
      errors.websiteUrl = "Website URL is required.";
    } else if (!isValidHttpUrl(websiteUrl)) {
      errors.websiteUrl = "Please enter a valid website URL (e.g. https://yourproduct.com).";
    }

    if (selectedCategories.length === 0) {
      errors.categories = "Please select at least one category.";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const errorList = Object.values(errors);
      setErrorMessage(
        `Please correct the mandatory fields below:\n• ${errorList.join("\n• ")}`
      );
      window.scrollTo({ top: 120, behavior: "smooth" });
      return;
    }

    try {
      setIsSaving(true);
      const cleanSlug = newSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");

      let formattedWebsiteUrl = websiteUrl.trim();
      if (!formattedWebsiteUrl.startsWith("http://") && !formattedWebsiteUrl.startsWith("https://")) {
        formattedWebsiteUrl = `https://${formattedWebsiteUrl}`;
      }

      await updateProductMutation({
        productId: product._id,
        name: name.trim(),
        slug: cleanSlug,
        tagline: tagline.trim(),
        description: description.trim(),
        websiteUrl: formattedWebsiteUrl,
        videoUrl: videoUrl.trim() || undefined,
        pricing,
        categories: selectedCategories,
        launchDate,
        status,
        makers: taggedMakers.map((m) => ({
          userId: m._id,
          role: m.role || "Maker",
        })),
      });

      setSaveSuccess(true);
      toast.success("Changes saved successfully!", {
        description: `"${name.trim()}" has been updated live on Launchpad.`,
      });
      setTimeout(() => setSaveSuccess(false), 4000);
      if (cleanSlug !== product.slug) {
        router.push(`/products/${cleanSlug}/edit`);
      }
    } catch (err) {
      console.error("Update failed:", err);
      const msg = err instanceof Error ? err.message : "Failed to save product changes.";
      setErrorMessage(msg);
      toast.error("Failed to save changes", { description: msg });
      window.scrollTo({ top: 120, behavior: "smooth" });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishNow = async () => {
    if (!product) return;
    try {
      setIsPublishing(true);
      await publishNowMutation({
        productId: product._id,
        launchDate: "2026-08-28",
      });
      setStatus("launched");
      setLaunchDate("2026-08-28");
      setSaveSuccess(true);
      toast.success("Product published live!", {
        description: `"${product.name}" is now live on Today's leaderboard and discover feed.`,
      });
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error("Publish failed:", err);
      const msg = err instanceof Error ? err.message : "Failed to publish product.";
      setErrorMessage(msg);
      toast.error("Failed to publish", { description: msg });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!product) return;
    try {
      setIsDeleting(true);
      await removeProductMutation({ productId: product._id });
      router.push("/dashboard");
    } catch (err) {
      console.error("Delete failed:", err);
      const msg = err instanceof Error ? err.message : "Failed to delete product.";
      setErrorMessage(msg);
      setIsDeleting(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-[100dvh] bg-background text-foreground flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="p-8 max-w-md text-center flex flex-col items-center gap-4">
            <h2 className="text-xl font-bold">Sign in required</h2>
            <p className="text-sm text-muted-foreground">Please sign in to manage your products.</p>
            <Link href="/sign-in">
              <Button className="bg-[#FF6154] text-white">Sign In</Button>
            </Link>
          </Card>
        </main>
      </div>
    );
  }

  if (product === undefined) {
    return (
      <div className="min-h-[100dvh] bg-background text-foreground flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 flex flex-col gap-6">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </main>
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="min-h-[100dvh] bg-background text-foreground flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="p-8 max-w-md text-center flex flex-col items-center gap-3">
            <h2 className="text-xl font-bold">Product not found</h2>
            <p className="text-sm text-muted-foreground">This product may have been removed or doesn&apos;t exist.</p>
            <Link href="/dashboard">
              <Button variant="outline">Return to Dashboard</Button>
            </Link>
          </Card>
        </main>
      </div>
    );
  }

  const isOwner = currentUser && (product.submitterId === currentUser._id || (product.makerIds ?? []).includes(currentUser._id));

  if (!isOwner) {
    return (
      <div className="min-h-[100dvh] bg-background text-foreground flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="p-8 max-w-md text-center flex flex-col items-center gap-3 border-destructive/30">
            <AlertTriangle className="size-10 text-destructive" />
            <h2 className="text-xl font-bold">Access Denied</h2>
            <p className="text-sm text-muted-foreground">
              You do not have permission to edit this product. Only the creator can modify its listing.
            </p>
            <Link href={`/products/${product.slug}`}>
              <Button variant="outline">View Public Listing</Button>
            </Link>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col w-full">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 sm:pb-40">
        {/* Navigation Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/10 cursor-pointer transition-colors">
                <ChevronLeft className="size-4" />
                <span>Dashboard</span>
              </Button>
            </Link>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-xs text-muted-foreground font-mono">Editing /{product.slug}</span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link href={`/products/${product.slug}`}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs font-normal hover:border-orange-500/50 hover:text-orange-600 dark:hover:text-orange-400 transition-all cursor-pointer">
                <Eye className="size-3.5" />
                <span>View Live</span>
              </Button>
            </Link>

            {status !== "launched" && (
              <Button
                size="sm"
                onClick={handlePublishNow}
                disabled={isPublishing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs gap-1.5 shadow-xs cursor-pointer"
              >
                {isPublishing ? <Spinner className="size-3.5" /> : <Check className="size-3.5" />}
                <span>Publish Now</span>
              </Button>
            )}
          </div>
        </div>

        {/* Page Title */}
        <div className="py-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Edit &quot;{product.name}&quot;
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-normal">
            Update your product description, media, pricing, makers, team roles, and launch date.
          </p>
        </div>

        {/* Status Alerts */}
        {saveSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2 animate-in fade-in-0">
            <Check className="size-4 shrink-0" />
            <span>Changes saved successfully!</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="size-4 shrink-0" />
            <span className="whitespace-pre-line leading-relaxed font-normal">{errorMessage}</span>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSaveChanges} className="flex flex-col gap-8">
          {/* Card 1: Core Details */}
          <Card className="p-4 sm:p-6">
            <CardHeader className="p-0 pb-4 mb-4 border-b border-border/60 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Product Information</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAiAssistant((prev) => !prev)}
                className="h-7 text-xs font-medium text-orange-600 dark:text-orange-400 border-orange-500/30 hover:bg-orange-500/10 hover:border-orange-500/60 gap-1.5 cursor-pointer shadow-2xs"
              >
                <Sparkles className="size-3" />
                <span>{showAiAssistant ? "Hide AI Pitch" : "✨ AI Pitch Copilot"}</span>
              </Button>
            </CardHeader>

            {/* AI Launch Pitch Assistant Drawer */}
            {showAiAssistant && (
              <div className="mb-5">
                <AiLaunchAssistant
                  productName={name}
                  category={selectedCategories[0] || "AI"}
                  onApplyTagline={(val) => {
                    setTagline(val);
                    if (fieldErrors.tagline) {
                      setFieldErrors((prev) => ({ ...prev, tagline: "" }));
                    }
                  }}
                  onApplyDescription={(val) => {
                    setDescription(val);
                  }}
                  onClose={() => setShowAiAssistant(false)}
                />
              </div>
            )}

            <FieldGroup>
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel className={cn(fieldErrors.name && "text-destructive font-medium")}>
                    Product Name *
                  </FieldLabel>
                  {fieldErrors.name && (
                    <span className="text-xs text-destructive flex items-center gap-1 font-normal">
                      <AlertCircle className="size-3" /> {fieldErrors.name}
                    </span>
                  )}
                </div>
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  placeholder="Product name"
                  className={cn(fieldErrors.name && "border-destructive ring-1 ring-destructive/40 bg-destructive/5", "font-normal")}
                  required
                />
              </Field>

              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel className={cn(fieldErrors.slug && "text-destructive font-medium")}>
                    URL Slug *
                  </FieldLabel>
                  {newSlug.trim() && slugCheck !== undefined && (
                    slugCheck.available ? (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-normal flex items-center gap-1">
                        <CheckCircle2 className="size-3" /> Available
                      </span>
                    ) : (
                      <span className="text-[11px] text-destructive font-normal flex items-center gap-1">
                        <AlertCircle className="size-3" /> Taken
                      </span>
                    )
                  )}
                </div>

                <div className="flex items-center">
                  <span className="inline-flex items-center px-3 py-2 rounded-l-xl border border-r-0 border-border bg-muted text-xs font-mono text-muted-foreground font-normal">
                    /products/
                  </span>
                  <Input
                    value={newSlug}
                    onChange={(e) => {
                      setNewSlug(e.target.value);
                      if (fieldErrors.slug) setFieldErrors((prev) => ({ ...prev, slug: "" }));
                    }}
                    placeholder="my-awesome-tool"
                    className={cn(
                      "rounded-l-none font-mono text-sm font-normal",
                      (fieldErrors.slug || (newSlug.trim() && slugCheck && !slugCheck.available))
                        ? "border-destructive ring-1 ring-destructive/40 bg-destructive/5"
                        : ""
                    )}
                    required
                  />
                </div>

                {newSlug.trim() && slugCheck && !slugCheck.available && slugCheck.suggestion && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
                    <span className="text-muted-foreground text-[11px] font-normal">Taken. Try:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setNewSlug(slugCheck.suggestion!);
                        if (fieldErrors.slug) setFieldErrors((prev) => ({ ...prev, slug: "" }));
                      }}
                      className="px-2 py-0.5 rounded-md bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-mono text-[11px] font-medium border border-orange-500/30 transition-colors cursor-pointer"
                    >
                      /{slugCheck.suggestion}
                    </button>
                  </div>
                )}
                {fieldErrors.slug && (
                  <span className="text-xs text-destructive flex items-center gap-1 font-normal pt-1">
                    <AlertCircle className="size-3" /> {fieldErrors.slug}
                  </span>
                )}
              </Field>

              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel className={cn(fieldErrors.tagline && "text-destructive font-medium")}>
                    Tagline * (Max 60 chars)
                  </FieldLabel>
                  <span className={cn("text-[11px] font-mono", tagline.length > 60 ? "text-destructive font-semibold" : "text-muted-foreground")}>
                    {tagline.length}/60
                  </span>
                </div>
                <Input
                  value={tagline}
                  onChange={(e) => {
                    setTagline(e.target.value);
                    if (fieldErrors.tagline) setFieldErrors((prev) => ({ ...prev, tagline: "" }));
                  }}
                  maxLength={60}
                  placeholder="One line pitch"
                  className={cn(fieldErrors.tagline && "border-destructive ring-1 ring-destructive/40 bg-destructive/5", "font-normal")}
                  required
                />
                {fieldErrors.tagline && (
                  <span className="text-xs text-destructive flex items-center gap-1 font-normal pt-1">
                    <AlertCircle className="size-3" /> {fieldErrors.tagline}
                  </span>
                )}
              </Field>

              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel className={cn(fieldErrors.websiteUrl && "text-destructive font-medium")}>
                    Website URL *
                  </FieldLabel>
                  {fieldErrors.websiteUrl && (
                    <span className="text-xs text-destructive flex items-center gap-1 font-normal">
                      <AlertCircle className="size-3" /> {fieldErrors.websiteUrl}
                    </span>
                  )}
                </div>
                <Input
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => {
                    setWebsiteUrl(e.target.value);
                    if (fieldErrors.websiteUrl) setFieldErrors((prev) => ({ ...prev, websiteUrl: "" }));
                  }}
                  placeholder="https://myproduct.com"
                  className={cn(fieldErrors.websiteUrl && "border-destructive ring-1 ring-destructive/40 bg-destructive/5", "font-normal")}
                  required
                />
                {!fieldErrors.websiteUrl && (
                  <FieldDescription>Valid website link (e.g. https://yourdomain.com)</FieldDescription>
                )}
              </Field>

              <Field>
                <FieldLabel>Demo Video URL</FieldLabel>
                <Input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/... or https://loom.com/..."
                  className="font-normal"
                />
              </Field>

              <Field>
                <FieldLabel>Full Description</FieldLabel>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder="Describe your product..."
                  className="font-normal"
                />
              </Field>
            </FieldGroup>
          </Card>

          {/* Card 2: Makers & Team Roles */}
          <Card className="p-4 sm:p-6">
            <CardHeader className="p-0 pb-4 mb-4 border-b border-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-orange-500" />
                  <CardTitle className="text-base font-semibold">Makers & Team Roles</CardTitle>
                </div>
                <span className="text-xs text-muted-foreground font-mono font-normal">
                  {taggedMakers.length} team {taggedMakers.length === 1 ? "member" : "members"}
                </span>
              </div>
            </CardHeader>

            <FieldGroup>
              <Field>
                <FieldLabel>Add Team Members</FieldLabel>
                <Input
                  placeholder="Search users to add to this launch team..."
                  value={makerSearch}
                  onChange={(e) => setMakerSearch(e.target.value)}
                  className="font-normal"
                />

                {/* Autocomplete Search Dropdown */}
                {searchResults && searchResults.length > 0 && (
                  <div className="mt-1.5 p-1 rounded-xl border border-border bg-popover shadow-lg flex flex-col gap-1 max-h-52 overflow-y-auto z-20">
                    {searchResults.map((user) => (
                      <button
                        key={user._id}
                        type="button"
                        onClick={() => addMaker(user)}
                        className="flex items-center gap-2.5 p-2 rounded-lg text-left hover:bg-muted transition-colors cursor-pointer"
                      >
                        <Avatar className="size-8 rounded-full border border-border">
                          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                          <AvatarFallback className="text-xs font-semibold">{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-xs font-medium text-foreground truncate">{user.name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono font-normal">@{user.username}</span>
                        </div>
                        <span className="text-xs text-orange-600 font-medium">+ Add</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Tagged Makers List with Role Dropdown */}
                {taggedMakers.length > 0 && (
                  <div className="flex flex-col gap-2 pt-3">
                    {taggedMakers.map((m) => {
                      const isCustom = !STANDARD_MAKER_ROLES.includes(m.role);
                      return (
                        <div
                          key={m._id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-border/80 bg-muted/20 hover:border-orange-500/40 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Avatar className="size-9 rounded-full border border-border bg-muted shrink-0">
                              {m.avatarUrl && <AvatarImage src={m.avatarUrl} alt={m.name} />}
                              <AvatarFallback className="text-xs font-semibold">{m.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs sm:text-sm font-medium text-foreground truncate">
                                {m.name}
                              </span>
                              <span className="text-[11px] text-muted-foreground font-mono truncate font-normal">
                                @{m.username}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-1.5">
                              <select
                                value={isCustom ? "Custom" : m.role}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateMakerRole(m._id, val === "Custom" ? "" : val);
                                }}
                                className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground cursor-pointer focus:ring-1 focus:ring-orange-500 focus:outline-none"
                              >
                                {STANDARD_MAKER_ROLES.map((preset) => (
                                  <option key={preset} value={preset}>
                                    {preset}
                                  </option>
                                ))}
                                <option value="Custom">Custom Role...</option>
                              </select>

                              {isCustom && (
                                <Input
                                  placeholder="e.g. AI Lead, Advisor"
                                  value={m.role}
                                  onChange={(e) => updateMakerRole(m._id, e.target.value)}
                                  className="text-xs h-8.5 max-w-[140px] font-normal"
                                  autoFocus
                                />
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => removeMaker(m._id)}
                              className="p-1.5 text-muted-foreground hover:text-red-600 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Remove from team"
                            >
                              <X className="size-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Field>
            </FieldGroup>
          </Card>

          {/* Card 3: Pricing & Categories */}
          <Card className={cn("p-4 sm:p-6 transition-all", fieldErrors.categories && "border-destructive/50 ring-1 ring-destructive/20")}>
            <CardHeader className="p-0 pb-4 mb-4 border-b border-border/60">
              <CardTitle className="text-base font-semibold">Pricing & Categories</CardTitle>
            </CardHeader>

            <FieldGroup>
              <Field>
                <FieldLabel>Pricing Model *</FieldLabel>
                <div className="grid grid-cols-3 gap-3">
                  {(["free", "freemium", "paid"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPricing(p)}
                      className={cn(
                        "p-3 rounded-xl border text-center text-xs capitalize transition-all cursor-pointer",
                        pricing === p
                          ? "border-[#FF6154] bg-orange-500/10 text-orange-600 dark:text-orange-400 ring-1 ring-[#FF6154] font-medium"
                          : "border-border hover:bg-muted font-normal"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </Field>

              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel className={cn(fieldErrors.categories && "text-destructive font-medium")}>
                    Categories * (Pick 1 to 3)
                  </FieldLabel>
                  {fieldErrors.categories && (
                    <span className="text-xs text-destructive flex items-center gap-1 font-normal">
                      <AlertCircle className="size-3" /> {fieldErrors.categories}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs border transition-all cursor-pointer",
                          isSelected
                            ? "bg-foreground text-background border-foreground font-medium"
                            : "bg-muted/60 text-muted-foreground border-border hover:bg-muted font-normal"
                        )}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </FieldGroup>
          </Card>

          {/* Card 4: Launch Timing & Status */}
          <Card className="p-4 sm:p-6">
            <CardHeader className="p-0 pb-4 mb-4 border-b border-border/60">
              <CardTitle className="text-base font-semibold">Launch Timing & Status</CardTitle>
            </CardHeader>

            <FieldGroup>
              <Field>
                <FieldLabel>Product Status</FieldLabel>
                <div className="grid grid-cols-3 gap-3">
                  {(["draft", "scheduled", "launched"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={cn(
                        "p-3 rounded-xl border text-center text-xs capitalize transition-all cursor-pointer",
                        status === s
                          ? "border-[#FF6154] bg-orange-500/10 text-orange-600 dark:text-orange-400 ring-1 ring-[#FF6154] font-medium"
                          : "border-border hover:bg-muted font-normal"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Field>

              <Field>
                <FieldLabel>Launch Date</FieldLabel>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <DatePickerField
                    value={launchDate}
                    onChange={setLaunchDate}
                    minDate="2026-08-28"
                    allowFuture={true}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setLaunchDate("2026-08-28")}
                    className="text-xs cursor-pointer font-normal h-10 px-3.5"
                  >
                    Set to Today (Aug 28)
                  </Button>
                </div>
              </Field>
            </FieldGroup>
          </Card>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-border/80">
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              className="gap-1.5 cursor-pointer"
            >
              <Trash2 className="size-4" />
              <span>Delete Product</span>
            </Button>

            <div className="flex items-center gap-3 justify-end flex-wrap">
              {saveSuccess && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/30 animate-in fade-in-0 slide-in-from-bottom-2">
                  <Check className="size-3.5" />
                  <span>Changes Saved!</span>
                </div>
              )}

              <Link href={`/products/${product.slug}`}>
                <Button variant="ghost" type="button" className="cursor-pointer">
                  Cancel
                </Button>
              </Link>

              <Button
                type="submit"
                disabled={isSaving}
                className="bg-[#FF6154] hover:bg-[#e04f43] text-white font-semibold gap-2 shadow-xs hover:shadow-md hover:shadow-orange-500/25 min-h-[40px] px-5 active:scale-95 cursor-pointer transition-all duration-200"
              >
                {isSaving ? <Spinner className="size-4" /> : <Save className="size-4" />}
                <span>Save Changes</span>
              </Button>
            </div>
          </div>
        </form>

        {/* Floating Toast Notification (Always visible wherever user scrolls) */}
        {saveSuccess && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-background/95 backdrop-blur-xl border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-2xl shadow-emerald-500/10 animate-in fade-in-0 slide-in-from-bottom-4">
            <div className="size-8 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Check className="size-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-xs text-foreground">Changes Saved Successfully</span>
              <span className="text-[11px] text-muted-foreground">Product listing updated live</span>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in-0">
            <Card className="max-w-md w-full p-6 flex flex-col gap-4 border-destructive/40 shadow-2xl">
              <div className="flex items-center gap-3 text-destructive">
                <AlertTriangle className="size-6" />
                <h3 className="text-lg font-bold">Delete Product Listing?</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                This action is permanent and cannot be undone. All upvotes, comments, badges, and maker associations for &quot;{product.name}&quot; will be permanently deleted.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteProduct}
                  disabled={isDeleting}
                  className="gap-1.5 cursor-pointer"
                >
                  {isDeleting ? <Spinner className="size-3.5" /> : <Trash2 className="size-3.5" />}
                  <span>Confirm Delete</span>
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}