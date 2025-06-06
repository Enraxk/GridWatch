/**
 * @fileoverview
 * Progress component built with Radix UI's ProgressPrimitive.
 * Renders a customizable progress bar with animated indicator.
 * 
 * Props:
 * - className: Additional CSS classes for the root element.
 * - value: Number representing the progress percentage (0-100).
 * - ...props: Other props passed to the Radix Progress Root.
 */

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

/**
 * Progress bar component.
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {number} [props.value] - Progress value (0-100).
 * @returns {JSX.Element} The rendered progress bar.
 */
function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }