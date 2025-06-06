import { useEffect, useState } from "react";
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

export interface AlarmSettings {
  overVoltageEnabled?: boolean;
  overVoltage?: number;
  underVoltageEnabled?: boolean;
  underVoltage?: number;
  overCurrentEnabled?: boolean;
  overCurrent?: number;
  underCurrentEnabled?: boolean;
  underCurrent?: number;
}

export interface AlarmSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete: (settings: AlarmSettings) => void;
  deviceId?: string;
  batchMode?: boolean;
  initialValues?: AlarmSettings;
}

// Keys for threshold and enabled settings
const thresholdKeys = ["overVoltage", "underVoltage", "overCurrent", "underCurrent"] as const;
const enabledKeys = [
  "overVoltageEnabled",
  "underVoltageEnabled",
  "overCurrentEnabled",
  "underCurrentEnabled",
] as const;

type ThresholdKey = typeof thresholdKeys[number];
type EnabledKey = typeof enabledKeys[number];

export default function AlarmSettingsDialog({
  open,
  onClose,
  onComplete,
  deviceId,
  batchMode = false,
  initialValues = {},
}: AlarmSettingsDialogProps) {
  const { theme } = useTheme();
  const logoSrc = theme === "light" ? gridwatchLogoLight : gridwatchLogoDark;

  const [form, setForm] = useState<AlarmSettings>({});
  const [enabled, setEnabled] = useState<Record<EnabledKey, boolean>>({
    overVoltageEnabled: false,
    underVoltageEnabled: false,
    overCurrentEnabled: false,
    underCurrentEnabled: false,
  });

  useEffect(() => {
    if (open) {
      const newForm: AlarmSettings = {};
      const newEnabled: Record<EnabledKey, boolean> = {
        overVoltageEnabled: false,
        underVoltageEnabled: false,
        overCurrentEnabled: false,
        underCurrentEnabled: false,
      };

      for (const key of thresholdKeys) {
        const enabledKey = `${key}Enabled` as EnabledKey;
        if (initialValues[enabledKey]) {
          newEnabled[enabledKey] = true;
          newForm[key] = initialValues[key];
        }
      }

      setForm(newForm);
      setEnabled(newEnabled);
    }
  }, [open, initialValues]);

  const handleSubmit = () => {
    const result: AlarmSettings = {};
    for (const key of thresholdKeys) {
      const enabledKey = `${key}Enabled` as EnabledKey;
      result[enabledKey] = enabled[enabledKey];
      if (enabled[enabledKey] && form[key] !== undefined) {
        result[key] = form[key];
      }
    }
    onComplete(result);
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
            Alarm Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {thresholdKeys.map((key) => {
            const enabledKey = `${key}Enabled` as EnabledKey;
            const label =
              key === "overVoltage"
                ? "Overvoltage"
                : key === "underVoltage"
                ? "Undervoltage"
                : key === "overCurrent"
                ? "Overcurrent"
                : "Undercurrent";

            return (
              <div key={key} className="flex items-center gap-4">
                <Checkbox
                  checked={enabled[enabledKey]}
                  onCheckedChange={(checked) =>
                    setEnabled((prev) => ({
                      ...prev,
                      [enabledKey]: checked === true,
                    }))
                  }
                />
                <label className="text-sm text-muted-foreground w-32">
                  {label}
                </label>
                <Input
                  type="number"
                  disabled={!enabled[enabledKey]}
                  value={form[key] ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      [key]: Number(e.target.value),
                    }))
                  }
                  className="w-24"
                />
              </div>
            );
          })}
        </div>

        <DialogFooter className="pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {batchMode ? "Confirm Settings" : "Apply to Device"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
