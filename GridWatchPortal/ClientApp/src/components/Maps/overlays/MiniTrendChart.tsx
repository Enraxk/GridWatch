/**
 * @file MiniTrendChart.tsx
 * @description React component for displaying a small voltage trend line chart using Recharts.
 *              Generates sample voltage data and displays it in a styled chart container.
 */
import {
    ChartContainer,
    ChartTooltip,
} from "@/components/ui/chart";
import { Line, LineChart } from "recharts";

/**
 * MiniTrendChart component
 *
 * Renders a compact line chart visualizing voltage trends over the past 12 hours.
 * Uses sample data for demonstration. In a real application, replace with actual data fetching.
 *
 * @returns {JSX.Element} The rendered mini trend chart component.
 */
export function MiniTrendChart() {
    // Sample data - in a real app, you would fetch this data
    const labels = Array.from({ length: 12 }, (_, i) => {
        const hours = new Date().getHours() - (11 - i);
        return `${hours < 0 ? hours + 24 : hours}:00`;
    });

    // Random voltage data with slight fluctuations around 230V
    const voltageData = Array.from({ length: 12 }, () =>
        Math.floor(225 + Math.random() * 10)
    );

    // Format data for recharts
    const data = labels.map((label, i) => ({
        time: label,
        value: voltageData[i],
    }));

    // Chart config for styling
    const config = {
        voltage: {
            label: "Voltage",
            color: "hsl(var(--primary))",
        },
    };

    return (
        <ChartContainer config={config} className="h-full">
            <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <Line
                    type="monotone"
                    dataKey="value"
                    name="voltage"
                    strokeWidth={2}
                    activeDot={{ r: 4 }}
                    stroke="var(--color-voltage, hsl(var(--primary)))"
                    fill="var(--color-voltage, hsl(var(--primary) / 0.2))"
                />
                <ChartTooltip />
            </LineChart>
        </ChartContainer>
    );
}