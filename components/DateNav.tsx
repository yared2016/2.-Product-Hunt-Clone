"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { DateSelectDropdown } from "@/components/DateSelectDropdown";
import { cn } from "@/lib/utils";

interface DateNavProps {
  selectedDate: string; // "YYYY-MM-DD"
  onSelectDate: (date: string) => void;
}

const DEFAULT_PRESETS = [
  { key: "2026-08-28", label: "Today", sublabel: "Friday" },
  { key: "2026-08-27", label: "Yesterday", sublabel: "Thursday" },
  { key: "2026-08-26", label: "Wednesday", sublabel: "Aug 26" },
  { key: "2026-08-25", label: "Tuesday", sublabel: "Aug 25" },
  { key: "2026-08-21", label: "Last Week", sublabel: "Aug 21" },
];

export function DateNav({ selectedDate, onSelectDate }: DateNavProps) {
  const today = "2026-08-28";

  const handlePrevDay = () => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() - 1);
    onSelectDate(d.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + 1);
    const nextStr = d.toISOString().split("T")[0];
    if (nextStr <= today) {
      onSelectDate(nextStr);
    }
  };

  const isAtToday = selectedDate >= today;

  return (
    <div className="flex items-center gap-2 shrink-0">
      {/* Prev / Next Day Step Navigation */}
      <div className="inline-flex items-center gap-0.5 p-1 rounded-2xl bg-muted/40 border border-border/80 shrink-0">
        <button
          type="button"
          onClick={handlePrevDay}
          title="Previous Day"
          className="size-7 sm:size-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors cursor-pointer active:scale-95"
        >
          <ChevronLeft className="size-4" />
        </button>

        <button
          type="button"
          onClick={handleNextDay}
          disabled={isAtToday}
          title="Next Day"
          className={cn(
            "size-7 sm:size-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors cursor-pointer active:scale-95",
            isAtToday && "opacity-30 cursor-not-allowed hover:bg-transparent"
          )}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Sleek Custom Date Dropdown */}
      <DateSelectDropdown
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        presets={DEFAULT_PRESETS}
        maxDate={today}
        align="left"
        title="Launch Date"
      />
    </div>
  );
}