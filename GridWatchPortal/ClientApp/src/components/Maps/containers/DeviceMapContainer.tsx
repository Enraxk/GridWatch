/**
 * @fileoverview
 * DeviceMapContainer is a React component that renders an Azure Map with device markers.
 * It supports dynamic theming, device selection, and marker highlighting.
 * 
 * Technologies: React, TypeScript, Azure Maps Control.
 */

import { useEffect, useRef, useState } from "react";
import * as atlas from "azure-maps-control";
import "azure-maps-control/dist/atlas.min.css";
import { useTheme } from "@/components/theme-provider"; // adjust path if needed

/**
 * Represents a device with location, telemetry, and alarm information.
 */
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

/**
 * Props for DeviceMapContainer.
 */
interface Props {
  devices: Device[];
  azureMapsKey: string;
  onSelectDevice: (device: Device) => void;
}

/**
 * DeviceMapContainer renders an Azure Map with device markers.
 * Markers are interactive and reflect the current theme and selection state.
 * 
 * @param {Props} props - The component props.
 * @returns {JSX.Element} The rendered map container.
 */
export default function DeviceMapContainer({ devices, azureMapsKey, onSelectDevice }: Props) {
  // Reference to the Azure Map instance
  const mapRef = useRef<atlas.Map | null>(null);
  // Reference to the map container div
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  // Reference to the map markers
  const markersRef = useRef<Map<string, atlas.HtmlMarker>>(new Map());
  // State for the currently selected device ID
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Theme context
  const { theme } = useTheme();

  /**
   * Initializes the Azure Map and adds device markers.
   * Cleans up on unmount.
   */
  useEffect(() => {
    if (mapRef.current) return;

    const resolvedStyle =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "night"
          : "road"
        : theme === "dark"
        ? "night"
        : "road";

    const map = new atlas.Map(mapDivRef.current, {
      center: [-6.26, 53.349],
      zoom: 10,
      style: resolvedStyle,
      view: "Auto",
      authOptions: {
        authType: atlas.AuthenticationType.subscriptionKey,
        subscriptionKey: azureMapsKey,
      },
    });

    map.events.add("ready", () => {
      map.controls.add([new atlas.control.ZoomControl()], {
        position: atlas.ControlPosition.TopRight,
      });

      devices.forEach((device) => {
        const marker = createMarker(device, false);
        map.markers.add(marker);
        markersRef.current.set(device.id, marker);
      });
    });

    mapRef.current = map;

    return () => {
      map.dispose();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, [azureMapsKey, devices]);

  /**
   * Updates the map style when the theme changes.
   */
useEffect(() => {
  if (!mapRef.current) return;

  const resolvedStyle =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "night"
        : "road"
      : theme === "dark"
      ? "night"
      : "road";

  mapRef.current.setStyle({ style: resolvedStyle });
}, [theme]);

  /**
   * Updates marker colors based on the selected device.
   */
  useEffect(() => {
    markersRef.current.forEach((marker, deviceId) => {
      const el = marker.getOptions().htmlContent as HTMLElement;
      el.style.backgroundColor = deviceId === selectedId ? "green" : "blue";
    });
  }, [selectedId]);

  /**
   * Creates a marker element for a device.
   * 
   * @param {Device} device - The device to create a marker for.
   * @param {boolean} isSelected - Whether the marker is selected.
   * @returns {atlas.HtmlMarker} The created marker.
   */
  const createMarker = (device: Device, isSelected: boolean) => {
    const el = document.createElement("div");
    el.className = "marker-circle";
    el.style.width = "16px";
    el.style.height = "16px";
    el.style.borderRadius = "50%";
    el.style.backgroundColor = isSelected ? "green" : "blue";
    el.style.border = "2px solid white";
    el.style.boxShadow = "0 0 4px rgba(0,0,0,0.4)";
    el.style.cursor = "pointer";

    el.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedId(device.id);
      onSelectDevice(device);
    });

    return new atlas.HtmlMarker({
      position: device.coordinates,
      htmlContent: el,
    });
  };

  return (
    <div className="relative rounded-md border overflow-hidden" style={{ height: "600px" }}>
      <div ref={mapDivRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}