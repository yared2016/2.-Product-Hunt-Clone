"use client";

import { useState, useRef, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  Zap,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DateOption {
  key: string;
  label: string;
  sublabel: string;
}

interface DateSelectDropdownProps {
  selectedDate: string; // "YYYY-MM-DD"
  onSelectDate: (date: string) => void;
  presets: DateOption[];
  maxDate?: string; // "YYYY-MM-DD", defaults to "2026-08-28"
  align?: "left" | "right";
  title?: string;
}

export function DateSelectDropdown({
  selectedDate,
  onSelectDate,
  presets,
  maxDate = "2026-08-28",
  align = "left",
  title = "Select Date",
}: DateSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isPreset = presets.some((p) => p.key === selectedDate);
  const [showCalendar, setShowCalendar] = useState(!isPreset);

  // Calendar navigation state (Year and Month)
  const initialDate = new Date(selectedDate || maxDate);
  const [viewYear, setViewYear] = useState(
    isNaN(initialDate.getFullYear()) ? 2026 : initialDate.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    isNaN(initialDate.getMonth()) ? 7 : initialDate.getMonth() // 0-indexed (7 = August)
  );

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync state when selectedDate changes or menu opens
  useEffect(() => {
    if (selectedDate) {
      const d = new Date(selectedDate + "T12:00:00");
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [selectedDate]);

  // Handle open trigger
  const handleToggleOpen = () => {
    if (!isOpen) {
      // If currently on a custom date, open directly to calendar
      const isCurrentlyPreset = presets.some((p) => p.key === selectedDate);
      setShowCalendar(!isCurrentlyPreset);
    }
    setIsOpen((prev) => !prev);
  };

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

  // Format label for trigger button
  const getSelectedLabel = () => {
    const preset = presets.find((p) => p.key === selectedDate);
    if (preset) {
      return `${preset.label} (${preset.sublabel})`;
    }
    // Format custom date
    try {
      const [year, month, day] = selectedDate.split("-").map(Number);
      const dateObj = new Date(year, month - 1, day);
      return dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return selectedDate;
    }
  };

  // Calendar Calculations
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    // Prevent navigating past August 2026
    if (viewYear === 2026 && viewMonth >= 7) return;

    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const dateStr = `${viewYear}-${formattedMonth}-${formattedDay}`;

    if (dateStr > maxDate) return;

    onSelectDate(dateStr);
    setIsOpen(false);
  };

  const isFutureDate = (day: number) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const dateStr = `${viewYear}-${formattedMonth}-${formattedDay}`;
    return dateStr > maxDate;
  };

  const isSelectedDay = (day: number) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const dateStr = `${viewYear}-${formattedMonth}-${formattedDay}`;
    return dateStr === selectedDate;
  };

  const isTodayDate = (day: number) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const dateStr = `${viewYear}-${formattedMonth}-${formattedDay}`;
    return dateStr === maxDate;
  };

  return (
    <div className="relative inline-block text-left shrink-0" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggleOpen}
        className={cn(
          "flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer select-none active:scale-95 shadow-2xs whitespace-nowrap shrink-0",
          isOpen
            ? "border-orange-500 ring-2 ring-orange-500/20 bg-orange-500/[0.06] text-orange-600 dark:text-orange-400"
            : "border-orange-500/35 hover:border-orange-500 bg-background text-foreground hover:bg-orange-500/[0.04]"
        )}
      >
        <div className="flex items-center gap-1.5 shrink-0">
          <CalendarIcon className="size-3 text-orange-500 shrink-0" />
          <span className="font-medium text-xs whitespace-nowrap">{getSelectedLabel()}</span>
        </div>
        <ChevronDown
          className={cn(
            "size-3 text-muted-foreground transition-transform duration-200 shrink-0",
            isOpen && "rotate-180 text-orange-500"
          )}
        />
      </button>

      {/* Modern Popover Container */}
      {isOpen && (
        <div
          className={cn(
            "absolute top-full mt-2 z-50 w-72 sm:w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl p-2.5 flex flex-col gap-2 animate-in fade-in-0 zoom-in-95",
            align === "right" ? "left-0 md:left-auto md:right-0" : "left-0"
          )}
        >
          {/* Segmented View Switcher Header */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-muted/50 border border-border/80 gap-1 text-[11px]">
            <button
              type="button"
              onClick={() => setShowCalendar(false)}
              className={cn(
                "flex items-center justify-center gap-1.5 py-1 rounded-lg font-medium transition-all cursor-pointer select-none",
                !showCalendar
                  ? "bg-background text-orange-600 dark:text-orange-400 font-semibold shadow-2xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground font-normal"
              )}
            >
              <Zap className="size-3" />
              <span>Presets</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCalendar(true)}
              className={cn(
                "flex items-center justify-center gap-1.5 py-1 rounded-lg font-medium transition-all cursor-pointer select-none",
                showCalendar
                  ? "bg-background text-orange-600 dark:text-orange-400 font-semibold shadow-2xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground font-normal"
              )}
            >
              <CalendarIcon className="size-3" />
              <span>Calendar</span>
            </button>
          </div>

          {!showCalendar ? (
            /* Presets List View */
            <div className="flex flex-col gap-0.5 py-0.5">
              {presets.map((preset) => {
                const isSelected = selectedDate === preset.key;
                return (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => {
                      onSelectDate(preset.key);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer text-left select-none active:scale-[0.99]",
                      isSelected
                        ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold border border-orange-500/25 shadow-2xs"
                        : "text-foreground hover:bg-orange-500/[0.06] hover:text-orange-600 dark:hover:text-orange-400 border border-transparent font-normal"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span>{preset.label}</span>
                      <span className="text-[11px] text-muted-foreground font-mono font-normal">
                        ({preset.sublabel})
                      </span>
                    </div>

                    {isSelected && (
                      <Check className="size-3.5 text-orange-500 stroke-[2.5]" />
                    )}
                  </button>
                );
              })}

              {/* Quick Jump to Custom Calendar */}
              <button
                type="button"
                onClick={() => setShowCalendar(true)}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/[0.05] transition-colors cursor-pointer text-left mt-1 border-t border-border/50 pt-2 font-normal"
              >
                <div className="flex items-center gap-2">
                  <CalendarIcon className="size-3.5 text-orange-500" />
                  <span>Choose custom date...</span>
                </div>
                <ChevronRight className="size-3.5 text-muted-foreground" />
              </button>
            </div>
          ) : (
            /* Modern Interactive Calendar View */
            <div className="flex flex-col gap-2 p-1">
              {/* Calendar Month Header */}
              <div className="flex items-center justify-between px-1 pb-1 border-b border-border/60">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="size-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors flex items-center justify-center active:scale-95"
                  title="Previous Month"
                >
                  <ChevronLeft className="size-4" />
                </button>

                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="size-3.5 text-orange-500" />
                  <span className="text-xs font-semibold text-foreground">
                    {monthNames[viewMonth]} {viewYear}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  disabled={viewYear === 2026 && viewMonth >= 7}
                  className={cn(
                    "size-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer transition-colors flex items-center justify-center active:scale-95",
                    viewYear === 2026 &&
                      viewMonth >= 7 &&
                      "opacity-25 cursor-not-allowed"
                  )}
                  title="Next Month"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>

              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted-foreground uppercase">
                <span>Su</span>
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty prefix cells */}
                {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="size-7 sm:size-8" />
                ))}

                {/* Days */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const day = idx + 1;
                  const isFuture = isFutureDate(day);
                  const isSelected = isSelectedDay(day);
                  const isToday = isTodayDate(day);

                  return (
                    <button
                      key={`day-${day}`}
                      type="button"
                      disabled={isFuture}
                      onClick={() => handleSelectDay(day)}
                      className={cn(
                        "size-7 sm:size-8 rounded-xl text-xs font-mono flex items-center justify-center transition-all cursor-pointer relative select-none",
                        isSelected
                          ? "bg-gradient-to-r from-orange-500 to-[#FF6154] text-white font-bold shadow-[0_2px_8px_rgba(255,97,84,0.35)] scale-105 z-10"
                          : isToday
                          ? "border border-orange-500/50 text-orange-600 dark:text-orange-400 font-semibold bg-orange-500/10 hover:bg-orange-500/20"
                          : isFuture
                          ? "text-muted-foreground/25 cursor-not-allowed"
                          : "text-foreground hover:bg-orange-500/15 hover:text-orange-600 dark:hover:text-orange-400 font-normal active:scale-95"
                      )}
                    >
                      <span>{day}</span>
                      {isToday && !isSelected && (
                        <span className="absolute bottom-0.5 size-1 rounded-full bg-orange-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Calendar Quick Action Footer */}
              <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    onSelectDate(maxDate);
                    setIsOpen(false);
                  }}
                  className="text-[11px] font-medium text-orange-600 dark:text-orange-400 hover:text-orange-500 cursor-pointer flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-orange-500/10 transition-colors"
                >
                  <Sparkles className="size-3" />
                  <span>Today (Aug 28)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCalendar(false)}
                  className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer px-2 py-0.5 rounded-md hover:bg-muted transition-colors font-normal"
                >
                  Presets List
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
