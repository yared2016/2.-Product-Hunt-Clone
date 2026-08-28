"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cn } from "@/lib/utils"

function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  )
}

function TabsList({ className, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex items-center justify-start rounded-2xl bg-muted/60 p-1.5 text-muted-foreground gap-1.5 border border-border/80",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-muted-foreground hover:text-foreground hover:bg-background/60 hover:shadow-2xs active:scale-[0.98] data-[selected]:bg-background data-[selected]:text-foreground data-[selected]:shadow-xs data-[selected]:ring-1 data-[selected]:ring-border/80 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs data-[state=active]:ring-1 data-[state=active]:ring-border/80 data-[active]:bg-background data-[active]:text-foreground data-[active]:shadow-xs data-[active]:ring-1 data-[active]:ring-border/80 aria-selected:bg-background aria-selected:text-foreground aria-selected:shadow-xs aria-selected:ring-1 aria-selected:ring-border/80 cursor-pointer select-none",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn(
        "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
