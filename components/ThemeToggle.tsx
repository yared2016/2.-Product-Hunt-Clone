"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Laptop, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!mounted) {
    return (
      <div className="size-9 rounded-xl bg-muted/40" />
    );
  }

  const THEME_OPTIONS = [
    { key: "light", label: "Light", icon: Sun },
    { key: "dark", label: "Dark", icon: Moon },
    { key: "system", label: "System", icon: Laptop },
  ] as const;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="size-8 sm:size-9 p-0 text-muted-foreground hover:text-foreground active:scale-95 transition-all cursor-pointer rounded-xl shrink-0"
        aria-label="Toggle theme"
        title={`Current theme: ${theme || "system"}`}
      >
        <Sun className="size-4.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
        <Moon className="absolute size-4.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 rounded-2xl border border-border bg-background shadow-2xl p-1.5 z-50 flex flex-col gap-0.5 animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1">
            Appearance
          </div>

          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  setTheme(opt.key);
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center justify-between w-full px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left",
                  isSelected
                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className={cn("size-3.5", isSelected ? "text-orange-500" : "text-muted-foreground")} />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="size-3 text-orange-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
