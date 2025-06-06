/**
 * @file AppSidebar.tsx
 * @description Customizable, collapsible sidebar component with categories, drag-and-drop menu items
 * and responsive tooltips for the GridWatch application.
 * @module components/AppSidebar
 */

import {
    Calendar,
    Home,
    Inbox,
    Search,
    Settings,
    User2,
    ChevronDown,
    ChevronUp,
    ArrowLeft,
    ArrowRight,
    BarChart3,
    Grid,
    Database,
    PanelRight,
    Layers,
    Bell
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
    SidebarTrigger
} from "@/components/ui/sidebar"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip"

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { ModeToggle } from "@/components/mode-toggle.tsx";
import resizeIcon from "@/assets/expandsquare-expand-arrow-direction-move-arrows-svgrepo-com.svg";
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { NavLink } from 'react-router-dom';

/** Storage key prefix for saving menu item order in localStorage */
const SIDEBAR_ORDER_KEY_PREFIX = 'gridwatch-sidebar-';

/**
 * Interface defining the structure of a menu item
 * @interface MenuItem
 * @property {string} id - Unique identifier for the menu item
 * @property {string} title - Display text for the menu item
 * @property {string} url - Navigation URL for the menu item
 * @property {React.FC<React.SVGProps<SVGSVGElement>>} icon - Icon component to display
 */
interface MenuItem {
    id: string;
    title: string;
    url: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

/**
 * Interface defining the structure of a menu category
 * @interface MenuCategory
 * @property {string} id - Unique identifier for the category
 * @property {string} label - Display text for the category
 * @property {MenuItem[]} items - Array of menu items in this category
 */
interface MenuCategory {
    id: string;
    label: string;
    items: MenuItem[];
}

/**
 * Initial menu categories and items configuration
 * Organized into Main, Dashboards, Tools, and Data sections
 */
const initialMenuCategories: MenuCategory[] = [
    {
        id: "main",
        label: "Main",
        items: [
            {
                id: "home",
                title: "Home",
                url: "/",
                icon: Home,
            },
            {
                id: "notifications",
                title: "Notification",
                url: "/notifications",
                icon: Bell,
            }
        ]
    },
    {
        id: "dashboards",
        label: "Dashboards",
        items: [
            {
                id: "main-dashboard",
                title: "Main Dashboard",
                url: "/",
                icon: BarChart3,
            },
            {
                id: "dynamic-dashboard",
                title: "Dynamic Dashboard",
                url: "/dynamic-dashboard",
                icon: Grid,
            }
        ]
    },
    {
        id: "tools",
        label: "Tools",
        items: [
            {
                id: "calendar",
                title: "Calendar",
                url: "#",
                icon: Calendar,
            },
            {
                id: "search",
                title: "Search",
                url: "#",
                icon: Search,
            },
            {
                id: "grid-testing",
                title: "Grid Testing",
                url: "/grid-testing",
                icon: Layers,
            }
        ]
    },
    {
        id: "data",
        label: "Data",
        items: [
            {
                id: "analytics",
                title: "Analytics",
                url: "#",
                icon: Database,
            },
            {
                id: "reports",
                title: "Reports",
                url: "#",
                icon: PanelRight,
            }
        ]
    }
];

/**
 * Sortable menu item component that supports drag and drop functionality
 * Shows tooltips when sidebar is collapsed
 *
 * @component
 * @param {Object} props - Component props
 * @param {MenuItem} props.item - The menu item to render
 * @returns {JSX.Element} A draggable menu item with optional tooltip
 */
const SortableMenuItem = ({ item }: { item: MenuItem }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: 'grab',
    };

    const menuItem = (
        <SidebarMenuItem>
            <SidebarMenuButton asChild>
                <NavLink to={item.url} className={({ isActive }) => isActive ? "text-sidebar-primary" : ""}>
                    <item.icon />
                    <span>{item.title}</span>
                </NavLink>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );

    // Wrap with tooltip only when sidebar is collapsed
    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {isCollapsed ? (
                <TooltipProvider>
                    <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                            {menuItem}
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            {item.title}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ) : (
                menuItem
            )}
        </div>
    );
};

/**
 * AppSidebar component provides a customizable, collapsible sidebar with categories and
 * drag-and-drop menu items. It supports tooltips in collapsed mode, persists state to
 * localStorage, and can be positioned on either side of the screen.
 *
 * @component
 * @param {Object} props - Component props
 * @param {"left" | "right"} props.side - The side where the sidebar should be displayed
 * @param {React.Dispatch<React.SetStateAction<"left" | "right">>} props.onSideChange - Function to change sidebar position
 * @param {boolean} props.isResizable - Whether dashboard cards are resizable
 * @param {React.Dispatch<React.SetStateAction<boolean>>} props.setIsResizable - Function to toggle resizable state
 * @returns {JSX.Element} A fully configured sidebar component
 */
export function AppSidebar({ side, onSideChange, isResizable, setIsResizable }: {
    side: "left" | "right";
    onSideChange: React.Dispatch<React.SetStateAction<"left" | "right">>;
    isResizable: boolean;
    setIsResizable: React.Dispatch<React.SetStateAction<boolean>>
}) {
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";

    /**
     * Initialize menu categories from localStorage or use default
     * Preserves user's custom ordering of menu items
     */
    const [menuCategories, setMenuCategories] = useState<MenuCategory[]>(() => {
        try {
            const savedCategories = initialMenuCategories.map(category => {
                const savedItems = localStorage.getItem(`${SIDEBAR_ORDER_KEY_PREFIX}${category.id}`);

                if (savedItems) {
                    const savedIds = JSON.parse(savedItems);
                    // Map saved IDs back to full items
                    const items = savedIds
                        .map((id: string) => category.items.find(item => item.id === id))
                        .filter(Boolean);
                    return { ...category, items };
                }

                return category;
            });
            return savedCategories;
        } catch (e) {
            console.error("Error loading sidebar menu order:", e);
            return initialMenuCategories;
        }
    });

    /**
     * Set of expanded category IDs (all categories start expanded by default)
     */
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
        () => new Set(menuCategories.map(c => c.id))
    );

    /**
     * Toggles expansion state of a category
     * @param {string} categoryId - ID of the category to toggle
     */
    const toggleCategory = (categoryId: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    };

    /**
     * Save menu item order to localStorage when it changes
     */
    useEffect(() => {
        menuCategories.forEach(category => {
            localStorage.setItem(
                `${SIDEBAR_ORDER_KEY_PREFIX}${category.id}`,
                JSON.stringify(category.items.map(item => item.id))
            );
        });
    }, [menuCategories]);

    /**
     * Toggles sidebar position between left and right
     */
    const handleMoveSidebar = () => {
        onSideChange(side === "left" ? "right" : "left");
    };

    /**
     * Toggles resizability of dashboard cards
     */
    const handleToggleResize = () => {
        setIsResizable(!isResizable);
    };

    /**
     * Configure sensors for drag and drop interaction
     * Adds minimum drag distance to prevent accidental drags
     */
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Require minimum drag distance before activating
            },
        })
    );

    /**
     * Handle drag end event for menu items within a specific category
     * Updates the order of items based on drag result
     *
     * @param {string} categoryId - ID of the category containing the dragged item
     * @returns {(event: DragEndEvent) => void} - Event handler function
     */
    const handleDragEnd = (categoryId: string) => (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setMenuCategories(prevCategories => {
                return prevCategories.map(category => {
                    if (category.id !== categoryId) return category;

                    const items = [...category.items];
                    const oldIndex = items.findIndex(item => item.id === active.id);
                    const newIndex = items.findIndex(item => item.id === over.id);

                    const [movedItem] = items.splice(oldIndex, 1);
                    items.splice(newIndex, 0, movedItem);

                    return { ...category, items };
                });
            });
        }
    };

    /**
     * Helper function to conditionally wrap an element with a tooltip when sidebar is collapsed
     *
     * @param {React.ReactNode} element - The element to possibly wrap with a tooltip
     * @param {string} tooltipContent - The text to show in the tooltip
     * @returns {React.ReactNode} - Either the original element or element wrapped in tooltip
     */
    const withTooltip = (element: React.ReactNode, tooltipContent: string) => {
        if (!isCollapsed) return element;

        return (
            <TooltipProvider>
                <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                        {element}
                    </TooltipTrigger>
                    <TooltipContent side={side === "left" ? "right" : "left"}>
                        {tooltipContent}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    };

    /**
     * Memoized workspace dropdown menu to prevent unnecessary rerenders
     */
    const workspacesDropdown = useMemo(() => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                    My Workspace
                    <ChevronDown className="ml-auto" />
                </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-(--radix-popper-anchor-width)">
                <DropdownMenuItem>
                    <span>Personal Space</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <span>Development Team</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <span>Operations Team</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <span>Create New Workspace</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    ), []);
    return (
        <Sidebar collapsible="icon" side={side} className="bg-sidebar">
            <SidebarHeader className="border-b border-sidebar-border">
                <SidebarMenu>
                    <SidebarTrigger side={side}/>
                    {withTooltip(
                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={handleMoveSidebar}>
                                {side === "left" ? <ArrowRight /> : <ArrowLeft />}
                                {!isCollapsed && (side === "left" ? "Move Sidebar Right" : "Move Sidebar Left")}
                            </SidebarMenuButton>
                        </SidebarMenuItem>,
                        side === "left" ? "Move Sidebar Right" : "Move Sidebar Left"
                    )}
                    {!isCollapsed && (
                        <SidebarMenuItem>
                            {workspacesDropdown}
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {menuCategories.map(category => (
                    <SidebarGroup key={category.id}>
                        {withTooltip(
                            <SidebarGroupLabel
                                onClick={() => toggleCategory(category.id)}
                                className="cursor-pointer flex items-center justify-between"
                            >
                                {!isCollapsed && category.label}
                                {!isCollapsed && (expandedCategories.has(category.id) ?
                                        <ChevronUp className="h-4 w-4" /> :
                                        <ChevronDown className="h-4 w-4" />
                                )}
                            </SidebarGroupLabel>,
                            category.label
                        )}

                        {expandedCategories.has(category.id) && (
                            <SidebarGroupContent>
                                <DndContext
                                    sensors={sensors}
                                    onDragEnd={handleDragEnd(category.id)}
                                    modifiers={[restrictToVerticalAxis]}
                                >
                                    <SidebarMenu>
                                        <SortableContext
                                            items={category.items.map(item => item.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {category.items.map((item) => (
                                                <SortableMenuItem
                                                    key={item.id}
                                                    item={item}
                                                />
                                            ))}
                                        </SortableContext>
                                    </SidebarMenu>
                                </DndContext>
                            </SidebarGroupContent>
                        )}
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border">
                <SidebarMenu>
                    {withTooltip(
                        <SidebarMenuItem>
                            <ModeToggle />
                        </SidebarMenuItem>,
                        "Toggle Theme"
                    )}

                    {withTooltip(
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton>
                                        <Settings />
                                        {!isCollapsed && (
                                            <>
                                                <span>Settings</span>
                                                <ChevronUp className="ml-auto" />
                                            </>
                                        )}
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    side="top"
                                    className="w-(--radix-popper-anchor-width)"
                                    align={isCollapsed ? "center" : "start"}
                                >
                                    <DropdownMenuItem onSelect={handleToggleResize}>
                                        <img
                                            src={resizeIcon}
                                            alt="Resize"
                                            className="resize-icon"
                                        />
                                        <span>{isResizable ? "Disable Resize" : "Enable Resize"}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <span>Sidebar Settings</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <span>Application Settings</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>,
                        "Settings"
                    )}

                    {withTooltip(
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton>
                                        <User2 />
                                        {!isCollapsed && (
                                            <>
                                                <span>Username</span>
                                                <ChevronUp className="ml-auto" />
                                            </>
                                        )}
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    side="top"
                                    className="w-(--radix-popper-anchor-width)"
                                    align={isCollapsed ? "center" : "start"}
                                >
                                    <DropdownMenuItem>
                                        <span>Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <span>Account</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <span>Sign out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>,
                        "User Account"
                    )}
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}