"use client";

import { useState, useRef, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  CalendarCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerFieldProps {
  value: string; // "YYYY-MM-DD"
  onChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  allowFuture?: boolean;
  className?: string;
  placeholder?: string;
}

const MONTH_NAMES = [
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

const WEEKDAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function DatePickerField({
  value,
  onChange,
  minDate,
  maxDate,
  allowFuture = true,
  className,
  placeholder = "Select date...",
}: DatePickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Today base date
  const todayStr = "2026-08-28";

  // Active view date state
  const initialDate = value ? new Date(value + "T12:00:00") : new Date(todayStr + "T12:00:00");
  const [viewYear, setViewYear] = useState<number>(
    isNaN(initialDate.getFullYear()) ? 2026 : initialDate.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState<number>(
    isNaN(initialDate.getMonth()) ? 7 : initialDate.getMonth() // 0-indexed (7 = Aug)
  );

  // Auto-detect whether to open upwards or downwards
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 320 && rect.top > 300) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
  }, [isOpen]);

  // Synchronize calendar view when value changes
  useEffect(() => {
    if (value) {
      const d = new Date(value + "T12:00:00");
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

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

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday

  const handleSelectDay = (day: number) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const dateStr = `${viewYear}-${formattedMonth}-${formattedDay}`;

    if (minDate && dateStr < minDate) return;
    if (maxDate && dateStr > maxDate) return;

    onChange(dateStr);
    setIsOpen(false);
  };

  const isDayDisabled = (day: number) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const dateStr = `${viewYear}-${formattedMonth}-${formattedDay}`;

    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    return false;
  };

  const isSelectedDay = (day: number) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const dateStr = `${viewYear}-${formattedMonth}-${formattedDay}`;
    return dateStr === value;
  };

  const isTodayDay = (day: number) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const dateStr = `${viewYear}-${formattedMonth}-${formattedDay}`;
    return dateStr === todayStr;
  };

  const getFormattedDisplay = () => {
    if (!value) return placeholder;
    try {
      const [year, month, day] = value.split("-").map(Number);
      const dateObj = new Date(year, month - 1, day);
      const formatted = dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      if (value === todayStr) {
        return `Today (${formatted})`;
      }
      return formatted;
    } catch {
      return value;
    }
  };

  return (
    <div className={cn("relative inline-block text-left w-full max-w-sm", className)} ref={containerRef}>
      {/* Input Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "h-10 w-full px-3.5 rounded-xl border text-xs sm:text-sm font-normal transition-all cursor-pointer select-none flex items-center justify-between gap-3 shadow-2xs",
          isOpen
            ? "border-orange-500 ring-2 ring-orange-500/20 bg-orange-500/[0.04] text-foreground"
            : "border-border/80 hover:border-orange-500/50 bg-background text-foreground hover:bg-muted/20"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <CalendarIcon className="size-4 text-orange-500 shrink-0" />
          <span className="truncate font-medium text-xs sm:text-sm">
            {getFormattedDisplay()}
          </span>
        </div>

        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-200 shrink-0",
            isOpen && "rotate-180 text-orange-500"
          )}
        />
      </button>

      {/* Dropdown Calendar Popover */}
      {isOpen && (
        <div
          className={cn(
            "absolute left-0 z-50 w-72 sm:w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl p-3 flex flex-col gap-2.5 animate-in fade-in-0 zoom-in-95",
            openUpward ? "bottom-full mb-2" : "top-full mt-2"
          )}
        >
          {/* Header Month / Year Switcher */}
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <div className="flex items-center gap-1.5">
              <CalendarCheck className="size-4 text-orange-500" />
              <span className="font-semibold text-xs text-foreground">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="size-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center transition-colors active:scale-95"
                title="Previous Month"
              >
                <ChevronLeft className="size-4" />
              </button>

              <button
                type="button"
                onClick={handleNextMonth}
                className="size-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center transition-colors active:scale-95"
                title="Next Month"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          {/* Weekday Names Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted-foreground uppercase">
            {WEEKDAY_NAMES.map((wd) => (
              <span key={wd} className="py-0.5">
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty prefix cells */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="size-7 sm:size-8" />
            ))}

            {/* Day Cells */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const disabled = isDayDisabled(day);
              const isSelected = isSelectedDay(day);
              const isToday = isTodayDay(day);

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelectDay(day)}
                  className={cn(
                    "size-7 sm:size-8 rounded-xl text-xs font-mono flex items-center justify-center transition-all cursor-pointer relative select-none",
                    isSelected
                      ? "bg-gradient-to-r from-orange-500 to-[#FF6154] text-white font-bold shadow-xs scale-105 z-10"
                      : isToday
                      ? "border border-orange-500/50 text-orange-600 dark:text-orange-400 font-semibold bg-orange-500/10 hover:bg-orange-500/20"
                      : disabled
                      ? "text-muted-foreground/30 cursor-not-allowed"
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

          {/* Quick Shortcuts Footer */}
          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                onChange(todayStr);
                setIsOpen(false);
              }}
              className="text-[11px] font-medium text-orange-600 dark:text-orange-400 hover:text-orange-500 flex items-center gap-1 cursor-pointer px-2 py-1 rounded-lg hover:bg-orange-500/10 transition-colors"
            >
              <Sparkles className="size-3" />
              <span>Today (Aug 28, 2026)</span>
            </button>

            {allowFuture && (
              <button
                type="button"
                onClick={() => {
                  // Tomorrow (Aug 29, 2026)
                  onChange("2026-08-29");
                  setIsOpen(false);
                }}
                className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer px-2 py-1 rounded-lg hover:bg-muted transition-colors font-medium"
              >
                Tomorrow
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
