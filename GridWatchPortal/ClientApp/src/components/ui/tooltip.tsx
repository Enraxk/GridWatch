/**
 * @fileoverview
 * Tooltip UI components using Radix UI primitives.
 * Provides TooltipProvider, Tooltip, TooltipTrigger, and TooltipContent components
 * for consistent tooltip behavior and styling across the application.
 */

"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

/**
 * TooltipProvider component to wrap tooltip elements and provide context.
 * @param {object} props - Props for TooltipPrimitive.Provider.
 * @param {number} [delayDuration=0] - Delay before showing the tooltip.
 * @returns {JSX.Element}
 */
function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

/**
 * Tooltip root component that wraps children with a TooltipProvider.
 * @param {object} props - Props for TooltipPrimitive.Root.
 * @returns {JSX.Element}
 */
function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

/**
 * TooltipTrigger component to specify the element that triggers the tooltip.
 * @param {object} props - Props for TooltipPrimitive.Trigger.
 * @returns {JSX.Element}
 */
function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

/**
 * TooltipContent component to display the tooltip content.
 * @param {object} props - Props for TooltipPrimitive.Content.
 * @param {string} [className] - Additional class names for styling.
 * @param {number} [sideOffset=0] - Offset for tooltip positioning.
 * @param {React.ReactNode} children - Tooltip content.
 * @returns {JSX.Element}
 */
function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }