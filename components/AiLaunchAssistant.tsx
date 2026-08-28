"use client";

import { useState } from "react";
import {
  Sparkles,
  Wand2,
  Copy,
  Check,
  ArrowRight,
  RefreshCw,
  Lightbulb,
  X,
  Target,
  Layers,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AiLaunchAssistantProps {
  productName: string;
  category?: string;
  onApplyTagline: (tagline: string) => void;
  onApplyDescription: (description: string) => void;
  onClose?: () => void;
}

interface PitchOption {
  tagline: string;
  valueProp: string;
  description: string;
  keywords: string[];
}

export function AiLaunchAssistant({
  productName,
  category = "AI",
  onApplyTagline,
  onApplyDescription,
  onClose,
}: AiLaunchAssistantProps) {
  const [productIdea, setProductIdea] = useState("");
  const [targetAudience, setTargetAudience] = useState("Developers & Tech Teams");
  const [tone, setTone] = useState<"punchy" | "technical" | "innovative" | "minimal">("punchy");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPitches, setGeneratedPitches] = useState<PitchOption[] | null>(null);
  const [copiedTaglineIndex, setCopiedTaglineIndex] = useState<number | null>(null);
  const [appliedTaglineIndex, setAppliedTaglineIndex] = useState<number | null>(null);
  const [appliedDescIndex, setAppliedDescIndex] = useState<number | null>(null);

  const PITCH_TEMPLATES: Record<string, (name: string, idea: string, audience: string) => PitchOption[]> = {
    punchy: (name, idea, aud) => [
      {
        tagline: idea ? `${idea.slice(0, 50)} with zero friction` : `The fastest way for ${aud} to build, ship, and scale`,
        valueProp: "Save 10+ hours every week with automated workflows and instant deployment.",
        description: `### What is ${name || "our product"}?\n${name || "This platform"} helps ${aud} streamline their daily workflow through intelligent automation and real-time collaboration.\n\n### Key Features:\n- ⚡ **Instant Setup**: Get started in under 60 seconds with no complex configuration.\n- 🎯 **Tailored for ${aud}**: Purpose-built tools designed for speed and productivity.\n- 🔒 **Enterprise-Grade Reliability**: Secure, fast, and scalable out of the box.`,
        keywords: ["Productivity", "Automation", "SaaS", "Fast"],
      },
      {
        tagline: `Supercharge your ${aud.toLowerCase().includes("dev") ? "development" : "growth"} with AI`,
        valueProp: "Transform hours of manual effort into one-click superpowers.",
        description: `### Why ${name || "our product"}?\nBuilt from the ground up for modern creators, ${name || "our platform"} bridges the gap between vision and execution.\n\n### Highlights:\n- 🚀 **Next-Gen Speed**: 10x faster execution than traditional alternatives.\n- 💡 **Intelligent Insights**: Automated recommendations tailored to your goals.\n- 🤝 **Seamless Integration**: Connects with your favorite existing stack.`,
        keywords: ["AI Powered", "Workflow", "Scale", "Modern"],
      },
    ],
    technical: (name, idea, aud) => [
      {
        tagline: `Next-gen ${category} infrastructure built for high-velocity teams`,
        valueProp: "Ultra-low latency engine with declarative configuration and type safety.",
        description: `### Architecture & Capabilities\n${name || "The system"} is an ultra-fast ${category} engine designed for ${aud}.\n\n### Technical Highlights:\n- 🛡️ **Strict Type-Safety**: Zero runtime surprises with comprehensive end-to-end typing.\n- ⚡ **Sub-50ms Latency**: Edge-optimized computing with distributed sync.\n- 📦 **Modern API**: REST, GraphQL, and WebSocket protocols supported.`,
        keywords: ["Developer Tools", "Infrastructure", "High Performance", "API"],
      },
    ],
    innovative: (name, idea, aud) => [
      {
        tagline: `Redefining how ${aud} create, collaborate, and launch`,
        valueProp: "An AI-native canvas for the next generation of builders.",
        description: `### The Next Frontier in ${category}\n${name || "Our platform"} re-imagines ${category} from first principles, blending human intuition with generative intelligence.\n\n### Core Pillars:\n- 🎨 **Frictionless UI**: An adaptive interface that gets out of your way.\n- 🧠 **Context-Aware AI**: Learns your project needs and adapts in real-time.\n- 🌐 **Global Reach**: Built for remote, distributed teams worldwide.`,
        keywords: ["AI Native", "Next-Gen", "Creative", "Modern"],
      },
    ],
    minimal: (name, idea, aud) => [
      {
        tagline: `The cleanest ${category} tool you will ever use`,
        valueProp: "No clutter, no bloat. Just pure speed and elegant design.",
        description: `### Simple. Fast. Powerful.\n${name || "This product"} was created because existing solutions are bloated and slow. We focused on what matters: speed, clarity, and delight.\n\n### Features:\n- 🧼 **Distraction-Free**: Minimalist UI crafted for focus.\n- ⌨️ **Keyboard-First**: Navigate and execute commands without touching the mouse.\n- ☁️ **Instant Sync**: Real-time cloud persistence with zero lag.`,
        keywords: ["Minimal", "Keyboard First", "Clean", "Lightweight"],
      },
    ],
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setAppliedTaglineIndex(null);
    setAppliedDescIndex(null);

    // Simulate smart AI generation with slight realistic delay
    setTimeout(() => {
      const generator = PITCH_TEMPLATES[tone] || PITCH_TEMPLATES.punchy;
      const results = generator(
        productName.trim() || "Your Product",
        productIdea.trim(),
        targetAudience.trim()
      );
      setGeneratedPitches(results);
      setIsGenerating(false);
    }, 600);
  };

  const handleCopyTagline = (tagline: string, index: number) => {
    navigator.clipboard.writeText(tagline);
    setCopiedTaglineIndex(index);
    setTimeout(() => setCopiedTaglineIndex(null), 2000);
  };

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-5 rounded-2xl border border-orange-500/30 bg-gradient-to-b from-orange-500/[0.04] via-background to-background shadow-lg animate-in fade-in-0 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-gradient-to-tr from-orange-500 to-[#FF6154] flex items-center justify-center text-white shadow-xs">
            <Sparkles className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <span>AI Launch Pitch Assistant</span>
              <Badge variant="accent" className="text-[10px] py-0 px-1 font-mono">
                Smart Copilot
              </Badge>
            </h3>
            <p className="text-[11px] text-muted-foreground font-normal">
              Craft winning taglines, value propositions, and markdown descriptions in seconds.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Input Prompts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="font-medium text-foreground flex items-center gap-1">
            <Lightbulb className="size-3 text-amber-500" />
            <span>What does {productName || "your product"} do? (Brief summary or problem it solves)</span>
          </label>
          <Input
            placeholder="e.g. An AI-driven vector search database that runs on edge workers with zero latency"
            value={productIdea}
            onChange={(e) => setProductIdea(e.target.value)}
            className="text-xs h-9 font-normal"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-medium text-muted-foreground flex items-center gap-1">
            <Target className="size-3 text-orange-500" />
            <span>Target Audience</span>
          </label>
          <Input
            placeholder="e.g. Founders, Indie Hackers, Designers"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className="text-xs h-9 font-normal"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-medium text-muted-foreground flex items-center gap-1">
            <Zap className="size-3 text-amber-500" />
            <span>Tone of Voice</span>
          </label>
          <div className="grid grid-cols-4 gap-1 p-0.5 rounded-lg border border-border bg-muted/40 h-9 items-center text-[11px]">
            {(["punchy", "technical", "innovative", "minimal"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTone(t)}
                className={cn(
                  "h-7 rounded-md capitalize font-medium transition-all select-none cursor-pointer flex items-center justify-center",
                  tone === t
                    ? "bg-background text-orange-600 dark:text-orange-400 shadow-2xs font-semibold border border-border/80"
                    : "text-muted-foreground hover:text-foreground font-normal"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generate Action Button */}
      <div className="flex items-center justify-between pt-1">
        <Button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-gradient-to-r from-orange-500 via-[#FF6154] to-amber-500 hover:from-orange-600 hover:to-orange-500 text-white font-medium text-xs h-9 px-4 shadow-xs gap-1.5 cursor-pointer active:scale-95 transition-all"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="size-3.5 animate-spin" />
              <span>Generating Pitch Options...</span>
            </>
          ) : (
            <>
              <Wand2 className="size-3.5" />
              <span>Generate AI Launch Pitch</span>
            </>
          )}
        </Button>

        <span className="text-[11px] text-muted-foreground font-mono font-normal">
          1-Click Apply to Form
        </span>
      </div>

      {/* Generated Options Showcase */}
      {generatedPitches && (
        <div className="flex flex-col gap-3 pt-3 border-t border-border/60 animate-in fade-in-0 slide-in-from-top-1 duration-200">
          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-orange-500" />
            <span>Generated Pitch Presets ({generatedPitches.length})</span>
          </span>

          <div className="flex flex-col gap-3">
            {generatedPitches.map((pitch, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-border/80 bg-card/90 hover:border-orange-500/40 hover:shadow-xs transition-all flex flex-col gap-2.5"
              >
                {/* Tagline Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-muted/25 p-2.5 rounded-lg border border-border/60">
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      Suggested Tagline ({pitch.tagline.length}/60 chars)
                    </span>
                    <span className="text-xs font-semibold text-foreground tracking-tight">
                      &quot;{pitch.tagline}&quot;
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyTagline(pitch.tagline, idx)}
                      className="h-7 text-[11px] px-2 gap-1 cursor-pointer font-normal"
                    >
                      {copiedTaglineIndex === idx ? (
                        <>
                          <Check className="size-3 text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        onApplyTagline(pitch.tagline);
                        setAppliedTaglineIndex(idx);
                      }}
                      className={cn(
                        "h-7 text-[11px] px-2.5 gap-1 font-medium cursor-pointer transition-all",
                        appliedTaglineIndex === idx
                          ? "bg-emerald-600 text-white"
                          : "bg-orange-500 hover:bg-orange-600 text-white"
                      )}
                    >
                      {appliedTaglineIndex === idx ? (
                        <>
                          <Check className="size-3" />
                          <span>Applied!</span>
                        </>
                      ) : (
                        <>
                          <span>Apply Tagline</span>
                          <ArrowRight className="size-3" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Description Preview & Apply */}
                <div className="flex flex-col gap-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Structured Markdown Pitch:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onApplyDescription(pitch.description);
                        setAppliedDescIndex(idx);
                      }}
                      className={cn(
                        "text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors px-2 py-0.5 rounded-md",
                        appliedDescIndex === idx
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                          : "text-orange-600 dark:text-orange-400 hover:bg-orange-500/10"
                      )}
                    >
                      {appliedDescIndex === idx ? (
                        <>
                          <Check className="size-3" />
                          <span>Description Applied!</span>
                        </>
                      ) : (
                        <>
                          <span>Apply Full Description</span>
                          <ArrowRight className="size-3" />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 text-[11px] text-muted-foreground font-mono leading-relaxed max-h-24 overflow-y-auto whitespace-pre-wrap">
                    {pitch.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
