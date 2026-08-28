"use client";

import React, { Component, ReactNode } from "react";
import { PricingTable } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, ExternalLink, ShieldCheck, Check, Sparkles } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallbackPlanAction?: () => void;
  isPro?: boolean;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ClerkPricingTableSafe extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || "Billing is not enabled in Clerk Dashboard.",
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn("Caught Clerk PricingTable error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="p-6 sm:p-8 border border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-card to-card rounded-2xl shadow-xs">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Zap className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-foreground flex items-center gap-2">
                    <span>Clerk Billing Setup</span>
                    <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/40">
                      Sandbox Mode
                    </Badge>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    To render Clerk&apos;s live billing table, enable Billing in your Clerk Dashboard.
                  </p>
                </div>
              </div>

              <a
                href="https://dashboard.clerk.com/last-active?path=billing/settings"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <Button size="sm" variant="outline" className="text-xs gap-1.5 cursor-pointer font-medium hover:border-orange-500/50">
                  <span>Open Clerk Billing Settings</span>
                  <ExternalLink className="size-3 text-muted-foreground" />
                </Button>
              </a>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 text-xs text-muted-foreground font-mono leading-relaxed">
              Step 1: Go to <strong className="text-foreground">Clerk Dashboard &gt; Billing &gt; Settings</strong>.<br />
              Step 2: Toggle <strong className="text-foreground">Enable Billing</strong> and configure your Pro Plan ($99/mo).<br />
              Step 3: The native <strong className="text-foreground">&lt;PricingTable /&gt;</strong> component will automatically populate below.
            </div>

            {this.props.fallbackPlanAction && (
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/60">
                <span className="text-xs text-muted-foreground font-medium">
                  {this.props.isPro
                    ? "✨ Your account is currently active as a Pro Superuser."
                    : "⚡ Want to test Pro Superuser launch features right now in development?"}
                </span>

                <Button
                  size="sm"
                  onClick={this.props.fallbackPlanAction}
                  className="bg-gradient-to-r from-orange-500 via-[#FF6154] to-amber-500 text-white text-xs font-bold shadow-xs cursor-pointer gap-1.5"
                >
                  <Sparkles className="size-3.5" />
                  <span>{this.props.isPro ? "Manage Active Plan" : "1-Click Dev Pro Upgrade"}</span>
                </Button>
              </div>
            )}
          </div>
        </Card>
      );
    }

    return (
      <div className="w-full">
        <PricingTable />
      </div>
    );
  }
}
