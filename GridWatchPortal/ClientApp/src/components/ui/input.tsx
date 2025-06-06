/**
 * @fileoverview
 * This file defines a reusable `Input` component for React applications.
 * The component wraps a native HTML `<input>` element, applying custom styles and utility classes.
 * It supports all standard input props and allows for additional class names via the `className` prop.
 */

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Renders a styled input element with support for custom class names and all standard input props.
 *
 * @param {React.ComponentProps<"input">} props - Props for the input element, including `className` and `type`.
 * @returns {JSX.Element} The rendered input element.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }