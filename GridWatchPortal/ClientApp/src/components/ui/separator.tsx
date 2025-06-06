/**
 * @fileoverview
 * Separator component for visually dividing content.
 * Utilizes Radix UI's SeparatorPrimitive and supports horizontal and vertical orientations.
 * Accepts custom class names and passes additional props to the underlying primitive.
 */

"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

/**
 * Separator component for visually dividing content.
 *
 * @param {object} props - Props extending SeparatorPrimitive.Root component props.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {"horizontal" | "vertical"} [props.orientation="horizontal"] - Orientation of the separator.
 * @param {boolean} [props.decorative=true] - Whether the separator is decorative.
 * @returns {JSX.Element} The rendered separator.
 */
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator-root"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  )
}

export { Separator }