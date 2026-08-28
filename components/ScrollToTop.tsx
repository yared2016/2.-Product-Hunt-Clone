"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 280) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    toggleVisibility();

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-30 animate-in fade-in zoom-in-75 duration-200">
      <Button
        type="button"
        size="icon"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        title="Scroll to top"
        className={cn(
          "size-11 rounded-2xl bg-card/90 text-foreground hover:text-white border border-border shadow-xl backdrop-blur-md",
          "hover:bg-[#FF6154] hover:border-[#FF6154] hover:shadow-orange-500/25 transition-all duration-300",
          "active:scale-90 cursor-pointer group"
        )}
      >
        <ChevronUp className="size-5 transition-transform duration-300 group-hover:-translate-y-0.5 text-foreground group-hover:text-white" />
      </Button>
    </div>
  );
}
