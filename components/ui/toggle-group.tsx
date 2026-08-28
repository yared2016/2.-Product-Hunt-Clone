"use client"

import * as React from "react"
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const toggleGroupVariants = cva(
  "inline-flex items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground gap-1",
  {
    variants: {
      size: {
        default: "h-9 text-sm",
        sm: "h-8 text-xs",
        lg: "h-10 text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const toggleGroupItemVariants = cva(
  "inline-flex items-center justify-center rounded-lg px-3 py-1 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground hover:text-foreground hover:bg-background/50 cursor-pointer select-none data-[pressed]:bg-background data-[pressed]:text-foreground data-[pressed]:shadow-xs data-[pressed]:font-semibold data-[selected]:bg-background data-[selected]:text-foreground data-[selected]:shadow-xs data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-xs",
  {
    variants: {
      size: {
        default: "h-7 px-2.5",
        sm: "h-6 px-2",
        lg: "h-8 px-3.5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

function ToggleGroup({
  className,
  size = "default",
  children,
  ...props
}: ToggleGroupPrimitive.Props & VariantProps<typeof toggleGroupVariants>) {
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      className={cn(toggleGroupVariants({ size }), className)}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive>
  )
}

function ToggleGroupItem({
  className,
  size = "default",
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleGroupItemVariants>) {
  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      className={cn(toggleGroupItemVariants({ size }), className)}
      {...props}
    />
  )
}

export { ToggleGroup, ToggleGroupItem }
