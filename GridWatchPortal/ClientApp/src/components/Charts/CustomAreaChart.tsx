"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";

const customChartData = [
    { month: "January", desktop: 120, mobile: 60 },
    { month: "February", desktop: 210, mobile: 90 },
    { month: "March", desktop: 180, mobile: 70 },
    { month: "April", desktop: 240, mobile: 100 },
    { month: "May", desktop: 200, mobile: 80 },
    { month: "June", desktop: 220, mobile: 110 },
];

const customChartConfig = {
    desktop: {
        label: "Desktop",
     color: "#2563eb",
    },
    mobile: {
        label: "Mobile",
        color: "#60a5fa",
    },
} satisfies ChartConfig;

export function CustomAreaChart() {
    return (
        <ChartContainer config={customChartConfig} className="min-h-[200px] w-full">
            <AreaChart accessibilityLayer data={customChartData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)} />
                <YAxis />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Area dataKey="mobile" type="natural" fill="var(--color-mobile)" fillOpacity={0.4} stroke="var(--color-mobile)" stackId="a" />
                <Area dataKey="desktop" type="natural" fill="var(--color-desktop)" fillOpacity={0.4} stroke="var(--color-desktop)" stackId="a" />
            </AreaChart>
        </ChartContainer>
    );
}