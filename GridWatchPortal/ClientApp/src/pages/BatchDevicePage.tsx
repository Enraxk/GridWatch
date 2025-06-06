import { useRef, useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
import FirmwareUpdateDialog from "@/components/Maintenance/FirmwareUpdateDialog";
import AlarmSettingsDialog from "@/components/Maintenance/AlarmSettingsDialog";
import TelemetrySettingsDialog from "@/components/Maintenance/TelemetrySettingsDialog";


const mockDevices = [
  {
    id: "device-001",
    name: "Pole Unit A",
    firmware: "v1.4.3",
    type: "gw200p",
    certExpiry: "2025-08-10",
    sampleInterval: 300,
    batchSize: 5,
    shortAddress: "12 Elm St, Sector 5",
    details: "Mounted on pole near Sector 5, handles edge telemetry.",
  },
  {
    id: "device-002",
    name: "Substation 4",
    firmware: "v1.5.0",
    type: "gw200G",
    certExpiry: "2026-01-23",
    sampleInterval: 600,
    batchSize: 10,
    shortAddress: "102 Main Rd, Suburban Zone",
    details: "Located in Suburban zone. Provides upstream monitoring.",
  },
  {
    id: "device-003",
    name: "Feeder 21",
    firmware: "v1.3.9",
    type: "gw200p",
    certExpiry: "2025-06-30",
    sampleInterval: 300,
    batchSize: 5,
    shortAddress: "47 Oak Lane, Sector 3",
    details: "Installed mid-feeder, useful for imbalance detection.",
  },
];

export default function BatchDevicePage() {
  const [filter, setFilter] = useState("");
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  // Add state
  const [showFirmwareDialog, setShowFirmwareDialog] = useState(false);
  const [showAlarmDialog, setShowAlarmDialog] = useState(false);
  const [showTelemetryDialog, setShowTelemetryDialog] = useState(false);

  const allSelected = selectedDevices.length === mockDevices.length;
  const isIndeterminate = selectedDevices.length > 0 && !allSelected;
  const selectAllRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const checkbox = selectAllRef.current?.querySelector("input[type='checkbox']");
    if (checkbox instanceof HTMLInputElement) {
      checkbox.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const toggleAll = (checked: boolean) => {
    setSelectedDevices(checked ? mockDevices.map((d) => d.id) : []);
  };

  const toggleDevice = (id: string, checked: boolean) => {
    setSelectedDevices((prev) =>
      checked ? [...prev, id] : prev.filter((d) => d !== id)
    );
  };

  const toggleRow = (id: string) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((row) => row !== id) : [...prev, id]
    );
  };

  const filtered = mockDevices
    .filter((d) => d.name.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) =>
      sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );

  return (
    <div className="p-6 bg-background text-foreground rounded-md shadow-md transition-colors duration-300 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Batch Device Actions</h1>
        <Input
          placeholder="Search devices..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-64"
        />
      </div>

      <div className="border rounded-md p-4 space-y-3 bg-card text-card-foreground transition-colors">
        <label className="flex items-center gap-3 text-sm font-semibold cursor-pointer">
          <Checkbox
            ref={selectAllRef}
            checked={allSelected}
            onCheckedChange={(checked: CheckedState) => toggleAll(!!checked)}
          />
          Select All Devices
        </label>

        {filtered.map((device) => (
          <label
            key={device.id}
            className="flex items-center gap-3 text-sm cursor-pointer"
          >
            <Checkbox
              checked={selectedDevices.includes(device.id)}
              onCheckedChange={(checked: CheckedState) =>
                toggleDevice(device.id, !!checked)
              }
            />
            {device.name}
          </label>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                Choose Action <ChevronDown className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-2">
                <Button
                  className="w-full"
                  variant="ghost"
                  onClick={() => {
                    setSelectedAction("Update Firmware");
                    setShowFirmwareDialog(true);
                  }}
                >
                  Update Firmware
                </Button>
                <Button
                  className="w-full"
                  variant="ghost"
                  onClick={() => {
                    setSelectedAction("Set Alarm");
                    setShowAlarmDialog(true);
                  }}
                >
                  Set Alarm
                </Button>
                <Button className="w-full" variant="ghost" onClick={() => setSelectedAction("Generate CSR")}>
                  Generate CSR
                </Button>
                <Button
                  className="w-full"
                  variant="ghost"
                  onClick={() => {
                    setSelectedAction("Telemetry Settings");
                    setShowTelemetryDialog(true);
                  }}
                >
                  Telemetry Settings
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {selectedAction && (
            <span className="text-sm text-muted-foreground">
              Selected:{" "}
              <span className="font-medium text-foreground">
                {selectedAction}
              </span>
            </span>
          )}
        </div>

        <Button disabled={selectedDevices.length === 0 || !selectedAction}>
          Run {selectedAction || "Action"} on {selectedDevices.length} Device
          {selectedDevices.length !== 1 && "s"}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full mt-6 border text-sm text-left">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => setSortAsc(!sortAsc)}
              >
                Name{" "}
                {sortAsc ? (
                  <ChevronUp className="inline w-4" />
                ) : (
                  <ChevronDown className="inline w-4" />
                )}
              </th>
              <th className="px-4 py-2">Firmware</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Cert Expiry</th>
              <th className="px-4 py-2">Interval (s)</th>
              <th className="px-4 py-2">Batch Size</th>
              <th className="px-4 py-2">Address</th>
              <th className="px-4 py-2">More</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((device) => (
              <>
                <tr
                  key={device.id}
                  className="border-t hover:bg-accent transition-colors"
                >
                  <td className="px-4 py-2 font-medium">{device.name}</td>
                  <td className="px-4 py-2">{device.firmware}</td>
                  <td className="px-4 py-2">{device.type}</td>
                  <td className="px-4 py-2">{device.certExpiry}</td>
                  <td className="px-4 py-2">{device.sampleInterval}</td>
                  <td className="px-4 py-2">{device.batchSize}</td>
                  <td className="px-4 py-2">{device.shortAddress}</td>
                  <td className="px-4 py-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleRow(device.id)}
                      className="flex items-center gap-1"
                    >
                      {expandedRows.includes(device.id) ? "Hide" : "Show"}
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${expandedRows.includes(device.id)
                            ? "rotate-90"
                            : "rotate-0"
                          }`}
                      />
                    </Button>
                  </td>
                </tr>
                {expandedRows.includes(device.id) && (
                  <tr className="bg-muted text-muted-foreground">
                    <td colSpan={8} className="px-4 py-2 italic">
                      {device.details}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Firmware Update Dialog */}
      <FirmwareUpdateDialog
        open={showFirmwareDialog}
        onClose={() => setShowFirmwareDialog(false)}
        onComplete={(filePath) => {
          console.log("Selected firmware file path:", filePath);
          console.log("Devices to update:", selectedDevices);
        }}
        batchMode={true}
      />

      {/* Alarm Settings Dialog */}
      <AlarmSettingsDialog
        open={showAlarmDialog}
        onClose={() => setShowAlarmDialog(false)}
        onComplete={(settings) => {
          console.log("Selected alarm settings:", settings);
          console.log("Apply to devices:", selectedDevices);
        }}
        batchMode={true}
      />
      <TelemetrySettingsDialog
        open={showTelemetryDialog}
        onClose={() => setShowTelemetryDialog(false)}
        onComplete={(settings) => {
          console.log("Selected telemetry settings:", settings);
          console.log("Apply to devices:", selectedDevices);
        }}
        batchMode={true}
      />
    </div>
  );
}
