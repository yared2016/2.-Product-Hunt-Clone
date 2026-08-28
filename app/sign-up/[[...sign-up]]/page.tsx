"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Rocket, Sparkles, Flame, MessageSquare, ArrowLeft, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SignUpPage() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col justify-between">
      {/* Header Bar */}
      <header className="w-full border-b border-border/80 bg-background/95 backdrop-blur-md px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="size-9 rounded-xl bg-gradient-to-tr from-orange-600 via-[#FF6154] to-amber-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Rocket className="size-5" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-lg tracking-tight text-foreground">Launchpad</span>
              <Badge variant="accent" className="text-[10px] px-1.5 py-0">
                v1.0
              </Badge>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Products</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-10 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 w-full items-center">
          {/* Left Context Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6 order-2 lg:order-1">
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-xs font-semibold w-fit">
                <Sparkles className="size-3.5" />
                <span>Create Your Account</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Join Launchpad Today
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Create an account to launch products, gain community traction, participate in maker discussions, and vote.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="flex flex-col gap-3.5 pt-2">
              <div className="flex items-start gap-3">
                <div className="size-6 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Rocket className="size-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-foreground">Submit Your Product</span>
                  <span className="text-xs text-muted-foreground">Upload images, tag co-makers, and pick a launch date.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Trophy className="size-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-foreground">Earn Hall of Fame Awards</span>
                  <span className="text-xs text-muted-foreground">Compete for Product of the Day and Week rankings.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="size-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-foreground">Maker Discussions</span>
                  <span className="text-xs text-muted-foreground">Receive verified Maker badges when replying on your launches.</span>
                </div>
              </div>
            </div>

            <div className="pt-2 text-xs text-muted-foreground">
              <span>Already have an account? </span>
              <Link href="/sign-in" className="text-orange-600 dark:text-orange-400 font-semibold hover:underline">
                Sign in here
              </Link>
            </div>
          </div>

          {/* Right Clerk Form (7 cols) */}
          <div className="lg:col-span-7 flex justify-center order-1 lg:order-2">
            <div className="w-full max-w-md">
              <SignUp
                routing="path"
                path="/sign-up"
                signInUrl="/sign-in"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-md border border-border/80 rounded-2xl bg-card",
                    headerTitle: "text-foreground font-bold tracking-tight",
                    headerSubtitle: "text-muted-foreground text-xs",
                    formButtonPrimary: "bg-[#FF6154] hover:bg-[#FF6154]/90 text-white font-medium",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border/60 py-4 px-4 sm:px-8 text-center text-xs text-muted-foreground">
        <span>© 2026 Launchpad. The premier launch platform for makers.</span>
      </footer>
    </div>
  );
}
