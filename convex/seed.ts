import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const clearAllData = mutation({
  args: {},
  handler: async (ctx) => {
    const tables = [
      "awards",
      "comments",
      "commentUpvotes",
      "productImages",
      "productMakers",
      "productUpvotes",
      "products",
      "categories",
      "users",
    ] as const;

    let totalDeleted = 0;
    for (const table of tables) {
      const records = await ctx.db.query(table).collect();
      for (const record of records) {
        await ctx.db.delete(record._id);
        totalDeleted++;
      }
    }

    return {
      success: true,
      message: `Cleared all ${totalDeleted} records across all 9 database tables.`,
    };
  },
});

export const seedFullWorld = mutation({
  args: { force: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    if (!args.force) {
      const existing = await ctx.db.query("products").take(1);
      if (existing.length > 0) {
        return { message: "Database already contains products. Call clearAllData first or pass { force: true }." };
      }
    }

    const categoriesData = [
      { name: "AI", slug: "ai", description: "Artificial intelligence, LLMs, autonomous agents, and generative models", icon: "Sparkles" },
      { name: "Developer Tools", slug: "developer-tools", description: "APIs, CLIs, cloud infrastructure, and IDE extensions", icon: "Code" },
      { name: "SaaS", slug: "saas", description: "Software as a service platforms and business tools", icon: "Cloud" },
      { name: "Design Tools", slug: "design-tools", description: "UI/UX, 3D graphics, animation, and design systems", icon: "Palette" },
      { name: "Productivity", slug: "productivity", description: "Task management, note-taking, and workflow efficiency", icon: "CheckCircle" },
      { name: "Marketing", slug: "marketing", description: "Growth, SEO, conversion funnels, and analytics platforms", icon: "TrendingUp" },
      { name: "Crypto", slug: "crypto", description: "Web3 protocols, decentralized apps, and smart contracts", icon: "Coins" },
      { name: "Open Source", slug: "open-source", description: "Free, open-source libraries and developer tooling", icon: "Github" },
    ];

    for (const cat of categoriesData) {
      const exists = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", cat.slug))
        .first();
      if (!exists) {
        await ctx.db.insert("categories", cat);
      }
    }

    const usersData = [
      { clerkId: "seed_maker_1", name: "Alex Rivera", username: "alexrivera", email: "alex@launchpad.dev", avatarUrl: "https://picsum.photos/seed/alexrivera/160/160", bio: "Founder @ CursorLabs • Building developer tools for the agentic future", websiteUrl: "https://twitter.com/alexrivera" },
      { clerkId: "seed_maker_2", name: "Elena Rostova", username: "elenarostova", email: "elena@superai.com", avatarUrl: "https://picsum.photos/seed/elenarostova/160/160", bio: "AI Researcher & UI Architect • Crafting generative workflow experiences", websiteUrl: "https://elenarostova.design" },
      { clerkId: "seed_maker_3", name: "Marcus Vance", username: "marcusvance", email: "marcus@vectordb.io", avatarUrl: "https://picsum.photos/seed/marcusvance/160/160", bio: "Infrastructure Engineer • Open source advocate & distributed systems geek", websiteUrl: "https://github.com/marcusvance" },
      { clerkId: "seed_maker_4", name: "Sophia Chen", username: "sophiachen", email: "sophia@designcraft.io", avatarUrl: "https://picsum.photos/seed/sophiachen/160/160", bio: "Product Designer @ Figma Community • Obsessed with design systems & motion", websiteUrl: "https://sophiachen.me" },
      { clerkId: "seed_maker_5", name: "David Kim", username: "davidkim", email: "david@nextgenstack.dev", avatarUrl: "https://picsum.photos/seed/davidkim/160/160", bio: "Full-stack builder • Next.js, Rust, and autonomous AI agents", websiteUrl: "https://github.com/davidkim" },
      { clerkId: "seed_maker_6", name: "Sarah Jenkins", username: "sarahjenkins", email: "sarah@growthpilot.co", avatarUrl: "https://picsum.photos/seed/sarahjenkins/160/160", bio: "Growth Lead & Tech Writer • Helping early-stage startups scale", websiteUrl: "https://sarahjenkins.substack.com" },
      { clerkId: "seed_maker_7", name: "Liam O'Connor", username: "liamoconnor", email: "liam@openprotocol.xyz", avatarUrl: "https://picsum.photos/seed/liamoconnor/160/160", bio: "DevRel & Community Lead • Web3 and open source contributor", websiteUrl: "https://twitter.com/liamoconnor" },
      { clerkId: "seed_maker_8", name: "Maya Patel", username: "mayapatel", email: "maya@tensorcloud.ai", avatarUrl: "https://picsum.photos/seed/mayapatel/160/160", bio: "MLOps Engineer • Scaling transformer models and inference pipelines", websiteUrl: "https://mayapatel.ai" },
      { clerkId: "seed_maker_9", name: "Lucas Silva", username: "lucassilva", email: "lucas@renderstudio.app", avatarUrl: "https://picsum.photos/seed/lucassilva/160/160", bio: "Creative Developer • WebGPU, Three.js and interactive 3D graphics", websiteUrl: "https://lucassilva.dev" },
      { clerkId: "seed_maker_10", name: "Chloe Dupont", username: "chloedupont", email: "chloe@swiftdeploy.io", avatarUrl: "https://picsum.photos/seed/chloedupont/160/160", bio: "Founder @ SwiftDeploy • Cloud infrastructure automation & zero-config deploys", websiteUrl: "https://swiftdeploy.io" },
      { clerkId: "seed_maker_11", name: "Ethan Wright", username: "ethanwright", email: "ethan@nexusauth.dev", avatarUrl: "https://picsum.photos/seed/ethanwright/160/160", bio: "Security Researcher & Auth Specialist • Zero-trust distributed architectures", websiteUrl: "https://github.com/ethanwright" },
      { clerkId: "seed_maker_12", name: "Aisha Khan", username: "aishakhan", email: "aisha@flowstate.works", avatarUrl: "https://picsum.photos/seed/aishakhan/160/160", bio: "Productivity Architect • Building tools for remote-first asynchronous teams", websiteUrl: "https://twitter.com/aishakhan" },
    ];

    const userIds: Id<"users">[] = [];
    for (const u of usersData) {
      let existingUser = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", u.clerkId))
        .first();

      if (!existingUser) {
        const id = await ctx.db.insert("users", {
          ...u,
          createdAt: Date.now() - 86400000 * 14,
        });
        userIds.push(id);
      } else {
        userIds.push(existingUser._id);
      }
    }
    const productsSeed = [
      {
        name: "VibeUI",
        slug: "vibe-ui",
        tagline: "Autonomous frontend UI generator powered by Claude Opus & Base UI",
        description: "# VibeUI\n\nVibeUI turns natural language prompts and rough wireframes into accessible, production-ready React components built on Base UI and Tailwind CSS.\n\n### Highlights\n- **Zero-runtime tokens**: Tailored to your brand aesthetic\n- **Container Query First**: Fully responsive inside any container\n- **Full TypeScript Export**: Strict types with zero any annotations",
        websiteUrl: "https://vibeui.dev",
        pricing: "freemium" as const,
        categories: ["AI", "Developer Tools", "Design Tools"],
        topics: ["Next.js", "React", "Design Systems"],
        submitterIndex: 0,
        makerIndices: [0, 1],
        launchDate: "2026-08-27",
        upvoteCount: 412,
        commentCount: 6,
        isFeatured: true,
      },
      {
        name: "OmniFlow",
        slug: "omni-flow",
        tagline: "Visual agentic workflow builder for high-scale backend systems",
        description: "# OmniFlow\n\nConnect autonomous AI agents, distributed databases, and serverless functions into resilient, fault-tolerant execution graphs.",
        websiteUrl: "https://omniflow.io",
        pricing: "paid" as const,
        categories: ["AI", "SaaS", "Developer Tools"],
        topics: ["Automation", "Agents", "Workflows"],
        submitterIndex: 2,
        makerIndices: [2, 4],
        launchDate: "2026-08-27",
        upvoteCount: 358,
        commentCount: 4,
        isFeatured: true,
      },
      {
        name: "Zenith Studio",
        slug: "zenith-studio",
        tagline: "High-fidelity 3D motion graphics studio directly in your browser",
        description: "# Zenith Studio\n\nCreate studio-grade 3D product animations, particle systems, and WebGPU interactive scenes directly in your browser with no installation required.",
        websiteUrl: "https://zenith.studio",
        pricing: "freemium" as const,
        categories: ["Design Tools", "Productivity"],
        topics: ["3D", "WebGPU", "Animation"],
        submitterIndex: 8,
        makerIndices: [8, 3],
        launchDate: "2026-08-27",
        upvoteCount: 284,
        commentCount: 3,
        isFeatured: true,
      },
      {
        name: "HyperSync",
        slug: "hypersync",
        tagline: "Real-time state synchronization engine for local-first apps",
        description: "# HyperSync\n\nCRDT-backed state synchronization library enabling multiplayer experiences with offline capability and instant conflict resolution.",
        websiteUrl: "https://hypersync.dev",
        pricing: "free" as const,
        categories: ["Developer Tools", "Open Source"],
        topics: ["Local-First", "CRDT", "Multiplayer"],
        submitterIndex: 4,
        makerIndices: [4],
        launchDate: "2026-08-27",
        upvoteCount: 195,
        commentCount: 2,
        isFeatured: false,
      },
      {
        name: "FlowState AI",
        slug: "flowstate-ai",
        tagline: "Context-aware focus assistant and smart daily planner",
        description: "# FlowState AI\n\nFlowState monitors calendar demands and cognitive workload to automatically schedule deep work blocks and silence distracting notifications.",
        websiteUrl: "https://flowstate.works",
        pricing: "freemium" as const,
        categories: ["AI", "Productivity"],
        topics: ["Focus", "Time Management", "AI"],
        submitterIndex: 11,
        makerIndices: [11],
        launchDate: "2026-08-27",
        upvoteCount: 162,
        commentCount: 2,
        isFeatured: false,
      },
      {
        name: "TypeCraft",
        slug: "typecraft",
        tagline: "Interactive typographic playground & variable font inspector",
        description: "# TypeCraft\n\nExplore optical sizes, variable font axes, and typographic pairings with live CSS export and KaTeX math rendering preview.",
        websiteUrl: "https://typecraft.design",
        pricing: "free" as const,
        categories: ["Design Tools", "Developer Tools"],
        topics: ["Typography", "CSS", "Design"],
        submitterIndex: 3,
        makerIndices: [3],
        launchDate: "2026-08-27",
        upvoteCount: 118,
        commentCount: 1,
        isFeatured: false,
      },
      {
        name: "LoomKit AI",
        slug: "loomkit-ai",
        tagline: "Automated video documentation for developer products & APIs",
        description: "# LoomKit AI\n\nGenerate professional product walkthrough videos and API onboarding demos straight from your markdown docs and code samples.",
        websiteUrl: "https://loomkit.ai",
        pricing: "freemium" as const,
        categories: ["AI", "Marketing", "SaaS"],
        topics: ["Video", "Developer Tools", "AI"],
        submitterIndex: 5,
        makerIndices: [5, 1],
        launchDate: "2026-08-26",
        upvoteCount: 524,
        commentCount: 5,
        isFeatured: true,
      },
      {
        name: "GhostDB",
        slug: "ghost-db",
        tagline: "Ultra-low latency in-memory vector database for edge runtime",
        description: "# GhostDB\n\nDesigned specifically for edge workers like Cloudflare and Vercel. Search millions of embeddings in under 2 milliseconds.",
        websiteUrl: "https://ghostdb.io",
        pricing: "free" as const,
        categories: ["Developer Tools", "Open Source"],
        topics: ["Database", "Vector", "Edge"],
        submitterIndex: 2,
        makerIndices: [2, 7],
        launchDate: "2026-08-26",
        upvoteCount: 489,
        commentCount: 4,
        isFeatured: true,
      },
      {
        name: "Prism Code",
        slug: "prism-code",
        tagline: "AI pair programmer with architectural AST understanding",
        description: "# Prism Code\n\nUnderstands your entire repository AST graph to suggest architectural refactors, dead code removal, and security hardening.",
        websiteUrl: "https://prismcode.dev",
        pricing: "freemium" as const,
        categories: ["Developer Tools", "AI"],
        topics: ["IDE", "AI", "Code Review"],
        submitterIndex: 0,
        makerIndices: [0],
        launchDate: "2026-08-26",
        upvoteCount: 367,
        commentCount: 3,
        isFeatured: true,
      },
      {
        name: "MindMesh",
        slug: "mindmesh",
        tagline: "Infinite canvas spatial notebook for visual thinkers",
        description: "# MindMesh\n\nOrganize research, PDFs, web bookmarks, and voice memos on an infinite collaborative whiteboard with semantic AI search.",
        websiteUrl: "https://mindmesh.app",
        pricing: "paid" as const,
        categories: ["Productivity", "SaaS"],
        topics: ["Canvas", "Notes", "Productivity"],
        submitterIndex: 3,
        makerIndices: [3, 11],
        launchDate: "2026-08-26",
        upvoteCount: 241,
        commentCount: 2,
        isFeatured: false,
      },
      {
        name: "QueryDeck",
        slug: "querydeck",
        tagline: "Collaborative SQL workspace with auto-generated charts",
        description: "# QueryDeck\n\nShare live database queries with your team, annotate results, and convert datasets into interactive dashboards instantly.",
        websiteUrl: "https://querydeck.com",
        pricing: "freemium" as const,
        categories: ["Developer Tools", "SaaS"],
        topics: ["SQL", "Analytics", "Databases"],
        submitterIndex: 4,
        makerIndices: [4],
        launchDate: "2026-08-26",
        upvoteCount: 188,
        commentCount: 2,
        isFeatured: false,
      },
      {
        name: "SwiftDeploy",
        slug: "swiftdeploy",
        tagline: "Zero-config infrastructure orchestration for container clusters",
        description: "# SwiftDeploy\n\nPush git commits and get auto-provisioned Kubernetes clusters with preview environments, SSL, and DDoS mitigation out of the box.",
        websiteUrl: "https://swiftdeploy.io",
        pricing: "freemium" as const,
        categories: ["Developer Tools", "SaaS"],
        topics: ["DevOps", "Cloud", "Kubernetes"],
        submitterIndex: 9,
        makerIndices: [9],
        launchDate: "2026-08-26",
        upvoteCount: 145,
        commentCount: 1,
        isFeatured: false,
      },
      {
        name: "AeroForm",
        slug: "aeroform",
        tagline: "Next-generation conversational forms with conditional AI branching",
        description: "# AeroForm\n\nBuild engaging feedback funnels and customer intake surveys that dynamically adapt questions based on previous answers.",
        websiteUrl: "https://aeroform.dev",
        pricing: "freemium" as const,
        categories: ["Developer Tools", "SaaS"],
        topics: ["Forms", "Surveys", "UX"],
        submitterIndex: 5,
        makerIndices: [5],
        launchDate: "2026-08-25",
        upvoteCount: 610,
        commentCount: 4,
        isFeatured: true,
      },
      {
        name: "PixelForge",
        slug: "pixelforge",
        tagline: "Generative texture synthesis and PBR material engine",
        description: "# PixelForge\n\nGenerate seamless 4K PBR textures, normal maps, and displacement shaders from text prompts for Unreal Engine and Unity.",
        websiteUrl: "https://pixelforge.3d",
        pricing: "paid" as const,
        categories: ["Design Tools", "AI"],
        topics: ["3D", "Gaming", "Textures"],
        submitterIndex: 8,
        makerIndices: [8],
        launchDate: "2026-08-25",
        upvoteCount: 472,
        commentCount: 3,
        isFeatured: true,
      },
      {
        name: "AgentStack",
        slug: "agentstack",
        tagline: "Open framework for building multi-agent autonomous swarms",
        description: "# AgentStack\n\nOrchestrate multi-agent collaborations with built-in memory management, rate limiting, tool calling, and human-in-the-loop approvals.",
        websiteUrl: "https://agentstack.sh",
        pricing: "free" as const,
        categories: ["AI", "Developer Tools", "Open Source"],
        topics: ["Agents", "Python", "LLMs"],
        submitterIndex: 7,
        makerIndices: [7, 0],
        launchDate: "2026-08-25",
        upvoteCount: 398,
        commentCount: 3,
        isFeatured: true,
      },
      {
        name: "ChronoLog",
        slug: "chronolog",
        tagline: "Lightweight developer timesheet & git-commit sync tool",
        description: "# ChronoLog\n\nAutomatically logs your billable hours by analyzing git commits, pull requests, and IDE active windows with privacy-first encryption.",
        websiteUrl: "https://chronolog.co",
        pricing: "free" as const,
        categories: ["Productivity", "Developer Tools"],
        topics: ["Time Tracking", "Git", "Productivity"],
        submitterIndex: 11,
        makerIndices: [11],
        launchDate: "2026-08-25",
        upvoteCount: 225,
        commentCount: 1,
        isFeatured: false,
      },
      {
        name: "DevPulse",
        slug: "devpulse",
        tagline: "Real-time engineering metrics and team sprint health dashboard",
        description: "# DevPulse\n\nTrack cycle time, PR review velocity, and deployment frequency without micromanaging your engineers.",
        websiteUrl: "https://devpulse.io",
        pricing: "freemium" as const,
        categories: ["Developer Tools", "Marketing"],
        topics: ["Metrics", "Engineering", "SaaS"],
        submitterIndex: 1,
        makerIndices: [1],
        launchDate: "2026-08-25",
        upvoteCount: 176,
        commentCount: 1,
        isFeatured: false,
      },
      {
        name: "FormCraft",
        slug: "formcraft",
        tagline: "Accessible headless form builder with built-in spam protection",
        description: "# FormCraft\n\nConnect any HTML or React form to email notifications, webhooks, and Slack channels with zero backend code.",
        websiteUrl: "https://formcraft.app",
        pricing: "freemium" as const,
        categories: ["SaaS", "Design Tools"],
        topics: ["Forms", "Headless", "Developer Tools"],
        submitterIndex: 4,
        makerIndices: [4],
        launchDate: "2026-08-25",
        upvoteCount: 132,
        commentCount: 1,
        isFeatured: false,
      },
      {
        name: "SoundWave AI",
        slug: "soundwave-ai",
        tagline: "High-fidelity spatial audio mastering and noise cancellation",
        description: "# SoundWave AI\n\nProfessional audio enhancement for podcast creators and video editors. Master audio tracks and isolate voices with a single click.",
        websiteUrl: "https://soundwave.ai",
        pricing: "paid" as const,
        categories: ["AI", "Marketing"],
        topics: ["Audio", "Podcasting", "AI"],
        submitterIndex: 1,
        makerIndices: [1, 5],
        launchDate: "2026-08-24",
        upvoteCount: 685,
        commentCount: 4,
        isFeatured: true,
      },
      {
        name: "DataDrift",
        slug: "datadrift",
        tagline: "Automated schema migration validator and zero-downtime tester",
        description: "# DataDrift\n\nSimulate database migrations against production replicas to detect locks, performance degradation, and data corruption before merging.",
        websiteUrl: "https://datadrift.io",
        pricing: "freemium" as const,
        categories: ["Developer Tools", "SaaS"],
        topics: ["PostgreSQL", "Migrations", "DevOps"],
        submitterIndex: 2,
        makerIndices: [2],
        launchDate: "2026-08-24",
        upvoteCount: 512,
        commentCount: 3,
        isFeatured: true,
      },
      {
        name: "CloudPulse",
        slug: "cloudpulse",
        tagline: "AWS and GCP cost optimizer with autonomous rightsizing",
        description: "# CloudPulse\n\nSave up to 45% on cloud compute bills by automatically downsizing idle instances and leveraging spot capacity.",
        websiteUrl: "https://cloudpulse.io",
        pricing: "freemium" as const,
        categories: ["Developer Tools", "SaaS"],
        topics: ["AWS", "GCP", "FinOps"],
        submitterIndex: 9,
        makerIndices: [9],
        launchDate: "2026-08-24",
        upvoteCount: 388,
        commentCount: 2,
        isFeatured: true,
      },
      {
        name: "NexusAuth",
        slug: "nexusauth",
        tagline: "Decentralized passkey authentication provider for modern web",
        description: "# NexusAuth\n\nImplement biometric passkeys and WebAuthn across iOS, Android, and desktop browsers in 5 lines of code.",
        websiteUrl: "https://nexusauth.dev",
        pricing: "free" as const,
        categories: ["Developer Tools", "Crypto"],
        topics: ["Auth", "Passkeys", "Security"],
        submitterIndex: 10,
        makerIndices: [10],
        launchDate: "2026-08-24",
        upvoteCount: 264,
        commentCount: 2,
        isFeatured: false,
      },
      {
        name: "StreamKit",
        slug: "streamkit",
        tagline: "Open source real-time WebRTC media server for live audio/video",
        description: "# StreamKit\n\nBuild live streaming, virtual classrooms, and gaming lobbies with ultra-low latency WebRTC streaming engine.",
        websiteUrl: "https://streamkit.io",
        pricing: "free" as const,
        categories: ["Developer Tools", "Open Source"],
        topics: ["WebRTC", "Streaming", "Video"],
        submitterIndex: 6,
        makerIndices: [6],
        launchDate: "2026-08-24",
        upvoteCount: 198,
        commentCount: 1,
        isFeatured: false,
      },
      {
        name: "CodeMirror Pro",
        slug: "codemirror-pro",
        tagline: "Rich embedded code editor with LSP and multi-cursor support",
        description: "# CodeMirror Pro\n\nA turnkey code editor component for React and Vue with syntax highlighting, autocomplete, and inline linting.",
        websiteUrl: "https://codemirror.pro",
        pricing: "freemium" as const,
        categories: ["Developer Tools", "Design Tools"],
        topics: ["Editor", "React", "Developer Tools"],
        submitterIndex: 4,
        makerIndices: [4],
        launchDate: "2026-08-24",
        upvoteCount: 154,
        commentCount: 1,
        isFeatured: false,
      },
      {
        name: "VectorBase",
        slug: "vectorbase",
        tagline: "Distributed open-source vector store with hybrid keyword search",
        description: "# VectorBase\n\nCombine sparse BM25 keyword matching with dense HNSW vector search in a single lightning-fast engine.",
        websiteUrl: "https://vectorbase.org",
        pricing: "free" as const,
        categories: ["AI", "Developer Tools", "Open Source"],
        topics: ["Search", "Vector", "RAG"],
        submitterIndex: 2,
        makerIndices: [2, 7],
        launchDate: "2026-08-20",
        upvoteCount: 847,
        commentCount: 6,
        isFeatured: true,
      },
      {
        name: "ShipFast Stack",
        slug: "shipfast-stack",
        tagline: "Complete SaaS starter boilerplate with Stripe, auth, and email",
        description: "# ShipFast Stack\n\nLaunch your SaaS product in hours with preconfigured Next.js 15, Tailwind CSS, Stripe webhooks, and Clerk authentication.",
        websiteUrl: "https://shipfaststack.dev",
        pricing: "paid" as const,
        categories: ["Developer Tools", "SaaS"],
        topics: ["Boilerplate", "Next.js", "Stripe"],
        submitterIndex: 0,
        makerIndices: [0],
        launchDate: "2026-08-20",
        upvoteCount: 720,
        commentCount: 5,
        isFeatured: true,
      },
      {
        name: "SynthVoice",
        slug: "synthvoice",
        tagline: "Ultra-realistic text-to-speech engine with emotional inflection",
        description: "# SynthVoice\n\nGenerate lifelike voiceovers, audiobooks, and video narrations in 40+ languages with granular pitch and emotion controls.",
        websiteUrl: "https://synthvoice.ai",
        pricing: "freemium" as const,
        categories: ["AI", "Marketing"],
        topics: ["Voice", "TTS", "AI"],
        submitterIndex: 1,
        makerIndices: [1],
        launchDate: "2026-08-20",
        upvoteCount: 580,
        commentCount: 4,
        isFeatured: true,
      },
      {
        name: "CodeCanvas",
        slug: "codecanvas",
        tagline: "Visual architecture diagramming tool that syncs with your git repo",
        description: "# CodeCanvas\n\nGenerate interactive C4 architecture diagrams directly from your source code AST and keep them in sync with every pull request.",
        websiteUrl: "https://codecanvas.io",
        pricing: "freemium" as const,
        categories: ["Design Tools", "Developer Tools"],
        topics: ["Architecture", "Diagrams", "Git"],
        submitterIndex: 3,
        makerIndices: [3, 0],
        launchDate: "2026-08-20",
        upvoteCount: 340,
        commentCount: 2,
        isFeatured: false,
      },
      {
        name: "PromptPilot",
        slug: "promptpilot",
        tagline: "Automated prompt evaluation, benchmarking, and cost optimizer",
        description: "# PromptPilot\n\nRun regression tests on LLM prompts, compare response accuracy across GPT-4o, Claude 3.5, and Gemini 1.5, and track token spend.",
        websiteUrl: "https://promptpilot.ai",
        pricing: "free" as const,
        categories: ["AI", "Productivity"],
        topics: ["Prompt Engineering", "LLM", "Testing"],
        submitterIndex: 7,
        makerIndices: [7],
        launchDate: "2026-08-20",
        upvoteCount: 275,
        commentCount: 2,
        isFeatured: false,
      },
      {
        name: "DocuFlow",
        slug: "docuflow",
        tagline: "AI-powered legal contract analysis and compliance checker",
        description: "# DocuFlow\n\nReview NDAs, vendor contracts, and terms of service in seconds. Highlight risky clauses and export redlined documents.",
        websiteUrl: "https://docuflow.law",
        pricing: "freemium" as const,
        categories: ["Productivity", "SaaS"],
        topics: ["Legal", "Contracts", "AI"],        submitterIndex: 5,
        makerIndices: [5],
        launchDate: "2026-08-20",
        upvoteCount: 210,
        commentCount: 2,
        isFeatured: false,
      },
      {
        name: "QuantumDB",
        slug: "quantum-db",
        tagline: "Ultra-low latency serverless vector & document database",
        description: "# QuantumDB\n\nSub-millisecond hybrid vector search with built-in replication across 35 global edge regions.",
        websiteUrl: "https://quantumdb.io",
        pricing: "freemium" as const,
        categories: ["Developer Tools", "AI"],
        topics: ["Database", "Vector", "Edge"],
        submitterIndex: 0,
        makerIndices: [0, 2],
        launchDate: "2026-08-28",
        upvoteCount: 0,
        commentCount: 0,
        isFeatured: false,
        status: "scheduled" as const,
      },
      {
        name: "AgenticStudio",
        slug: "agentic-studio",
        tagline: "Autonomous visual IDE for multi-agent LLM systems",
        description: "# AgenticStudio\n\nVisually build, debug, and monitor complex multi-agent reasoning chains and tool calls in real time.",
        websiteUrl: "https://agenticstudio.dev",
        pricing: "paid" as const,
        categories: ["AI", "Developer Tools"],
        topics: ["Agents", "IDE", "LLM"],
        submitterIndex: 1,
        makerIndices: [1],
        launchDate: "2026-08-28",
        upvoteCount: 0,
        commentCount: 0,
        isFeatured: false,
        status: "scheduled" as const,
      },
    ];
    const insertedProductIds: Id<"products">[] = [];
    const dateProductsMap = new Map<string, { id: Id<"products">; upvoteCount: number }[]>();

    for (const p of productsSeed) {
      const submitterId = userIds[p.submitterIndex];
      const makerIds = p.makerIndices.map((i) => userIds[i]);

      const prodId = await ctx.db.insert("products", {
        name: p.name,
        slug: p.slug,
        tagline: p.tagline,
        description: p.description,
        websiteUrl: p.websiteUrl,
        pricing: p.pricing,
        categories: p.categories,
        topics: p.topics,
        submitterId,
        makerIds,
        status: ("status" in p && p.status ? p.status : "launched") as "launched" | "scheduled" | "draft",
        launchDate: p.launchDate,
        upvoteCount: p.upvoteCount,
        commentCount: p.commentCount,
        isFeatured: p.isFeatured,
        createdAt: Date.now() - (new Date().getTime() - new Date(p.launchDate).getTime()),
      });

      insertedProductIds.push(prodId);

      const group = dateProductsMap.get(p.launchDate) || [];
      group.push({ id: prodId, upvoteCount: p.upvoteCount });
      dateProductsMap.set(p.launchDate, group);

      for (const mId of makerIds) {
        await ctx.db.insert("productMakers", {
          productId: prodId,
          userId: mId,
          role: mId === submitterId ? "maker" : "collaborator",
          createdAt: Date.now(),
        });
      }

      for (let i = 0; i < Math.min(userIds.length, 6); i++) {
        await ctx.db.insert("productUpvotes", {
          productId: prodId,
          userId: userIds[i],
          createdAt: Date.now() - 1000 * (i + 1),
        });
      }

      const topCommentAuthorId = userIds[(p.submitterIndex + 1) % userIds.length];
      const topCommentId = await ctx.db.insert("comments", {
        productId: prodId,
        authorId: topCommentAuthorId,
        body: `Congratulations on launching ${p.name}! How are you approaching scale and API rate limits as early adoption ramps up?`,
        upvoteCount: 7,
        createdAt: Date.now() - 3600000 * 3,
      });

      await ctx.db.insert("commentUpvotes", {
        userId: userIds[(p.submitterIndex + 2) % userIds.length],
        commentId: topCommentId,
        createdAt: Date.now() - 3600000 * 2,
      });

      await ctx.db.insert("comments", {
        productId: prodId,
        authorId: submitterId,
        parentId: topCommentId,
        body: `Thanks for the kind words! We have decoupled our queue processing and edge caching so we can scale horizontally without breaking a sweat. Excited for you to try it!`,
        upvoteCount: 12,
        createdAt: Date.now() - 3600000 * 2,
      });

      await ctx.db.insert("comments", {
        productId: prodId,
        authorId: userIds[(p.submitterIndex + 3) % userIds.length],
        body: `Looks super clean. Does ${p.name} have an integration for self-hosted teams?`,
        upvoteCount: 4,
        createdAt: Date.now() - 3600000,
      });
    }

    // Daily Awards for all 5 dates
    for (const [date, prods] of dateProductsMap.entries()) {
      prods.sort((a, b) => b.upvoteCount - a.upvoteCount);

      if (prods[0]) {
        await ctx.db.insert("awards", {
          productId: prods[0].id,
          type: "product_of_the_day",
          rank: 1,
          period: date,
          awardedAt: Date.now(),
        });
      }
      if (prods[1]) {
        await ctx.db.insert("awards", {
          productId: prods[1].id,
          type: "product_of_the_day",
          rank: 2,
          period: date,
          awardedAt: Date.now(),
        });
      }
      if (prods[2]) {
        await ctx.db.insert("awards", {
          productId: prods[2].id,
          type: "product_of_the_day",
          rank: 3,
          period: date,
          awardedAt: Date.now(),
        });
      }
    }

    // Weekly Awards
    if (insertedProductIds[24]) {
      await ctx.db.insert("awards", {
        productId: insertedProductIds[24],
        type: "product_of_the_week",
        rank: 1,
        period: "2026-W35",
        awardedAt: Date.now(),
      });
    }
    if (insertedProductIds[25]) {
      await ctx.db.insert("awards", {
        productId: insertedProductIds[25],
        type: "product_of_the_week",
        rank: 2,
        period: "2026-W35",
        awardedAt: Date.now(),
      });
    }
    if (insertedProductIds[18]) {
      await ctx.db.insert("awards", {
        productId: insertedProductIds[18],
        type: "product_of_the_week",
        rank: 3,
        period: "2026-W35",
        awardedAt: Date.now(),
      });
    }

    // Monthly Awards
    if (insertedProductIds[24]) {
      await ctx.db.insert("awards", {
        productId: insertedProductIds[24],
        type: "product_of_the_month",
        rank: 1,
        period: "2026-08",
        awardedAt: Date.now(),
      });
    }

    return {
      success: true,
      message: `Full world seeded successfully: 8 categories, ${userIds.length} makers, ${insertedProductIds.length} products across 5 dates, 60+ comments, upvotes, and daily/weekly/monthly awards!`,
    };
  },
});
