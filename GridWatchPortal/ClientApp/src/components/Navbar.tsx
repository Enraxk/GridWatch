/**
 * @fileoverview NavigationBar component for GridWatch Portal
 * Provides the main navigation interface with dropdown menus, breadcrumbs, and user profile.
 */
import React, {useMemo, useCallback} from "react";
import {useLocation, Link} from "react-router-dom";
import { Bell, ServerCog } from "lucide-react";
import {
    NavigationMenu, NavigationMenuContent, NavigationMenuItem,
    NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger
} from "@/components/ui/navigation-menu";
import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {cn} from "@/lib/utils";
import {Home, Settings, Grid, Database, BarChart3, User} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import gridwatchLogo from "@/assets/gridwatch_logo_dark.png"; // using alias or relative import





/**
 * Configuration for the navigation menu items
 * @type {Array<{
 *   title: string,
 *   icon: JSX.Element,
 *   content: Array<{
 *     title: string,
 *     href: string,
 *     description: string,
 *     exactMatch?: boolean,
 *     badge?: string
 *   }>
 * }>}
 */
const NavbarItems = [
    {
        title: "Dashboard",
        icon: <Home className="mr-2 h-4 w-4"/>,
        content: [
            {title: "Main Dashboard", href: "/", description: "Standard grid dashboard", exactMatch: true},
            {title: "Dynamic Dashboard", href: "/dynamic-dashboard", description: "Customizable dashboard views"}
        ]
    },
    {
        title: "Testing Tools",
        icon: <Grid className="mr-2 h-4 w-4"/>,
        content: [
            {
                title: "Grid Testing",
                href: "/grid-testing",
                description: "Test grid layouts and configurations",
                badge: "New"
            }
        ]
    },
    {
    title: "Device Management",
    icon: <ServerCog className="mr-2 h-4 w-4" />, // More intuitive for devices
    content: [
      {
        title: "Device Fleet",
        href: "/devices/batch",
        description: "Apply firmware updates, alarms, and CSR to multiple devices"
      },
      {
        title: "Device Details",
        href: "/devices/manage",
        description: "View and manage individual device twins and properties"
      }
    ]
  },
    {
        title: "Analytics",
        icon: <BarChart3 className="mr-2 h-4 w-4"/>,
    content: [
      {
        title: "Device Analytics",
        href: "/device-graphing",
        description: "Inspect device telemetry profiles"
      },
      {
        title: "Real Time Analytics",
        href: "/device-graphinge",
        description: "Launch ADX Query Editor to perform real time data queries"
      }
    ]
    },
    {
        title: "System",
        icon: <Settings className="mr-2 h-4 w-4"/>,
        content: [
        {  
        title: "Notifications",
        href: "/notifications",
        description: "Setup user groups and contacts to receive notifications"
      },      ]
    }
];

// Extract common styles as constants
/**
 * Styling constants for navigation components
 */
const TRIGGER_STYLES = "px-3 bg-slate-700 hover:bg-slate-600 text-slate-100";
const LINK_BASE_STYLES = "flex h-auto flex-col items-start justify-start p-4 transition-colors rounded-md text-slate-100 hover:bg-slate-600";
const LINK_ACTIVE_STYLES = "bg-slate-600 text-white font-medium";
const LINK_INACTIVE_STYLES = "bg-slate-700";

/**
 * Navigation bar component for the application
 * Displays the main app navigation, breadcrumbs for current location, and user profile dropdown
 * @returns {JSX.Element} The rendered navigation bar
 */
export const Navbar = React.memo(function Navbar() {
    const location = useLocation();
    const currentPath = location.pathname;

    /**
     * Formats the current path for display in breadcrumbs
     * Converts paths like '/some-page' to 'some page'
     */
    const displayPath = useMemo(() => {
        return currentPath === "/" ? "Home" : currentPath.substring(1).replace(/-/g, " ");
    }, [currentPath]);

    /**
     * Determines if a navigation link should be highlighted as active
     * @param {string} href - The link path to check
     * @param {boolean} exactMatch - Whether to require exact path matching
     * @returns {boolean} True if the link should be highlighted as active
     */
    const isActive = useCallback((href: string, exactMatch = false) => {
        if (exactMatch) {
            return currentPath === href || (href === "/" && currentPath === "/dashboard");
        }
        return currentPath === href;
    }, [currentPath]);

    /**
     * Determines the current section based on the active page
     * Used for highlighting the current section in the navigation
     * @returns {string} The title of the current section
     */
    const getCurrentSection = useMemo(() => {
        for (const item of NavbarItems) {
            for (const contentItem of item.content) {
                if (isActive(contentItem.href)) {
                    return item.title;
                }
            }
        }
        return "Dashboard";
    }, [isActive]);

    /**
     * User profile dropdown menu component
     * Displays user information and profile/settings links
     */
    const userProfileMenu = useMemo(() => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon"
                        className="rounded-full h-8 w-8 bg-slate-700 text-slate-100 hover:bg-slate-600">
                    <User className="h-5 w-5"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium text-slate-200">Admin User</p>
                        <p className="text-xs text-slate-400">admin@gridwatch.com</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator/>
                <DropdownMenuItem className="cursor-pointer hover:bg-slate-700">
                    <User className="mr-2 h-4 w-4"/>
                    <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-slate-700">
                    <Settings className="mr-2 h-4 w-4"/>
                    <span>Settings</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    ), []);

    return (
        <nav
            className="bg-slate-800 border-b border-slate-700 p-4 rounded-md shadow-sm"
            aria-label="Main navigation"
        >
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
<a href="https://www.gridwatch.ie" target="_blank" rel="noopener noreferrer">
  <img
    src={gridwatchLogo}
    alt="GridWatch Logo"
    className="h-10 cursor-pointer"
  />
</a>


                    <Breadcrumb>
                        <BreadcrumbList>
                            {currentPath !== "/" && (
                                <>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink asChild><Link to="/"
                                                                      className="text-slate-200 hover:text-white"/></BreadcrumbLink>

                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator className="text-slate-400"/>
                                    <BreadcrumbPage className="text-slate-300">{displayPath}</BreadcrumbPage>
                                </>
                            )}
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <div className="flex items-center gap-2">
                    <NavigationMenu className="w-full md:w-auto">
                        <NavigationMenuList className="flex flex-wrap justify-center">
                            {NavbarItems.map((item, index) => (
                                <NavigationMenuItem key={index}>
                                    <NavigationMenuTrigger className={TRIGGER_STYLES}>
                                        <div className="flex items-center">
                                            {item.icon}
                                            {item.title}
                                        </div>
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent className="bg-slate-700 border border-slate-600">
                                        <ul className="grid gap-3 p-4 w-[400px] md:w-[500px] grid-cols-1">
                                            {item.content.map((contentItem, i) => (
                                                <li key={i} className="row-span-1">
                                                    <NavigationMenuLink asChild>
                                                        <Link
                                                            to={contentItem.href}
                                                            className={cn(
                                                                LINK_BASE_STYLES,
                                                                isActive(contentItem.href, contentItem.exactMatch)
                                                                    ? LINK_ACTIVE_STYLES
                                                                    : LINK_INACTIVE_STYLES
                                                            )}
                                                        >
                                                            <div className="flex w-full items-center justify-between">
                                                                <span
                                                                    className="text-sm font-medium">{contentItem.title}</span>
                                                                {contentItem.badge && (
                                                                    <span
                                                                        className="ml-2 rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">
                                                                            {contentItem.badge}
                                                                        </span>
                                                                )}
                                                            </div>
                                                            {contentItem.description && (
                                                                <span
                                                                    className="mt-1 text-xs leading-tight text-slate-300">
                                                                        {contentItem.description}
                                                                    </span>
                                                            )}
                                                        </Link>
                                                    </NavigationMenuLink>
                                                </li>
                                            ))}
                                        </ul>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>

                    {/* User icon at the far right */}
                    <div className="ml-4 border-l border-slate-600 pl-4">
                        {userProfileMenu}
                    </div>
                </div>
            </div>
        </nav>
    );
});