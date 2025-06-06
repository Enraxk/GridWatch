"use client";

import { Pie, PieChart, Label, Cell } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const pieChartData = [
    { browser: "Chrome", visitors: 400 },
    { browser: "Firefox", visitors: 300 },
    { browser: "Safari", visitors: 300 },
    { browser: "Edge", visitors: 200 },
    { browser: "Opera", visitors: 100 },
    { browser: "Other", visitors: 50 },
];

const pieChartConfig = {
    visitors: {
        label: "Visitors",
        color: "#34d399",
    },
    browsers: {
        label: "Browsers",
        color: "#2563eb",
    },
} satisfies ChartConfig;

const totalVisitors = pieChartData.reduce((acc, data) => acc + data.visitors, 0);

const COLORS = ["#34d399", "#60a5fa", "#f87171", "#fbbf24", "#a78bfa", "#9ca3af"];

export function CustomPieChart() {
    return (
        <ChartContainer config={pieChartConfig} className="mx-auto aspect-square max-h-[250px]">
            <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie data={pieChartData} dataKey="visitors" nameKey="browser" innerRadius={60} strokeWidth={5}>
                    {pieChartData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    <Label
                        content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                return (
                                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                                            {totalVisitors.toLocaleString()}
                                        </tspan>
                                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                                            Visitors
                                        </tspan>
                                    </text>
                                );
                            }
                        }}
                    />
                </Pie>
            </PieChart>
        </ChartContainer>
    );
}