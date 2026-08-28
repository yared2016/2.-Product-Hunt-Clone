"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";
import { Navbar } from "@/components/Navbar";
import { DatePickerField } from "@/components/DatePickerField";
import { AiLaunchAssistant } from "@/components/AiLaunchAssistant";
import { Card } from "@/components/ui/card";
import { FieldGroup, Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Rocket,
  UploadCloud,
  Image as ImageIcon,
  X,
  Eye,
  Calendar,
  AlertCircle,
  Gift,
  CheckCircle2,
  Sparkles,
  Zap,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

const STANDARD_ROLES = [
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

export default function SubmitPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const profile = useQuery(api.users.getMyProfile);
  const isPro = Boolean(profile?.isPro || profile?.plan === "pro");

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [pricing, setPricing] = useState<"free" | "freemium" | "paid">("freemium");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["AI"]);
  const [videoUrl, setVideoUrl] = useState("");
  const [launchDate, setLaunchDate] = useState("2026-08-28");
  const [isPromoted, setIsPromoted] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState("");

  // Media upload state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  // Maker tagging state
  const [makerSearch, setMakerSearch] = useState("");
  const [taggedMakers, setTaggedMakers] = useState<
    Array<{ _id: Id<"users">; name: string; username: string; avatarUrl?: string; role: string }>
  >([]);

  // UI & Validation state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Convex mutations & queries
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);
  const submitProduct = useMutation(api.products.create);
  const searchResults = useQuery(
    api.users.searchUsers,
    makerSearch.trim().length > 1 ? { search: makerSearch } : "skip"
  );

  // Real-time slug availability query
  const slugCheck = useQuery(
    api.products.isSlugAvailable,
    slug.trim() ? { slug: slug.trim() } : "skip"
  );

  const handleNameChange = (val: string) => {
    setName(val);
    if (fieldErrors.name) {
      setFieldErrors((prev) => ({ ...prev, name: "" }));
    }
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(autoSlug);
    if (fieldErrors.slug) {
      setFieldErrors((prev) => ({ ...prev, slug: "" }));
    }
  };

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

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setGalleryFiles((prev) => [...prev, ...files]);
      const newPreviews = files.map((f) => URL.createObjectURL(f));
      setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles(galleryFiles.filter((_, i) => i !== index));
    setGalleryPreviews(galleryPreviews.filter((_, i) => i !== index));
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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // 1. Validate Product Name
    if (!name.trim()) {
      errors.name = "Product name is required.";
    }

    // 2. Validate Tagline
    if (!tagline.trim()) {
      errors.tagline = "Tagline is required.";
    } else if (tagline.length > 60) {
      errors.tagline = "Tagline must be 60 characters or less.";
    }

    // 3. Validate URL Slug
    if (!slug.trim()) {
      errors.slug = "URL slug is required.";
    } else if (!/^[a-z0-9-]+$/i.test(slug.trim())) {
      errors.slug = "Slug can only contain letters, numbers, and hyphens.";
    } else if (slugCheck && !slugCheck.available) {
      errors.slug = `The URL slug "/products/${slug.trim()}" is already taken. Please choose a unique slug or use our suggestion below.`;
    }

    // 4. Strictly Validate Website URL
    if (!websiteUrl.trim()) {
      errors.websiteUrl = "Website URL is required.";
    } else if (!isValidHttpUrl(websiteUrl)) {
      errors.websiteUrl = "Please enter a valid website URL (e.g. https://yourproduct.com).";
    }

    // 5. Validate Categories
    if (selectedCategories.length === 0) {
      errors.categories = "Please select at least one category.";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const errorList = Object.values(errors);
      setErrorMessage(
        `Please complete the mandatory fields below to launch:\n• ${errorList.join("\n• ")}`
      );
      window.scrollTo({ top: 140, behavior: "smooth" });
      return false;
    }

    setErrorMessage(null);
    return true;
  };

  const handleSubmit = async (status: "draft" | "scheduled" | "launched") => {
    if (!isSignedIn) {
      setErrorMessage("Please sign in before submitting a product.");
      window.scrollTo({ top: 140, behavior: "smooth" });
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      // Format Website URL with https:// if missing protocol
      let formattedWebsiteUrl = websiteUrl.trim();
      if (!formattedWebsiteUrl.startsWith("http://") && !formattedWebsiteUrl.startsWith("https://")) {
        formattedWebsiteUrl = `https://${formattedWebsiteUrl}`;
      }

      // 1. Upload Logo if selected
      let logoId: Id<"_storage"> | undefined;
      if (logoFile) {
        const uploadUrl = await generateUploadUrl();
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": logoFile.type },
          body: logoFile,
        });
        const json = await res.json();
        logoId = json.storageId as Id<"_storage">;
      }

      // 2. Upload Gallery images if selected
      const galleryIds: Id<"_storage">[] = [];
      for (const file of galleryFiles) {
        const uploadUrl = await generateUploadUrl();
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const json = await res.json();
        galleryIds.push(json.storageId as Id<"_storage">);
      }

      const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");

      // 3. Submit to Convex
      await submitProduct({
        name: name.trim(),
        slug: cleanSlug,
        tagline: tagline.trim(),
        description: description.trim() || tagline.trim(),
        websiteUrl: formattedWebsiteUrl,
        logoId,
        galleryIds: galleryIds.length > 0 ? galleryIds : undefined,
        videoUrl: videoUrl.trim() || undefined,
        pricing,
        categories: selectedCategories,
        makerIds: taggedMakers.map((m) => m._id),
        makers: taggedMakers.map((m) => ({
          userId: m._id,
          role: m.role || "Maker",
        })),
        status,
        launchDate,
        isPromoted: Boolean(isPro && isPromoted),
        promoCode: promoCode.trim() || undefined,
        promoDiscount: promoDiscount.trim() || undefined,
      });

      router.push(status === "launched" ? `/products/${cleanSlug}` : "/dashboard");
    } catch (err) {
      console.error("Submission failed:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Submission failed. Please check your fields and try again.";

      if (msg.includes("already exists") || msg.includes("slug")) {
        setFieldErrors((prev) => ({
          ...prev,
          slug: "This URL slug is already taken. Please choose a different slug or use our suggestion.",
        }));
        setErrorMessage("A product with this URL slug already exists. Please choose a unique URL slug below.");
      } else {
        setErrorMessage(msg);
      }

      window.scrollTo({ top: 140, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 sm:pb-40">
        {/* Page Header */}
        <div className="flex flex-col gap-2 pb-8 border-b border-border/80">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-orange-600 dark:text-orange-400">
            <Rocket className="size-4" />
            <span>Launch on Launchpad</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Submit your product
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl font-normal">
            Showcase your creation to early adopters, investors, and fellow makers. Required fields are marked with (*).
          </p>
        </div>

        {/* Form Validation Alert Banner on Page */}
        {errorMessage && (
          <div className="mt-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/40 text-destructive flex items-start gap-3 animate-in fade-in-0 slide-in-from-top-2">
            <AlertCircle className="size-5 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 text-xs sm:text-sm">
              <span className="font-semibold">Required information missing:</span>
              <span className="whitespace-pre-line leading-relaxed opacity-95 font-normal">{errorMessage}</span>
            </div>
          </div>
        )}

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
          {/* Main Form Fields (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Step 1: Basic Info */}
            <Card className={cn("p-4 sm:p-6 transition-all", (fieldErrors.name || fieldErrors.tagline || fieldErrors.slug || fieldErrors.websiteUrl) && "border-destructive/50 ring-1 ring-destructive/20")}>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-[#FF6154] text-white text-xs font-semibold">1</span>
                  <h2 className="font-semibold text-base">Basic Information</h2>
                </div>
                <div className="flex items-center gap-2">
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
                  <span className="text-[11px] text-orange-600 dark:text-orange-400 font-normal hidden sm:inline">* Required</span>
                </div>
              </div>

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
                {/* Product Name */}
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
                    placeholder="e.g. Acme AI"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className={cn(fieldErrors.name && "border-destructive ring-1 ring-destructive/40 bg-destructive/5", "font-normal")}
                    required
                  />
                </Field>

                {/* Tagline */}
                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel className={cn(fieldErrors.tagline && "text-destructive font-medium")}>
                      Tagline *
                    </FieldLabel>
                    <span className={cn("text-[11px] font-mono", tagline.length > 60 ? "text-destructive font-semibold" : "text-muted-foreground")}>
                      {tagline.length}/60
                    </span>
                  </div>
                  <Input
                    placeholder="Brief, catchy one-liner explaining what it does"
                    value={tagline}
                    maxLength={60}
                    onChange={(e) => {
                      setTagline(e.target.value);
                      if (fieldErrors.tagline) {
                        setFieldErrors((prev) => ({ ...prev, tagline: "" }));
                      }
                    }}
                    className={cn(fieldErrors.tagline && "border-destructive ring-1 ring-destructive/40 bg-destructive/5", "font-normal")}
                    required
                  />
                  {fieldErrors.tagline ? (
                    <span className="text-xs text-destructive flex items-center gap-1 font-normal pt-1">
                      <AlertCircle className="size-3" /> {fieldErrors.tagline}
                    </span>
                  ) : (
                    <FieldDescription>Summarize the core value in 60 characters or less.</FieldDescription>
                  )}
                </Field>

                {/* Slug and Website URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* URL Slug */}
                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel className={cn(fieldErrors.slug && "text-destructive font-semibold")}>
                        URL Slug *
                      </FieldLabel>
                      {slug.trim() && slugCheck !== undefined && (
                        slugCheck.available ? (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="size-3" /> Available
                          </span>
                        ) : (
                          <span className="text-[11px] text-destructive font-medium flex items-center gap-1">
                            <AlertCircle className="size-3" /> Taken
                          </span>
                        )
                      )}
                    </div>
                    <Input
                      placeholder="acme-ai"
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value);
                        if (fieldErrors.slug) {
                          setFieldErrors((prev) => ({ ...prev, slug: "" }));
                        }
                      }}
                      className={cn(
                        fieldErrors.slug || (slug.trim() && slugCheck && !slugCheck.available)
                          ? "border-destructive ring-1 ring-destructive/40 bg-destructive/5"
                          : slug.trim() && slugCheck?.available
                          ? "border-emerald-500/50 focus-visible:ring-emerald-500"
                          : "",
                        "font-mono text-sm"
                      )}
                      required
                    />

                    {/* Slug feedback & suggestions */}
                    {slug.trim() && slugCheck && !slugCheck.available && slugCheck.suggestion && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
                        <span className="text-muted-foreground text-[11px]">Taken. Try:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSlug(slugCheck.suggestion!);
                            if (fieldErrors.slug) {
                              setFieldErrors((prev) => ({ ...prev, slug: "" }));
                            }
                          }}
                          className="px-2 py-0.5 rounded-md bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-mono text-[11px] font-semibold border border-orange-500/30 transition-colors cursor-pointer"
                        >
                          /{slugCheck.suggestion}
                        </button>
                      </div>
                    )}

                    {fieldErrors.slug && (
                      <span className="text-xs text-destructive flex items-center gap-1 font-medium pt-1">
                        <AlertCircle className="size-3" /> {fieldErrors.slug}
                      </span>
                    )}
                  </Field>

                  {/* Website URL */}
                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel className={cn(fieldErrors.websiteUrl && "text-destructive font-semibold")}>
                        Website URL *
                      </FieldLabel>
                    </div>
                    <Input
                      placeholder="https://acme.ai"
                      value={websiteUrl}
                      onChange={(e) => {
                        setWebsiteUrl(e.target.value);
                        if (fieldErrors.websiteUrl) {
                          setFieldErrors((prev) => ({ ...prev, websiteUrl: "" }));
                        }
                      }}
                      className={cn(fieldErrors.websiteUrl && "border-destructive ring-1 ring-destructive/40 bg-destructive/5")}
                      required
                    />
                    {fieldErrors.websiteUrl ? (
                      <span className="text-xs text-destructive flex items-center gap-1 font-medium pt-1">
                        <AlertCircle className="size-3" /> {fieldErrors.websiteUrl}
                      </span>
                    ) : (
                      <FieldDescription>Valid URL (e.g. https://yourdomain.com)</FieldDescription>
                    )}
                  </Field>
                </div>

                {/* Pricing Model */}
                <Field>
                  <FieldLabel>Pricing Model *</FieldLabel>
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/80 max-w-xs">
                    {(["free", "freemium", "paid"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPricing(p)}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg text-xs capitalize transition-all select-none cursor-pointer",
                          pricing === p
                            ? "bg-background text-foreground shadow-xs font-medium ring-1 ring-border/80"
                            : "text-muted-foreground hover:text-foreground font-normal"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </Field>
              </FieldGroup>
            </Card>

            {/* Step 2: Media & Assets */}
            <Card className="p-4 sm:p-6">
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-border/60">
                <span className="flex size-6 items-center justify-center rounded-full bg-[#FF6154] text-white text-xs font-semibold">2</span>
                <h2 className="font-semibold text-base">Media & Assets (Optional)</h2>
              </div>

              <FieldGroup>
                {/* Logo Upload */}
                <Field>
                  <FieldLabel>Product Logo (Square)</FieldLabel>
                  <div className="flex items-center gap-4">
                    <Avatar className="size-16 rounded-2xl border border-border shadow-xs bg-muted">
                      {logoPreview && <AvatarImage src={logoPreview} alt="Logo Preview" />}
                      <AvatarFallback className="rounded-2xl font-semibold bg-muted text-muted-foreground">
                        <ImageIcon className="size-6 opacity-40" />
                      </AvatarFallback>
                    </Avatar>

                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoSelect}
                      />
                      <Button type="button" variant="outline" size="sm" className="pointer-events-none gap-2 font-normal">
                        <UploadCloud className="size-4" />
                        <span>Upload Logo</span>
                      </Button>
                    </label>

                    {logoFile && (
                      <span className="text-xs text-muted-foreground truncate max-w-xs font-normal">{logoFile.name}</span>
                    )}
                  </div>
                </Field>

                {/* Screenshots Gallery */}
                <Field>
                  <FieldLabel>Gallery Screenshots (Up to 5)</FieldLabel>
                  <label className="border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-orange-500/50 hover:bg-orange-500/5 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleGallerySelect}
                    />
                    <UploadCloud className="size-8 text-muted-foreground opacity-60" />
                    <span className="text-xs font-normal text-foreground">Click to upload screenshots</span>
                    <span className="text-[11px] text-muted-foreground font-normal">Show your app in action</span>
                  </label>

                  {/* Thumbnail Previews */}
                  {galleryPreviews.length > 0 && (
                    <div className="flex items-center gap-2.5 flex-wrap pt-2">
                      {galleryPreviews.map((url, idx) => (
                        <div key={idx} className="relative size-16 rounded-xl border border-border overflow-hidden group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`Screenshot ${idx + 1}`} className="size-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(idx)}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </Field>

                {/* Demo Video URL */}
                <Field>
                  <FieldLabel>Demo Video URL (Optional)</FieldLabel>
                  <Input
                    placeholder="https://youtube.com/watch?v=... or https://loom.com/share/..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="font-normal"
                  />
                  <FieldDescription>YouTube, Loom, or Vimeo video embed link.</FieldDescription>
                </Field>
              </FieldGroup>
            </Card>

            {/* Step 3: Categories & Description */}
            <Card className={cn("p-4 sm:p-6 transition-all", fieldErrors.categories && "border-destructive/50 ring-1 ring-destructive/20")}>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-[#FF6154] text-white text-xs font-semibold">3</span>
                  <h2 className="font-semibold text-base">Categories & Description</h2>
                </div>
                <span className="text-[11px] text-orange-600 dark:text-orange-400 font-normal">* Category Required</span>
              </div>

              <FieldGroup>
                {/* Categories */}
                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel className={cn(fieldErrors.categories && "text-destructive font-medium")}>
                      Categories * (Select at least 1)
                    </FieldLabel>
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
                            "px-3 py-1.5 rounded-xl text-xs transition-all select-none cursor-pointer border",
                            isSelected
                              ? "bg-[#FF6154]/10 text-orange-600 dark:text-orange-400 border-orange-500/40 font-medium"
                              : "border-border/80 text-muted-foreground hover:bg-muted font-normal"
                          )}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                  {fieldErrors.categories && (
                    <span className="text-xs text-destructive flex items-center gap-1 font-normal pt-1">
                      <AlertCircle className="size-3" /> {fieldErrors.categories}
                    </span>
                  )}
                </Field>

                {/* Description */}
                <Field>
                  <FieldLabel>Full Description</FieldLabel>
                  <Textarea
                    placeholder="Describe your product in detail: what problem does it solve, key features, pricing breakdown, and background..."
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="font-normal"
                  />
                  <FieldDescription>Markdown formatting is supported.</FieldDescription>
                </Field>
              </FieldGroup>
            </Card>

            {/* Step 4: Special Launch Promo Code (Optional) */}
            <Card className="p-4 sm:p-6">
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-border/60">
                <span className="flex size-6 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-semibold">4</span>
                <h2 className="font-semibold text-base flex items-center gap-1.5">
                  <Gift className="size-4 text-amber-500" />
                  <span>Launch Discount & Perks (Optional)</span>
                </h2>
              </div>

              <FieldGroup>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Promo Code</FieldLabel>
                    <Input
                      placeholder="e.g. LAUNCHPAD30, FOUNDER50"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="font-mono text-sm uppercase font-normal"
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Discount / Perk Description</FieldLabel>
                    <Input
                      placeholder="e.g. 30% OFF for 6 months, 50 FREE credits"
                      value={promoDiscount}
                      onChange={(e) => setPromoDiscount(e.target.value)}
                      className="font-normal"
                    />
                  </Field>
                </div>
                <FieldDescription>
                  Incentivize Launchpad users to test and convert by offering an exclusive launch promo code.
                </FieldDescription>
              </FieldGroup>
            </Card>

            {/* Step 5: Maker Tagging & Team Roles */}
            <Card className="p-4 sm:p-6">
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-border/60">
                <span className="flex size-6 items-center justify-center rounded-full bg-[#FF6154] text-white text-xs font-semibold">5</span>
                <div className="flex flex-col">
                  <h2 className="font-semibold text-base">Makers & Team Roles</h2>
                  <span className="text-xs text-muted-foreground font-normal">Assign roles like CEO, Founder, CTO, Lead Designer, etc.</span>
                </div>
              </div>

              <FieldGroup>
                <Field>
                  <FieldLabel>Search and Add Team Members</FieldLabel>
                  <Input
                    placeholder="Search by name, username, or email..."
                    value={makerSearch}
                    onChange={(e) => setMakerSearch(e.target.value)}
                    className="font-normal"
                  />

                  {/* Autocomplete Results Dropdown */}
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

                  {/* Tagged Makers List with Role Selector */}
                  {taggedMakers.length > 0 && (
                    <div className="flex flex-col gap-2 pt-3">
                      <span className="text-xs font-medium text-foreground">Tagged Team ({taggedMakers.length}):</span>
                      <div className="flex flex-col gap-2">
                        {taggedMakers.map((m) => {
                          const isCustom = !STANDARD_ROLES.includes(m.role);

                          return (
                            <div
                              key={m._id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-border/80 bg-muted/20 hover:border-orange-500/40 transition-all"
                            >
                              {/* Maker Identity */}
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

                              {/* Role Selector & Actions */}
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
                                    {STANDARD_ROLES.map((preset) => (
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
                    </div>
                  )}
                </Field>
              </FieldGroup>
            </Card>

            {/* Step 6: Launch Date & Schedule */}
            <Card className="p-6">
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-border/60">
                <span className="flex size-6 items-center justify-center rounded-full bg-[#FF6154] text-white text-xs font-semibold">6</span>
                <h2 className="font-semibold text-base">Launch Date & Pro Boost</h2>
              </div>

              <FieldGroup>
                <Field>
                  <FieldLabel>Target Launch Date</FieldLabel>
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
                      className="text-xs font-normal cursor-pointer h-10 px-3.5"
                    >
                      <Calendar className="size-3.5 mr-1" />
                      Set to Today (Aug 28, 2026)
                    </Button>
                  </div>
                  <FieldDescription>
                    Launches go live immediately on the chosen date and compete on that day&apos;s leaderboard.
                  </FieldDescription>
                </Field>

                {/* Pro Superuser Boost Block */}
                <div className="mt-4 p-4 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-card to-card flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <Zap className="size-4 fill-current" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-1.5">
                          <span>Top of Feed Boost (Sponsored Placement)</span>
                          <Badge className="text-[10px] py-0 px-1.5 bg-amber-500 text-white font-bold border-0">PRO</Badge>
                        </h4>
                        <p className="text-[11px] text-muted-foreground font-normal">
                          Push your listing to #1 on daily rankings with a radiant gold badge.
                        </p>
                      </div>
                    </div>

                    {isPro ? (
                      <button
                        type="button"
                        onClick={() => setIsPromoted(!isPromoted)}
                        className={cn(
                          "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none active:scale-95 shadow-xs border",
                          isPromoted
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-500 shadow-amber-500/20"
                            : "border-border bg-background text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {isPromoted ? "⚡ Boost Enabled" : "Enable Boost"}
                      </button>
                    ) : (
                      <Link href="/upgrade">
                        <Button size="sm" className="bg-gradient-to-r from-orange-500 via-[#FF6154] to-amber-500 text-white text-xs font-semibold shadow-xs hover:shadow-md cursor-pointer gap-1.5">
                          <Crown className="size-3.5 text-amber-200" />
                          <span>Unlock with Pro ($99/mo)</span>
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </FieldGroup>
            </Card>
          </div>

          {/* Sidebar Actions & Live Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Live Preview Card */}
            <Card className="p-6 sticky top-24">
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-border/60">
                <Eye className="size-4 text-orange-500" />
                <h3 className="font-semibold text-sm">Listing Preview</h3>
              </div>

              <div className="flex flex-col gap-4">
                <div className={cn(
                  "flex items-start gap-3.5 p-3 rounded-2xl border transition-all",
                  isPromoted && isPro
                    ? "border-amber-500/60 bg-gradient-to-r from-amber-500/10 via-card to-card shadow-sm shadow-amber-500/10"
                    : "border-border/80 bg-muted/20"
                )}>
                  <Avatar className="size-14 rounded-2xl border border-border shadow-xs bg-muted shrink-0">
                    {logoPreview && <AvatarImage src={logoPreview} alt="Logo" />}
                    <AvatarFallback className="text-sm font-semibold bg-muted text-muted-foreground">
                      {name ? name.slice(0, 2).toUpperCase() : "LP"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium sm:font-semibold text-sm text-foreground truncate">
                        {name || "Your Product Name"}
                      </span>
                      {isPromoted && isPro && (
                        <Badge className="text-[9px] py-0 px-1.5 font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                          <Zap className="size-2.5 fill-current mr-0.5" />
                          <span>PRO SPONSORED</span>
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-[10px] capitalize px-1.5 py-0 font-normal">
                        {pricing}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 font-normal">
                      {tagline || "Your catchy one-line description will appear here..."}
                    </p>
                    <div className="flex items-center gap-1 flex-wrap pt-1">
                      {selectedCategories.map((c) => (
                        <Badge key={c} variant="outline" className="text-[9px] px-1.5 py-0 font-normal">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submit Action Buttons */}
                <div className="flex flex-col gap-2.5 pt-2">
                  <Button
                    size="lg"
                    disabled={isSubmitting}
                    onClick={() => handleSubmit("launched")}
                    className="w-full bg-[#FF6154] hover:bg-[#FF6154]/90 text-white font-medium gap-2 shadow-sm min-h-[46px] cursor-pointer active:scale-98 transition-all"
                  >
                    {isSubmitting ? (
                      <Spinner className="size-4" />
                    ) : (
                      <Rocket className="size-4" />
                    )}
                    <span>Launch Product Now</span>
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isSubmitting}
                      onClick={() => handleSubmit("scheduled")}
                      className="text-xs min-h-[38px] cursor-pointer font-normal"
                    >
                      <Calendar className="size-3.5 mr-1" />
                      Schedule
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isSubmitting}
                      onClick={() => handleSubmit("draft")}
                      className="text-xs min-h-[38px] cursor-pointer font-normal"
                    >
                      Save Draft
                    </Button>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-muted-foreground/80 text-center flex flex-col gap-1 border-t border-border/40">
                  <div className="flex items-center justify-center gap-1 font-medium">
                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                    <span>Real-time indexing & instant ranking sync</span>
                  </div>
                  <span>Your launch will be instantly featured on the homepage feed and leaderboard.</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
