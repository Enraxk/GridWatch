import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/theme-provider"
import gridwatchLogoDark from "@/assets/gridwatch_logo_dark.png";
import gridwatchLogoLight from "@/assets/gridwatch_logo_light.png";
import Image from "next/image";

export interface FirmwareUpdateDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete: (filePath: string) => void;
  deviceId?: string;
  batchMode?: boolean;
}

export default function FirmwareUpdateDialog({
  open,
  onClose,
  onComplete,
  deviceId,
  batchMode = false,
}: FirmwareUpdateDialogProps) {
  const [filePath, setFilePath] = useState<string>("");
  const { theme } = useTheme();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFilePath(file.name);
    }
  };

  const handleUpdate = () => {
    if (filePath) {
      onComplete(filePath);
      onClose();
    }
  };

  const logoSrc =
    theme === "light" ? gridwatchLogoLight : gridwatchLogoDark;

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
            Firmware Update
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <label className="text-sm font-medium text-muted-foreground">
            Select Firmware File (.bin)
          </label>
          <Input type="file" accept=".bin" onChange={handleFileChange} />

          {filePath && (
            <div className="text-sm text-muted-foreground italic">
              Selected:{" "}
              <span className="font-semibold text-foreground">{filePath}</span>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!filePath}
            onClick={handleUpdate}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {batchMode ? "Confirm Selection" : "Update Firmware"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
