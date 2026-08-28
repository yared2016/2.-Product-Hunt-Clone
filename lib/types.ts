import { Id } from "@/convex/_generated/dataModel";
import { PricingType } from "./constants";

export type ProductStatus = "draft" | "scheduled" | "launched";

export interface SubmitterInfo {
  _id: Id<"users">;
  name: string;
  username: string;
  avatarUrl?: string;
}

export interface MakerInfo {
  _id: Id<"users">;
  name: string;
  username: string;
  avatarUrl?: string;
  role?: string;
}

export interface ProductSummary {
  _id: Id<"products">;
  name: string;
  slug: string;
  tagline: string;
  pricing: PricingType;
  categories: string[];
  upvoteCount: number;
  commentCount: number;
  isFeatured?: boolean;
  isPromoted?: boolean;
  promoBadgeText?: string;
  status: ProductStatus;
  launchDate: string;
  logoUrl?: string | null;
  submitter?: SubmitterInfo | null;
  makers?: MakerInfo[];
}

export interface AwardInfo {
  _id: Id<"awards">;
  productId: Id<"products">;
  type: "product_of_the_day" | "product_of_the_week" | "product_of_the_month";
  rank: number;
  period: string;
  awardedAt: number;
  product?: ProductSummary | null;
}

export interface UserProfile {
  _id: Id<"users">;
  clerkId: string;
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  websiteUrl?: string;
  plan?: "free" | "pro";
  isPro?: boolean;
  proSubscribedAt?: number;
  createdAt: number;
}
