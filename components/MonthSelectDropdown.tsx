"use client";

import { useState, useRef, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MonthOption {
  key: string; // "YYYY-MM"
  label: string;
}

interface MonthSelectDropdownProps {
  selectedMonth: string; // "YYYY-MM"
  onSelectMonth: (month: string) => void;
  options: MonthOption[];
  align?: "left" | "right";
}

export function MonthSelectDropdown({
  selectedMonth,
  onSelectMonth,
  options,
  align = "left",
}: MonthSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const selectedLabel =
    options.find((o) => o.key === selectedMonth)?.label || selectedMonth;

  return (
    <div className="relative inline-block text-left shrink-0" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer select-none active:scale-95 shadow-2xs whitespace-nowrap shrink-0",
          isOpen
            ? "border-orange-500 ring-2 ring-orange-500/20 bg-orange-500/[0.06] text-orange-600 dark:text-orange-400"
            : "border-orange-500/35 hover:border-orange-500 bg-background text-foreground hover:bg-orange-500/[0.04]"
        )}
      >
        <div className="flex items-center gap-1.5 shrink-0">
          <CalendarIcon className="size-3 text-orange-500 shrink-0" />
          <span className="font-medium text-xs whitespace-nowrap">{selectedLabel}</span>
        </div>
        <ChevronDown
          className={cn(
            "size-3 text-muted-foreground transition-transform duration-200 shrink-0",
            isOpen && "rotate-180 text-orange-500"
          )}
        />
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div
          className={cn(
            "absolute top-full mt-2 z-50 w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl p-2 flex flex-col gap-1 animate-in fade-in-0 zoom-in-95",
            align === "right" ? "left-0 md:left-auto md:right-0" : "left-0"
          )}
        >
          <div className="px-2.5 py-1.5 border-b border-border/60">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Select Month
            </span>
          </div>

          <div className="flex flex-col gap-0.5 py-1">
            {options.map((opt) => {
              const isSelected = selectedMonth === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    onSelectMonth(opt.key);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer text-left select-none active:scale-[0.99]",
                    isSelected
                      ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold border border-orange-500/25"
                      : "text-foreground hover:bg-orange-500/[0.06] hover:text-orange-600 dark:hover:text-orange-400 border border-transparent font-normal"
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <Check className="size-3.5 text-orange-500 stroke-[2.5]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
