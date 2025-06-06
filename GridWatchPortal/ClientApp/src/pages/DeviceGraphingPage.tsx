import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";
import { Label } from "@/components/ui/label";
import { getGraphData } from "@/services/GridWatchService";

import AmChartWidget from "@/components/Graphs/AmChartWidget";
import type { GraphSeries } from "@/components/Graphs/GraphWidget";
import GraphMapContainer from "@/components/Maps/GraphMapContainer";
import { DeviceLocationDto } from "@/types/devicelocationdto";

const graphTypes = [
  "Voltage",
  "Current",
  "Power",
  "Frequency",
  "Harmonics",
  "Temperature",
];

export default function DeviceGraphingPage() {
  const simulatedDevices: DeviceLocationDto[] = [
    { deviceId: "device-1", lat: 53.3498, lon: -6.2603 },
    { deviceId: "device-2", lat: 52.668, lon: -8.6305 },
    { deviceId: "device-3", lat: 51.8985, lon: -8.4756 },
    { deviceId: "device-4", lat: 54.5973, lon: -5.9301 },
    { deviceId: "device-5", lat: 53.2707, lon: -9.0568 },
    { deviceId: "device-6", lat: 52.1609, lon: -7.1524 },
    { deviceId: "device-7", lat: 54.2737, lon: -8.4761 },
    { deviceId: "device-8", lat: 53.5215, lon: -6.4297 },
    { deviceId: "device-9", lat: 53.2009, lon: -6.1111 },
    { deviceId: "device-10", lat: 54.0068, lon: -6.404 },
    { deviceId: "device-11", lat: 53.7152, lon: -6.3528 },
    { deviceId: "device-12", lat: 53.2831, lon: -9.0366 },
    { deviceId: "device-13", lat: 52.2624, lon: -7.119 },
    { deviceId: "device-14", lat: 51.9036, lon: -8.4689 },
    { deviceId: "device-15", lat: 52.3342, lon: -6.4576 },
    { deviceId: "device-16", lat: 53.295, lon: -6.138 },
    { deviceId: "device-17", lat: 54.3503, lon: -7.6336 },
    { deviceId: "device-18", lat: 53.7987, lon: -8.999 },
    { deviceId: "device-19", lat: 54.1836, lon: -6.3373 },
    { deviceId: "device-20", lat: 52.5006, lon: -6.5669 },
  ];

  const [selectedGraphs, setSelectedGraphs] = useState<string[]>([]);
  const [scale, setScale] = useState<"day" | "week" | "custom">("day");
  const [groupGraphs, setGroupGraphs] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [graphData, setGraphData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);

  const toggleGraph = (type: string) => {
    setSelectedGraphs((prev) =>
      prev.includes(type) ? prev.filter((g) => g !== type) : [...prev, type]
    );
  };

  const handleVisualize = async () => {
    if (selectedDeviceIds.length === 0) {
      setError("Please select at least one device on the map.");
      return;
    }

    setLoading(true);
    setError(null);
    setGraphData(null);

    try {
      const data = await getGraphData({
        substationId: "demo-substation",
        graphTypes: selectedGraphs,
        groupGraphs,
        multiDeviceMode: selectedDeviceIds.length > 1,
        deviceIds: selectedDeviceIds,
        scale,
        customFrom: scale === "custom" ? customFrom : undefined,
        customTo: scale === "custom" ? customTo : undefined,
      });
      setGraphData(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-background text-foreground">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-md border h-96 col-span-1 md:col-span-2 overflow-hidden">
          <GraphMapContainer
            devices={simulatedDevices}
            onSelectionChange={(selected) => {
              const ids = selected.map((d) => d.deviceId);
              setSelectedDeviceIds([...ids]);
            }}
          />
        </div>

        <div className="rounded-md border p-4 space-y-4 bg-card text-card-foreground">
          <h2 className="font-semibold">Select Graph Type</h2>
          <div className="space-y-2">
            {graphTypes.map((type) => (
              <label
                key={type}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <Checkbox
                  checked={selectedGraphs.includes(type)}
                  onCheckedChange={() => toggleGraph(type)}
                />
                {type}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-md border p-4 bg-card text-card-foreground space-y-4">
        <h3 className="font-semibold">Graph Time Scale</h3>
        <div className="flex gap-2">
          <Button
            variant={scale === "day" ? "default" : "outline"}
            onClick={() => setScale("day")}
          >
            Day
          </Button>
          <Button
            variant={scale === "week" ? "default" : "outline"}
            onClick={() => setScale("week")}
          >
            Week
          </Button>
          <Button
            variant={scale === "custom" ? "default" : "outline"}
            onClick={() => setScale("custom")}
          >
            Custom
          </Button>
        </div>

        {scale === "custom" && (
          <div className="flex gap-4 items-end mt-2">
            <div className="flex flex-col gap-1">
              <Label className="text-sm text-muted-foreground">From</Label>
              <div className="relative">
                <Input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="pr-10"
                />
                <Calendar className="absolute right-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-300" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-sm text-muted-foreground">To</Label>
              <div className="relative">
                <Input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="pr-10"
                />
                <Calendar className="absolute right-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-300" />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 pt-4 flex-wrap">
          <div className="flex items-center space-x-2">
            <Switch
              id="group-graphs"
              checked={groupGraphs}
              onCheckedChange={setGroupGraphs}
            />
            <Label htmlFor="group-graphs">Group Graphs</Label>
          </div>

          <Button
            variant="default"
            className="ml-auto"
            onClick={handleVisualize}
          >
            {loading ? "Loading..." : "Visualize"}
          </Button>
        </div>
      </div>

      {error && <p className="text-destructive font-medium">{error}</p>}

      {graphData && !groupGraphs && (
        <>
          {Object.entries(
            graphData.series.reduce(
              (acc: Record<string, GraphSeries[]>, s: GraphSeries) => {
                const baseType = s.seriesName?.split(" - ")[0] ?? "Unknown";
                if (!acc[baseType]) acc[baseType] = [];
                acc[baseType].push(s);
                return acc;
              },
              {}
            )
          ).map(([type, group]) => (
            <AmChartWidget key={type} title={type} series={group as GraphSeries[]} />
          ))}
        </>
      )}

      {graphData && groupGraphs && (
        <AmChartWidget
          key="grouped"
          title="Grouped Graph"
          series={graphData.series as GraphSeries[]}
        />
      )}
    </div>
  );
}
