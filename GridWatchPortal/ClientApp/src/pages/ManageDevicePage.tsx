import { useEffect, useState } from "react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/hooks/useConfig";
import FirmwareUpdateDialog from "@/components/Maintenance/FirmwareUpdateDialog";
import AlarmSettingsDialog, { AlarmSettings } from "@/components/Maintenance/AlarmSettingsDialog";
import TelemetrySettingsDialog, { TelemetrySettings } from "@/components/Maintenance/TelemetrySettingsDialog";
import DeviceMapContainer from "@/components/Maps/DeviceMapContainer"; // new import

interface Device {
  id: string;
  name: string;
  type: string;
  firmware: string;
  certExpiry: string;
  sampleInterval: number;
  batchSize: number;
  shortAddress: string;
  coordinates: [number, number];
  alarms: {
  overVoltageEnabled?: boolean;
  overVoltage?: number;
  underVoltageEnabled?: boolean;
  underVoltage?: number;
  overCurrentEnabled?: boolean;
  overCurrent?: number;
  underCurrentEnabled?: boolean;
  underCurrent?: number;
  };
  telemetry: {
    sampleInterval: number;
    batchSize: number;
    voltage: boolean;
    current: boolean;
    frequency: boolean;
    harmonics: boolean;
    power: boolean;
  };
}



const mockDevices: Device[] = [
  {
    id: "device-001",
    name: "Pole Unit A",
    type: "gw200p",
    firmware: "v1.4.3",
    certExpiry: "2025-08-10",
    sampleInterval: 300,
    batchSize: 5,
    shortAddress: "12 Elm St, Sector 5",
    coordinates: [-6.2603, 53.3498],
    alarms: {
      overVoltageEnabled: true,
      overVoltage: 250,
      underVoltageEnabled: true,
      underVoltage: 210,
      overCurrentEnabled: true,
      overCurrent: 15,
      underCurrentEnabled: false,
    },
    telemetry: {
      sampleInterval: 300,
      batchSize: 5,
      voltage: true,
      current: true,
      frequency: false,
      harmonics: false,
      power: true
    }
  },
  {
    id: "device-002",
    name: "Substation 4",
    type: "gw200G",
    firmware: "v1.5.0",
    certExpiry: "2026-01-23",
    sampleInterval: 600,
    batchSize: 10,
    shortAddress: "102 Main Rd, Suburban Zone",
    coordinates: [-6.262, 53.3478],
 alarms: {
      overVoltageEnabled: true,
      overVoltage: 250,
      underVoltageEnabled: true,
      underVoltage: 210,
      overCurrentEnabled: true,
      overCurrent: 15,
      underCurrentEnabled: false,
    },
    telemetry: {
      sampleInterval: 600,
      batchSize: 10,
      voltage: true,
      current: false,
      frequency: true,
      harmonics: false,
      power: false
    }
  }
];


export default function ManageDevicePage() {
  const { config, loading: configLoading } = useConfig();
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showFirmwareDialog, setShowFirmwareDialog] = useState(false);
  const [showAlarmDialog, setShowAlarmDialog] = useState(false);
  const [showTelemetryDialog, setShowTelemetryDialog] = useState(false);


  if (configLoading || !config?.azureMapsKey) {
    return <p className="text-muted-foreground p-6">Loading configuration...</p>;
  }

  return (
    <div className="p-6 bg-background text-foreground rounded-md shadow-md transition-colors duration-300 relative">
      <DeviceMapContainer
        devices={mockDevices}
        azureMapsKey={config.azureMapsKey}
        onSelectDevice={(device) => setSelectedDevice(device)}
      />

      {/* Device Info Drawer */}
      {selectedDevice && (
        <Drawer open={true} onClose={() => setSelectedDevice(null)}>
          <DrawerContent className="p-4 space-y-2">
            <h2 className="text-lg font-semibold">{selectedDevice.name}</h2>
            <p><strong>ID:</strong> {selectedDevice.id}</p>
            <p><strong>Type:</strong> {selectedDevice.type}</p>
            <p><strong>Firmware:</strong> {selectedDevice.firmware}</p>
            <p><strong>Cert Expiry:</strong> {selectedDevice.certExpiry}</p>
            <p><strong>Sample Interval:</strong> {selectedDevice.sampleInterval}s</p>
            <p><strong>Batch Size:</strong> {selectedDevice.batchSize}</p>
            <p><strong>Address:</strong> {selectedDevice.shortAddress}</p>

            <div className="pt-4 space-y-2">
              <Button className="w-full" onClick={() => setShowFirmwareDialog(true)}>Update Firmware</Button>
              <Button className="w-full" variant="secondary" onClick={() => setShowAlarmDialog(true)}>Set Alarm</Button>
              <Button className="w-full" variant="secondary" onClick={() => setShowTelemetryDialog(true)}>Telemetry Settings</Button>
                            <Button className="w-full" variant="ghost">
                  Generate CSR
                </Button>
                                          <Button className="w-full" variant="ghost">
                  Reset Wireless Comunication
                </Button>
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {/* Modals */}
      <FirmwareUpdateDialog
        open={showFirmwareDialog}
        onClose={() => setShowFirmwareDialog(false)}
        deviceId={selectedDevice?.id}
        onComplete={(path) => console.log("📦 Firmware:", path, "→", selectedDevice?.id)}
      />

      <AlarmSettingsDialog
        open={showAlarmDialog}
        onClose={() => setShowAlarmDialog(false)}
        initialValues={selectedDevice?.alarms}
        onComplete={(alarm) => console.log("🚨 Alarm:", alarm, "→", selectedDevice?.id)}
      />

      <TelemetrySettingsDialog
        open={showTelemetryDialog}
        onClose={() => setShowTelemetryDialog(false)}
        initialValues={selectedDevice?.telemetry}
        onComplete={(telemetry) => console.log("📊 Telemetry:", telemetry, "→", selectedDevice?.id)}
      />
    </div>
  );
}
