/**
 * @fileoverview
 * UI Card component suite for React.
 * Provides Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, and CardContent components.
 * Each component is styled using utility classes and supports custom className and props.
 */

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Card root component.
 * @param {React.ComponentProps<"div">} props - Props for the card container.
 * @returns {JSX.Element}
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

/**
 * Card header component.
 * @param {React.ComponentProps<"div">} props - Props for the card header.
 * @returns {JSX.Element}
 */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

/**
 * Card title component.
 * @param {React.ComponentProps<"div">} props - Props for the card title.
 * @returns {JSX.Element}
 */
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

/**
 * Card description component.
 * @param {React.ComponentProps<"div">} props - Props for the card description.
 * @returns {JSX.Element}
 */
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

/**
 * Card action component.
 * @param {React.ComponentProps<"div">} props - Props for the card action area.
 * @returns {JSX.Element}
 */
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

/**
 * Card content component.
 * @param {React.ComponentProps<"div">} props - Props for the card content area.
 * @returns {JSX.Element}
 */
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

/**
 * Card footer component.
 * @param {React.ComponentProps<"div">} props - Props for the card footer.
 * @returns {JSX.Element}
 */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}