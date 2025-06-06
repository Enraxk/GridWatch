import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useTheme } from "@/components/theme-provider";
import gridwatchLogoDark from "@/assets/gridwatch_logo_dark.png";
import gridwatchLogoLight from "@/assets/gridwatch_logo_light.png";

export interface TelemetrySettings {
  sampleInterval: number;
  batchSize: number;
  voltage: boolean;
  current: boolean;
  frequency: boolean;
  harmonics: boolean;
  power: boolean;
}

export interface TelemetrySettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete: (settings: TelemetrySettings) => void;
  batchMode?: boolean;
  initialValues?: TelemetrySettings;
}

const defaultTelemetrySettings: TelemetrySettings = {
  sampleInterval: 300,
  batchSize: 10,
  voltage: false,
  current: false,
  frequency: false,
  harmonics: false,
  power: false,
};

export default function TelemetrySettingsDialog({
  open,
  onClose,
  onComplete,
  batchMode = false,
  initialValues = defaultTelemetrySettings,
}: TelemetrySettingsDialogProps) {
  const [settings, setSettings] = useState<TelemetrySettings>(initialValues);
  const { theme } = useTheme();
  const logoSrc = theme === "light" ? gridwatchLogoLight : gridwatchLogoDark;

  useEffect(() => {
    if (open) {
      setSettings({ ...defaultTelemetrySettings, ...initialValues });
    }
  }, [open, initialValues]);

  const handleChange = (key: keyof TelemetrySettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleConfirm = () => {
    onComplete(settings);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-lg backdrop-blur-sm bg-card/90 border border-border"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="items-center">
          <img
            src={logoSrc}
            alt="GridWatch Logo"
            width={180}
            height={40}
            className="mb-2"
          />
          <DialogTitle className="text-xl text-primary">
            Telemetry Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <label className="text-sm font-medium text-muted-foreground">
            Sample Interval (seconds)
          </label>
          <Input
            type="number"
            min={10}
            value={settings.sampleInterval}
            onChange={(e) =>
              handleChange("sampleInterval", parseInt(e.target.value, 10))
            }
          />

          <label className="text-sm font-medium text-muted-foreground">
            Batch Size
          </label>
          <Input
            type="number"
            min={1}
            value={settings.batchSize}
            onChange={(e) =>
              handleChange("batchSize", parseInt(e.target.value, 10))
            }
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Enable Telemetry Parameters
            </label>
            <div className="grid grid-cols-2 gap-2 text-sm">
{["voltage", "current", "frequency", "harmonics", "power"].map((key) => (
  <div key={key} className="flex items-center space-x-2">
    <Checkbox
      id={`checkbox-${key}`}
      checked={settings[key as keyof TelemetrySettings] as boolean}
      onCheckedChange={(checked) =>
        handleChange(key as keyof TelemetrySettings, !!checked)
      }
    />
    <label htmlFor={`checkbox-${key}`} className="text-sm capitalize">
      {key}
    </label>
  </div>
))}

            </div>
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {batchMode ? "Confirm Settings" : "Update Settings"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
