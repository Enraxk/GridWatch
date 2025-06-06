/**
 * @fileoverview
 * This file defines a comprehensive, highly-configurable Sidebar UI component system for React applications.
 *
 * The sidebar supports multiple variants (sidebar, floating, inset), collapsible modes (offcanvas, icon, none),
 * and is responsive to mobile and desktop layouts. It provides context management for open/collapsed state,
 * keyboard shortcuts, and state persistence via cookies.
 *
 * The system includes:
 * - SidebarProvider: Context provider for sidebar state and controls.
 * - Sidebar: Main sidebar container, responsive and variant-aware.
 * - SidebarTrigger, SidebarRail: Controls for toggling sidebar state.
 * - SidebarInset: Main content area for inset variant.
 * - SidebarInput, SidebarHeader, SidebarFooter, SidebarSeparator: Utility components for sidebar layout.
 * - SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupAction, SidebarGroupContent: Grouping and labeling.
 * - SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuAction, SidebarMenuBadge, SidebarMenuSkeleton: Menu and action components.
 * - SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton: Submenu support.
 * - useSidebar: Custom hook for accessing sidebar context.
 *
 * The components are styled using Tailwind CSS utility classes and support advanced styling via class-variance-authority (CVA).
 *
 * @module components/ui/sidebar
 */
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeftIcon } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state" // This is the name of the cookie that stores the sidebar state
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 //This is the max age of the cookie in seconds (7 days)
const SIDEBAR_WIDTH = "12rem" // This is the width of the sidebar in rem
const SIDEBAR_WIDTH_MOBILE = "18rem" // This is the width of the sidebar in rem on mobile
const SIDEBAR_WIDTH_ICON = "3rem" // This is the width of the sidebar in rem when collapsed
const SIDEBAR_KEYBOARD_SHORTCUT = "b" // This is the keyboard shortcut to toggle the sidebar

/**
 * SidebarProvider is a context provider that manages the state of the sidebar.
 */
type SidebarContextProps = {
  state: "expanded" | "collapsed" // This is the state of the sidebar.
  open: boolean // This is the open state of the sidebar.
  setOpen: (open: boolean) => void // This is the function to set the open state of the sidebar.
  openMobile: boolean
  setOpenMobile: (open: boolean) => void // This is the function to set the open state of the sidebar on mobile.
  isMobile: boolean // This is a boolean that indicates if the sidebar is on mobile.
  toggleSidebar: () => void // This is the function to toggle the sidebar.
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null) // This is the context that holds the state of the sidebar.
/**
 * useSidebar is a custom hook that returns the sidebar context.
 */
function useSidebar() {
  const context = React.useContext(SidebarContext) // This is the context that holds the state of the sidebar.
  if (!context) { // This is a check to see if the context is null.
    throw new Error("useSidebar must be used within a SidebarProvider.") // This is an error that is thrown if the context is null.
  }

  return context // This returns the context that holds the state of the sidebar.
}

/**
 * SidebarProvider is a context provider that manages the state of the sidebar.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {boolean} [props.defaultOpen=true] - The default open state of the sidebar.
 * @param {boolean} [props.open] - The controlled open state of the sidebar.
 * @param {Function} [props.onOpenChange] - The function to call when the open state changes.
 * @param {string} [props.className] - Additional class names for the component.
 * @param {Object} [props.style] - Additional styles for the component.
 * @param {React.ReactNode} props.children - The children elements to be rendered inside the provider.
 * @returns {JSX.Element} The rendered SidebarProvider component.
 */
function SidebarProvider({
  defaultOpen = false,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open]
  )

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
  }, [isMobile, setOpen, setOpenMobile])

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed"

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar min-h-svh w-full",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

/**
 * Sidebar component that renders a sidebar with various configurations.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {"left" | "right"} [props.side="left"] - The side of the sidebar.
 * @param {"sidebar" | "floating" | "inset"} [props.variant="sidebar"] - The variant of the sidebar.
 * @param {"offcanvas" | "icon" | "none"} [props.collapsible="offcanvas"] - The collapsible type of the sidebar.
 * @param {string} [props.className] - Additional class names for the component.
 * @param {React.ReactNode} props.children - The children elements to be rendered inside the sidebar.
 * @returns {JSX.Element} The rendered Sidebar component.
 */
function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="bg-sidebar text-sidebar-foreground flex w-(--sidebar-width) p-0 [&>button]:hidden"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      className="group peer text-sidebar-foreground hidden md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
        )}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          // Adjust the padding for floating and inset variants.
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm"
        >
          {children}
        </div>
      </div>
    </div>
  )
}

/**
 * SidebarTrigger is a component that renders a button to toggle the sidebar.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} [props.className] - Additional class names for the component.
 * @param {Function} [props.onClick] - The function to call when the button is clicked.
 * @param {"left" | "right"} props.side - The side of the sidebar.
 * @returns {JSX.Element} The rendered SidebarTrigger component.
 */
function SidebarTrigger({
                          className,
                          onClick,
                          side,
                          ...props
                        }: React.ComponentProps<typeof Button> & { side: "left" | "right" }) {
  const { toggleSidebar } = useSidebar()

  return (
      <Button
          data-sidebar="trigger"
          data-slot="sidebar-trigger"
          variant="ghost"
          size="icon"
          className={cn(
              "size-7",
              side === "left" ? "ml-auto" : "mr-auto",
              className
          )}
          onClick={(event) => {
            onClick?.(event)
            toggleSidebar()
          }}
          {...props}
      >
        <PanelLeftIcon />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
  )
}

/**
 * SidebarRail is a component that renders a rail for toggling the sidebar.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} [props.className] - Additional class names for the component.
 * @returns {JSX.Element} The rendered SidebarRail component.
 */
function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props}
    />
  )
}

/**
 * SidebarInset is a component that renders the main content area of the sidebar.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} [props.className] - Additional class names for the component.
 * @returns {JSX.Element} The rendered SidebarInset component.
 */
function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "bg-background relative flex w-full flex-1 flex-col",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className
      )}
      {...props}
    />
  )
}

/**
 * SidebarInput is a component that renders an input field inside the sidebar.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} [props.className] - Additional class names for the component.
 * @returns {JSX.Element} The rendered SidebarInput component.
 */
function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn("bg-background h-8 w-full shadow-none", className)}
      {...props}
    />
  )
}

/**
 * SidebarHeader is a component that renders the header section of the sidebar.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} [props.className] - Additional class names for the component.
 * @returns {JSX.Element} The rendered SidebarHeader component.
 */
function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
}

/**
 * SidebarFooter is a component that renders the footer section of the sidebar.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} [props.className] - Additional class names for the component.
 * @returns {JSX.Element} The rendered SidebarFooter component.
 */
function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
}

/**
 * SidebarSeparator is a component that renders a separator inside the sidebar.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} [props.className] - Additional class names for the component.
 * @returns {JSX.Element} The rendered SidebarSeparator component.
 */
function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn("bg-sidebar-border mx-2 w-auto", className)}
      {...props}
    />
  )
}

/**
 * SidebarContent is a component that renders the main content area of the sidebar.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} [props.className] - Additional class names for the component.
 * @returns {JSX.Element} The rendered SidebarContent component.
 */
function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

/**
 * SidebarGroup is a component that renders a group inside the sidebar.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} [props.className] - Additional class names for the component.
 * @returns {JSX.Element} The rendered SidebarGroup component.
 */
function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  )
}

/**
 * SidebarGroupLabel is a component that renders a label for a sidebar group.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} [props.className] - Additional class names for the component.
 * @param {boolean} [props.asChild=false] - If true, renders the component as a child element.
 * @returns {JSX.Element} The rendered SidebarGroupLabel component.
 */
function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        "text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      )}
      {...props}
    />
  )
}

/**
 * SidebarGroupAction is a component that renders an action button inside a sidebar group.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} [props.className] - Additional class names for the component.
 * @param {boolean} [props.asChild=false] - If true, renders the component as a child element.
 * @returns {JSX.Element} The rendered SidebarGroupAction component.
 */
function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 md:after:hidden",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

/**
 * SidebarGroupContent is a component that renders the content of a sidebar group.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} [props.className] - Additional class names for the component.
 * @returns {JSX.Element} The rendered SidebarGroupContent component.
 */
function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  )
}

/**
 * SidebarMenu is a component that renders a list of items inside the sidebar.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} [props.className] - Additional class names for the component.
 * @returns {JSX.Element} The rendered SidebarMenu component.
 */
function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  )
}

/**
 * SidebarMenuItem is a component that renders a list item inside the sidebar menu.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} [props.className] - Additional class names for the component.
 * @returns {JSX.Element} The rendered SidebarMenuItem component.
 */
function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  )
}

/**
 * `sidebarMenuButtonVariants` defines the variants for the SidebarMenuButton component.
 * It uses `class-variance-authority` to manage different styles based on the provided variants.
 */
const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/**
 * SidebarMenuButton is a component that renders a button inside the sidebar menu.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {boolean} [props.asChild=false] - If true, renders the component as a child element.
 * @param {boolean} [props.isActive=false] - If true, indicates that the button is active.
 * @param {string} [props.variant="default"] - The variant of the button.
 * @param {string} [props.size="default"] - The size of the button.
 * @param {string|Object} [props.tooltip] - The tooltip content or properties.
 * @param {string} [props.className] - Additional class names for the component.
 * @returns {JSX.Element} The rendered SidebarMenuButton component.
 */
function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string | React.ComponentProps<typeof TooltipContent>
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const Comp = asChild ? Slot : "button"
  const { isMobile, state } = useSidebar()

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  )

  if (!tooltip) {
    return button
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...tooltip}
      />
    </Tooltip>
  )
}

/**
 * SidebarMenuAction is a component that renders an action button inside the sidebar menu.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} [props.className] - Additional class names for the component.
 * @param {boolean} [props.asChild=false] - If true, renders the component as a child element.
 * @param {boolean} [props.showOnHover=false] - If true, shows the action button on hover.
 * @returns {JSX.Element} The rendered SidebarMenuAction component.
 */
function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
  showOnHover?: boolean
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 md:after:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0",
        className
      )}
      {...props}
    />
  )
}

/**
 * SidebarMenuBadge is a component that renders a badge inside the sidebar menu.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} [props.className] - Additional class names for the component.
 * @returns {JSX.Element} The rendered SidebarMenuBadge component.
 */
function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

/**
 * SidebarMenuSkeleton is a component that renders a skeleton loader for the sidebar menu.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} [props.className] - Additional class names for the component.
 * @param {boolean} [props.showIcon=false] - If true, shows an icon in the skeleton loader.
 * @returns {JSX.Element} The rendered SidebarMenuSkeleton component.
 */
function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean
}) {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  }, [])

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  )
}

/**
 * SidebarMenuSub is a component that renders a submenu inside the sidebar.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} [props.className] - Additional class names for the component.
 * @returns {JSX.Element} The rendered SidebarMenuSub component.
 */
function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

/**
 * SidebarMenuSubItem is a component that renders a list item inside a sidebar submenu.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} [props.className] - Additional class names for the component.
 * @
function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  )
}
    
/**
 * SidebarMenuSubButton is a component that renders a button or link inside a sidebar submenu.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {boolean} [props.asChild=false] - If true, renders the component as a child element.
 * @param {"sm" | "md"} [props.size="md"] - The size of the button.
 * @param {boolean} [props.isActive=false] - If true, indicates that the button is active.
 * @param {string} [props.className] - Additional class names for the component.
 * @returns {JSX.Element} The rendered SidebarMenuSubButton component.
 */
function SidebarMenuSubButton({
  asChild = false,
  size = "md",
  isActive = false,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
  size?: "sm" | "md"
  isActive?: boolean
}) {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

class SidebarMenuSubItem {
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
