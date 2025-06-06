
import { useEffect, useState } from 'react';
import GridLayout from 'react-grid-layout';
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

const LAYOUT_STORAGE_KEY = "dynamic_dashboard_grid_layout";

export function DynamicDashboard({ isResizable }: { isResizable: boolean }) {
    const { state: sidebarState } = useSidebar();
    const [layout, setLayout] = useState(() => {
        const savedLayout = localStorage.getItem(LAYOUT_STORAGE_KEY);
        return savedLayout ? JSON.parse(savedLayout) : [
            { i: 'azureMap', x: 0, y: 0, w: 3, h: 13 },
            { i: 'areaChart', x: 3, y: 0, w: 3, h: 14 },
            { i: 'customAreaChart', x: 0, y: 2, w: 2, h: 9 },
            { i: 'customPieChart', x: 2, y: 2, w: 2, h: 11 },
            { i: 'card5', x: 4, y: 2, w: 1, h: 2 },
            { i: 'card6', x: 5, y: 2, w: 1, h: 2 },
            { i: 'card7', x: 0, y: 4, w: 2, h: 2 },
            { i: 'card8', x: 2, y: 4, w: 2, h: 2 },
            { i: 'card9', x: 4, y: 4, w: 3, h: 2 },
            { i: 'card10', x: 0, y: 6, w: 3, h: 2 },
        ];
    });

    const [isDraggable] = useState(true);

    useEffect(() => {
        localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout));
    }, [layout]);

    const gridWidth = sidebarState === "expanded" ? 1310 : 1450;

    return (
        <GridLayout
            className="layout"
            layout={layout}
            cols={6}
            rowHeight={30}
            width={gridWidth}
            isResizable={isResizable}
            isDraggable={isDraggable}
            resizeHandles={isResizable ? ['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne'] : []}
            draggableHandle=".move-icon"
            onLayoutChange={(newLayout) => setLayout(newLayout)}
        >
            <GridCard key="azureMap" cardId="azureMap" layout={layout} setLayout={setLayout}>
                <GridCardHeader>
                    <GridCardTitle className="text-center">AzureMap Integration Card</GridCardTitle>
                </GridCardHeader>
                <GridCardContent className="h-full">
                    <AzureMapCard aspectRatio={"16 / 9"} />
                </GridCardContent>
                <GridCardFooter />
            </GridCard>
            <GridCard key="areaChart" cardId="areaChart" layout={layout} setLayout={setLayout}>
                <GridCardHeader>
                    <GridCardTitle>Area Chart</GridCardTitle>
                    <GridCardDescription>Showing total visitors for the last 6 months</GridCardDescription>
                </GridCardHeader>
                <GridCardContent>
                    <BaseChart />
                </GridCardContent>
                <GridCardFooter>
                    <div className="flex w-full items-start gap-2 text-sm">
                        <div className="grid gap-2">
                            <div className="flex items-center gap-2 font-medium leading-none">
                                Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                            </div>
                            <div className="flex items-center gap-2 leading-none text-muted-foreground">
                                January - June 2024
                            </div>
                        </div>
                    </div>
                </GridCardFooter>
            </GridCard>
            <GridCard key="customAreaChart" cardId="customAreaChart" layout={layout} setLayout={setLayout}>
                <GridCardHeader>
                    <GridCardTitle>Custom Area Chart</GridCardTitle>
                </GridCardHeader>
                <GridCardContent>
                    <CustomAreaChart />
                </GridCardContent>
                <GridCardFooter />
            </GridCard>
            <GridCard key="customPieChart" cardId="customPieChart" layout={layout} setLayout={setLayout}>
                <GridCardHeader className="pb-0 text-center">
                    <GridCardTitle>Pie Chart - Donut with Text</GridCardTitle>
                    <GridCardDescription>January - June 2024</GridCardDescription>
                </GridCardHeader>
                <GridCardContent className="flex-1 pb-0">
                    <CustomPieChart />
                </GridCardContent>
                <GridCardFooter className="flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2 font-medium leading-none">
                        Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="leading-none text-muted-foreground">
                        Showing total visitors for the last 6 months
                    </div>
                </GridCardFooter>
            </GridCard>
        </GridLayout>
    );
}