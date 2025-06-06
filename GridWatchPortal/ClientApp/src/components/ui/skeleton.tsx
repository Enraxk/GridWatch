/**
 * @fileoverview
 * Skeleton component for displaying a loading placeholder.
 * Uses a pulsing animation and accent background to indicate loading state.
 * Accepts all standard div props and allows custom class names.
 */

import { cn } from "@/lib/utils"

/**
 * Renders a skeleton loading placeholder.
 *
 * @param {React.ComponentProps<"div">} props - Standard div props and optional className.
 * @returns {JSX.Element} The skeleton placeholder element.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }