/**
 * Unified Formatters and Validation Utilities
 * Eliminates duplicate helper functions across the codebase.
 */

/**
 * Extracts initials from a user or product name.
 * e.g., "John Doe" -> "JD", "Launchpad" -> "LA"
 */
export function getInitials(name?: string | null, maxChars = 2): string {
  if (!name || typeof name !== "string") return "LP";
  const trimmed = name.trim();
  if (!trimmed) return "LP";

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, maxChars).toUpperCase();
  }
  return parts
    .slice(0, maxChars)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

/**
 * Ensures a website URL has a valid protocol prefix (https://).
 */
export function formatWebsiteUrl(url?: string | null): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Validates whether a given string is a valid URL.
 */
export function isValidUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const formatted = formatWebsiteUrl(url);
  try {
    const parsed = new URL(formatted);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Formats a Date or "YYYY-MM-DD" string for human-readable display.
 * e.g., "2026-08-28" -> "Aug 28, 2026"
 */
export function formatDateDisplay(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    if (!y || !m || !d) return dateStr;
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Formats timestamp to a concise relative time string.
 * e.g., "5m ago", "2h ago", "3d ago"
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

/**
 * Formats a number compactly with suffix (e.g., 1.2k, 10k).
 */
export function formatNumberCompact(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(num);
}
