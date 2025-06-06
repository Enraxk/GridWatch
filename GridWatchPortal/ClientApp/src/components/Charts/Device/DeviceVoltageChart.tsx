"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Legend } from "recharts"
import { useMsal } from "@azure/msal-react"
import { getScopes } from "@/services/authService"
import { getConnectedDevices, getSubstationVoltages } from "@/services/GridWatchService"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

// Define data structure for voltage readings
interface VoltageReading {
    timestamp: string;
    phase1: number;
    phase2: number;
    phase3: number;
    deviceId: string;
}

interface DeviceVoltageChartProps {
    className?: string;
}

export function DeviceVoltageChart({ className }: DeviceVoltageChartProps) {
    const { instance } = useMsal();
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [devices, setDevices] = React.useState<any[]>([]);
    const [voltageData, setVoltageData] = React.useState<VoltageReading[]>([]);
    const [activeDeviceId, setActiveDeviceId] = React.useState<string>("");

    // Create chart configuration dynamically based on connected devices
    const [chartConfig, setChartConfig] = React.useState<ChartConfig>({
        phase1: {
            label: "Phase 1",
            color: "hsl(var(--chart-1))"
        },
        phase2: {
            label: "Phase 2",
            color: "hsl(var(--chart-2))"
        },
        phase3: {
            label: "Phase 3",
            color: "hsl(var(--chart-3))"
        }
    });

    // Calculate average voltage per phase per device
    const deviceStats = React.useMemo(() => {
        const stats: Record<string, {phase1: number, phase2: number, phase3: number}> = {};

        if (!devices.length) return stats;

        devices.forEach(device => {
            const deviceReadings = voltageData.filter(reading => reading.deviceId === device.deviceId);
            if (deviceReadings.length > 0) {
                const total1 = deviceReadings.reduce((sum, reading) => sum + reading.phase1, 0);
                const total2 = deviceReadings.reduce((sum, reading) => sum + reading.phase2, 0);
                const total3 = deviceReadings.reduce((sum, reading) => sum + reading.phase3, 0);
                stats[device.deviceId] = {
                    phase1: parseFloat((total1 / deviceReadings.length).toFixed(1)),
                    phase2: parseFloat((total2 / deviceReadings.length).toFixed(1)),
                    phase3: parseFloat((total3 / deviceReadings.length).toFixed(1))
                };
            } else {
                stats[device.deviceId] = { phase1: 0, phase2: 0, phase3: 0 };
            }
        });

        return stats;
    }, [voltageData, devices]);

    // Function to fetch voltage data for devices using GridWatchService
    const fetchVoltageData = async (devices: any[]) => {
        try {
            // Get time range (from start of day until now)
            const now = new Date();
            const startOfDay = new Date();
            startOfDay.setUTCHours(0, 0, 0, 0);
            const startTime = startOfDay.toISOString();
            const endTime = now.toISOString();

            // Collect all voltage data from all devices
            const allVoltageData: VoltageReading[] = [];
            const voltagesByTimestamp: Record<string, any> = {};

            for (const device of devices) {
                const substationId = device.deviceId;

                try {
                    // Use our GridWatchService function instead of direct fetch
                    const voltages = await getSubstationVoltages(substationId, startTime, endTime);
                    console.log(`Voltage data for ${substationId}:`, voltages);

                    if (!voltages || voltages.length === 0) {
                        console.warn(`No voltage data available for device ${substationId}`);
                        continue;
                    }

                    // Process each reading and organize by timestamp
                    voltages.forEach((v: any) => {
                        const timestamp = v.timestamp || v.Timestamp;
                        const phase1 = v.phase1 || v.Phase1 || v.voltageA || v.phase_a || v.PhaseA || v.value || v.Value || 0;
                        const phase2 = v.phase2 || v.Phase2 || v.voltageB || v.phase_b || v.PhaseB || (v.value ? v.value * 0.98 : 0);
                        const phase3 = v.phase3 || v.Phase3 || v.voltageC || v.phase_c || v.PhaseC || (v.value ? v.value * 1.02 : 0);

                        if (!voltagesByTimestamp[timestamp]) {
                            voltagesByTimestamp[timestamp] = {
                                timestamp,
                                phase1,
                                phase2,
                                phase3,
                                deviceId: substationId
                            };
                        }
                    });
                } catch (error) {
                    console.error(`Error fetching voltage data for device ${substationId}:`, error);
                }
            }

            // Convert to array and sort by timestamp
            for (const timestamp in voltagesByTimestamp) {
                allVoltageData.push(voltagesByTimestamp[timestamp]);
            }

            allVoltageData.sort((a, b) =>
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );

            setVoltageData(allVoltageData);

        } catch (error) {
            console.error("Error fetching voltage data:", error);
            setError((error as Error).message);
        }
    };

    // Function to fetch connected devices
    const fetchDevices = React.useCallback(async () => {
        try {
            setLoading(true);

            // Use the GridWatchService to fetch connected devices
            const deviceData = await getConnectedDevices();
            console.log("Connected Devices:", deviceData);

            setDevices(deviceData);

            // Set first device as active by default
            if (deviceData.length > 0 && !activeDeviceId) {
                setActiveDeviceId(deviceData[0].deviceId);
            }

            // Fetch voltage data for each device
            if (deviceData.length > 0) {
                await fetchVoltageData(deviceData);
            }
        } catch (error) {
            console.error("Error fetching devices:", error);
            setError((error as Error).message);
        } finally {
            setLoading(false);
        }
    }, [instance, activeDeviceId]);

    // Fetch data on component mount
    React.useEffect(() => {
        fetchDevices();

        // Set up refresh interval (every 5 minutes)
        const intervalId = setInterval(() => {
            fetchDevices();
        }, 5 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, [fetchDevices]);

    // Filter data for the active device
    const activeDeviceData = React.useMemo(() => {
        if (!activeDeviceId) return [];
        return voltageData.filter(reading => reading.deviceId === activeDeviceId);
    }, [voltageData, activeDeviceId]);

    if (error) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle>Device Voltage Chart</CardTitle>
                    <CardDescription>Error: {error}</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                    <CardTitle>Device Voltage Chart</CardTitle>
                    <CardDescription>
                        Showing 3-phase voltage readings from today
                    </CardDescription>
                </div>
                <div className="flex flex-wrap">
                    {devices.map((device) => (
                        <button
                            key={device.deviceId}
                            data-active={activeDeviceId === device.deviceId}
                            className="flex flex-1 flex-col justify-center gap-1 border-t px-4 py-3 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-6 sm:py-6"
                            onClick={() => setActiveDeviceId(device.deviceId)}
                        >
                            <span className="text-xs text-muted-foreground">
                                {device.coordinates?.name || device.deviceId.substring(0, 8)}
                            </span>
                            <div className="text-md font-semibold leading-none sm:text-lg">
                                <div>1: {deviceStats[device.deviceId]?.phase1 ? `${deviceStats[device.deviceId].phase1} V` : 'N/A'}</div>
                                <div>2: {deviceStats[device.deviceId]?.phase2 ? `${deviceStats[device.deviceId].phase2} V` : 'N/A'}</div>
                                <div>3: {deviceStats[device.deviceId]?.phase3 ? `${deviceStats[device.deviceId].phase3} V` : 'N/A'}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
                {loading ? (
                    <div className="flex h-[250px] items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
                    </div>
                ) : activeDeviceData.length > 0 ? (
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[250px] w-full"
                    >
                        <LineChart
                            accessibilityLayer
                            data={activeDeviceData}
                            margin={{
                                left: 20,
                                right: 20,
                                top: 10,
                                bottom: 10,
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="timestamp"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                                tickFormatter={(value) => {
                                    const date = new Date(value);
                                    return date.toLocaleTimeString("en-US", {
                                        hour: "numeric",
                                        minute: "numeric",
                                    });
                                }}
                            />
                            <YAxis
                                domain={['auto', 'auto']}
                                tickFormatter={(value) => `${value}V`}
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        className="w-[180px]"
                                        labelFormatter={(value) => {
                                            return new Date(value).toLocaleString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                hour: "numeric",
                                                minute: "numeric",
                                            });
                                        }}
                                    />
                                }
                            />
                            <Line
                                dataKey="phase1"
                                type="monotone"
                                stroke="#ff0000"  // Red for phase 1
                                strokeWidth={2}
                                dot={false}
                                name="Phase 1"
                            />
                            <Line
                                dataKey="phase2"
                                type="monotone"
                                stroke="#0000ff"  // Blue for phase 2
                                strokeWidth={2}
                                dot={false}
                                name="Phase 2"
                            />
                            <Line
                                dataKey="phase3"
                                type="monotone"
                                stroke="#00ff00"  // Green for phase 3
                                strokeWidth={2}
                                dot={false}
                                name="Phase 3"
                            />
                            <Legend />
                        </LineChart>
                    </ChartContainer>
                ) : (
                    <div className="flex h-[250px] items-center justify-center">
                        <p className="text-muted-foreground">No voltage data available for this device</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}