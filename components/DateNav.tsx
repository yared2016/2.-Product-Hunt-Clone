"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { DateSelectDropdown } from "@/components/DateSelectDropdown";
import { BASE_DATE } from "@/lib/constants";

interface DateNavProps {
  selectedDate: string; // "YYYY-MM-DD"
  onSelectDate: (date: string) => void;
}

export function DateNav({ selectedDate, onSelectDate }: DateNavProps) {
  const today = BASE_DATE;

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
          className={`size-7 sm:size-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer active:scale-95 ${
            isAtToday
              ? "text-muted-foreground/30 cursor-not-allowed"
              : "text-muted-foreground hover:text-foreground hover:bg-background/80"
          }`}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Date Select Dropdown */}
      <DateSelectDropdown
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
      />
    </div>
  );
}