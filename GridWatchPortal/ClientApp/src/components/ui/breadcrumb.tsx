/**
 * @fileoverview
 * UI components for rendering accessible and customizable breadcrumb navigation.
 * 
 * Components:
 * - Breadcrumb: Container for the breadcrumb navigation.
 * - BreadcrumbList: Ordered list for breadcrumb items.
 * - BreadcrumbItem: List item for each breadcrumb entry.
 * - BreadcrumbLink: Link for navigable breadcrumb items, supports custom components via asChild.
 * - BreadcrumbPage: Non-navigable breadcrumb item representing the current page.
 * - BreadcrumbSeparator: Visual separator between breadcrumb items, customizable.
 * - BreadcrumbEllipsis: Ellipsis component for collapsed breadcrumb items.
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Container for the breadcrumb navigation.
 * @param props React.ComponentProps<"nav">
 */
function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />
}

/**
 * Ordered list for breadcrumb items.
 * @param className Additional class names.
 * @param props React.ComponentProps<"ol">
 */
function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
        className
      )}
      {...props}
    />
  )
}

/**
 * List item for each breadcrumb entry.
 * @param className Additional class names.
 * @param props React.ComponentProps<"li">
 */
function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  )
}

/**
 * Link for navigable breadcrumb items.
 * Supports custom components via asChild.
 * @param asChild Render as a custom component.
 * @param className Additional class names.
 * @param props React.ComponentProps<"a">
 */
function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn("hover:text-foreground transition-colors", className)}
      {...props}
    />
  )
}

/**
 * Non-navigable breadcrumb item representing the current page.
 * @param className Additional class names.
 * @param props React.ComponentProps<"span">
 */
function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("text-foreground font-normal", className)}
      {...props}
    />
  )
}

/**
 * Visual separator between breadcrumb items.
 * Customizable via children.
 * @param children Custom separator element.
 * @param className Additional class names.
 * @param props React.ComponentProps<"li">
 */
function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  )
}

/**
 * Ellipsis component for collapsed breadcrumb items.
 * @param className Additional class names.
 * @param props React.ComponentProps<"span">
 */
function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}