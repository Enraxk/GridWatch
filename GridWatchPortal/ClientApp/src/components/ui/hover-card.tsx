/**
 * @fileoverview
 * UI components for a Hover Card using Radix UI primitives.
 * Provides `HoverCard`, `HoverCardTrigger`, and `HoverCardContent` components
 * for displaying contextual information on hover.
 */

import * as React from "react"
import * as HoverCardPrimitive from "@radix-ui/react-hover-card"

import { cn } from "@/lib/utils"

/**
 * Root component for the Hover Card.
 * Wraps Radix's HoverCardPrimitive.Root and passes all props through.
 *
 * @param {React.ComponentProps<typeof HoverCardPrimitive.Root>} props - Props for the root hover card.
 * @returns {JSX.Element}
 */
function HoverCard({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />
}

/**
 * Trigger component for the Hover Card.
 * Wraps Radix's HoverCardPrimitive.Trigger and passes all props through.
 *
 * @param {React.ComponentProps<typeof HoverCardPrimitive.Trigger>} props - Props for the trigger.
 * @returns {JSX.Element}
 */
function HoverCardTrigger({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return (
    <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
  )
}

/**
 * Content component for the Hover Card.
 * Wraps Radix's HoverCardPrimitive.Content inside a Portal.
 * Applies custom styling and supports alignment and offset props.
 *
 * @param {React.ComponentProps<typeof HoverCardPrimitive.Content>} props - Props for the content.
 * @param {string} [className] - Additional class names for styling.
 * @param {"start" | "center" | "end"} [align="center"] - Alignment of the content.
 * @param {number} [sideOffset=4] - Offset from the trigger element.
 * @returns {JSX.Element}
 */
function HoverCardContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }