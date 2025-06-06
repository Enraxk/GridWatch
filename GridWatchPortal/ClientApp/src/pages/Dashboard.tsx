import * as React from "react";
import { useEffect, useState, useCallback, useMemo, createContext } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import {
    GridCard,
    GridCardHeader,
    GridCardTitle,
    GridCardContent,
    GridCardFooter,
    GridCardDescription
} from "@/components/ui/grid-card";
import { AzureMapCard } from "@/components/Maps/AzureMapCard";
import { BaseChart } from "@/components/Charts/BaseChart.tsx";
import { CustomAreaChart } from "@/components/Charts/CustomAreaChart.tsx";
import { CustomPieChart } from "@/components/Charts/CustomPieChart.tsx";
import { TrendingUp } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { ToolBar } from "@/components/ToolBar.tsx";
import { cn } from "@/lib/utils";
import { DeviceVoltageChart } from "@/components/Charts/Device/DeviceVoltageChart.tsx";

// ResponsiveGridLayout setup
const ResponsiveGridLayout = WidthProvider(Responsive);

// Context for communicating refresh events to card components
export const DashboardContext = createContext({
    refreshCards: () => {}
});

// Constants for localStorage keys
const LAYOUT_STORAGE_KEY = "main_dashboard_grid_layout";
const RESIZABLE_STATE_KEY = "is_resizable";
const SHOW_PIN_BUTTONS_KEY = "show_pin_buttons";

// Default layouts for breakpoints
const DEFAULT_LAYOUTS = {
    lg: [{ i: 'azureMap', x: 0, y: 0, w: 13, h: 13 }],
    md: [{ i: 'azureMap', x: 0, y: 0, w: 10, h: 13 }],
    sm: [{ i: 'azureMap', x: 0, y: 0, w: 6, h: 13 }],
    xs: [{ i: 'azureMap', x: 0, y: 0, w: 4, h: 13 }],
    xxs: [{ i: 'azureMap', x: 0, y: 0, w: 2, h: 13 }],
};

/**
 * Dashboard component
 *
 * Provides a responsive grid layout with draggable and resizable cards.
 * Manages state persistence through localStorage.
 */
export function Dashboard() {
    const { state: sidebarState } = useSidebar();

    // Initialize state from localStorage with lazy initializers
    const [isResizable, setIsResizable] = useState(() =>
        localStorage.getItem(RESIZABLE_STATE_KEY) === "true"
    );

    const [showPinButtons, setShowPinButtons] = useState(() =>
        localStorage.getItem(SHOW_PIN_BUTTONS_KEY) !== "false"
    );

    const [layouts, setLayouts] = useState(() => {
        try {
            const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
            return saved ? JSON.parse(saved) : DEFAULT_LAYOUTS;
        } catch {
            return DEFAULT_LAYOUTS;
        }
    });

    const [isDraggable] = useState(true);

    // Add a function to refresh all card content
    const refreshCards = useCallback(() => {
        console.log("Refreshing all card content...");
        const refreshEvent = new CustomEvent('dashboard-refresh');
        window.dispatchEvent(refreshEvent);
        setLayouts(prev => ({ ...prev }));
    }, []);

    // Create context value
    const dashboardContextValue = useMemo(() => ({
        refreshCards
    }), [refreshCards]);

    // Memoize callbacks for better performance
    const handleLayoutChange = useCallback((currentLayout, allLayouts) => {
        setLayouts(allLayouts);
    }, []);

    // Persist state to localStorage when it changes
    useEffect(() => {
        try {
            localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layouts));
        } catch (error) {
            console.error("Error saving layouts to localStorage:", error);
        }
    }, [layouts]);

    useEffect(() => {
        localStorage.setItem(RESIZABLE_STATE_KEY, isResizable.toString());
    }, [isResizable]);

    useEffect(() => {
        localStorage.setItem(SHOW_PIN_BUTTONS_KEY, showPinButtons.toString());
    }, [showPinButtons]);

    // Calculate grid width based on sidebar state
    const gridWidth = useMemo(() =>
            sidebarState === "expanded" ? 1310 : 1450,
        [sidebarState]
    );

    // Memoize resize handles to avoid recreating the array on each render
    const resizeHandles = useMemo(() =>
            isResizable ? (['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne'] as any) : [],
        [isResizable]
    );

    // Memoize common props for GridCard components
    const gridCardProps = useMemo(() => ({
        layout: layouts.lg, // Use the current layout for the largest breakpoint as default
        setLayout: (l: any) => setLayouts((prev) => ({ ...prev, lg: l })),
        showPinButtons
    }), [layouts, showPinButtons]);

    // Memoize the trend footer content to avoid recreating on each render
    const trendFooterContent = useMemo(() => (
        <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
                <div className="flex items-center gap-2 font-medium leading-none">
                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4"/>
                </div>
                <div className="flex items-center gap-2 leading-none text-muted-foreground">
                    January - June 2024
                </div>
            </div>
        </div>
    ), []);

    // Memoize the detailed trend footer for the pie chart
    const detailedTrendFooter = useMemo(() => (
        <div className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 font-medium leading-none">
                Trending up by 5.2% this month <TrendingUp className="h-4 w-4"/>
            </div>
            <div className="leading-none text-muted-foreground">
                Showing total visitors for the last 6 months
            </div>
        </div>
    ), []);

    // Memoize the simple cards array to avoid recreating on each render
    const simpleCards = useMemo(() =>
            [5, 6, 7, 8, 9, 10].map((num) => (
                <GridCard
                    key={`card${num}`}
                    cardId={`card${num}`}
                    {...gridCardProps}
                >
                    <GridCardTitle>{`Card ${num}`}</GridCardTitle>
                    <GridCardContent>
                        <p>This is the content of the Card {num}.</p>
                    </GridCardContent>
                </GridCard>
            )),
        [gridCardProps]
    );

    return (
        <DashboardContext.Provider value={dashboardContextValue}>
            <div className="flex flex-col">
                <ToolBar
                    isResizable={isResizable}
                    setIsResizable={setIsResizable}
                    showPinButtons={showPinButtons}
                    setShowPinButtons={setShowPinButtons}
                    refreshCards={refreshCards}
                />
                <ResponsiveGridLayout
                    className="layout"
                    layouts={layouts}
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    cols={{ lg: 13, md: 10, sm: 6, xs: 4, xxs: 2 }}
                    rowHeight={30}
                    width={gridWidth}
                    isResizable={isResizable}
                    isDraggable={isDraggable}
                    resizeHandles={resizeHandles}
                    draggableHandle=".move-icon"
                    onLayoutChange={handleLayoutChange}
                >
                    <div key="azureMap">
                        <GridCard cardId="azureMap" {...gridCardProps}>
                            <GridCardTitle className="text-center">AzureMap Integration Card</GridCardTitle>
                            <GridCardContent className="h-full">
                                <AzureMapCard aspectRatio={"16 / 9"}/>
                            </GridCardContent>
                        </GridCard>
                    </div>
                    {/* Render memoized simple cards */}
                    {/*{simpleCards}*/}
                </ResponsiveGridLayout>
            </div>
        </DashboardContext.Provider>
    );
}