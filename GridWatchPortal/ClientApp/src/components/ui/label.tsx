/**
 * @fileoverview
 * Label component built on top of Radix UI's LabelPrimitive.
 * Applies consistent styling and supports additional class names and props.
 * 
 * Usage:
 *   <Label htmlFor="input-id">Label Text</Label>
 */

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

/**
 * Label component that wraps Radix UI's LabelPrimitive.Root.
 *
 * @param {object} props - Props extending LabelPrimitive.Root component props.
 * @param {string} [props.className] - Additional class names to apply.
 * @returns {JSX.Element} The styled label component.
 */
function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }