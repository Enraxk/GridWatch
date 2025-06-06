/**
 * @fileoverview
 * GraphMapContainer is a React component that renders an interactive Azure Map with device markers.
 * It supports device selection via marker clicks or drag-rectangle selection mode.
 * The map persists zoom and center state, and adapts to theme changes.
 * 
 * Technologies: React, TypeScript, Azure Maps, custom hooks, and UI components.
 */

import { useEffect, useRef, useState } from "react";
import * as atlas from "azure-maps-control";
import "azure-maps-control/dist/atlas.min.css";
import type { DeviceLocationDto } from "@/types/devicelocationdto";
import { useTheme } from "@/components/theme-provider";
import { useConfig } from "@/hooks/useConfig";
import DragRectangleOverlay from "@/components/Maps/overlays/DragRectangleOverlay";
import { Button } from "@/components/ui/button";

type Props = {
  /** List of device locations to display as markers */
  devices: DeviceLocationDto[];
  /** Callback when the selection of devices changes */
  onSelectionChange: (selected: DeviceLocationDto[]) => void;
};

/**
 * GraphMapContainer renders an Azure Map with device markers and selection features.
 * @param devices List of device locations to display
 * @param onSelectionChange Callback for when selected devices change
 */
export default function GraphMapContainer({ devices, onSelectionChange }: Props) {
  // References for map, map div, and marker management
  const mapRef = useRef<atlas.Map | null>(null);
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<Map<string, atlas.HtmlMarker>>(new Map());

  // State for selected device IDs and selection mode
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);

  // Timer and suppression refs for selection mode
  const altTimerRef = useRef<NodeJS.Timeout | null>(null);
  const suppressRef = useRef(false);

  // Theme and config hooks
  const { theme } = useTheme();
  const { config, loading: configLoading } = useConfig();

  /**
   * Initializes the Azure Map and adds device markers.
   * Cleans up on unmount.
   */
  useEffect(() => {
    if (configLoading || !config || mapRef.current) return;

    const subscriptionKey = config.azureMapsKey || import.meta.env.VITE_AZURE_MAP_KEY;

    const resolvedStyle =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "night"
          : "road"
        : theme === "dark"
        ? "night"
        : "road";

    const map = new atlas.Map(mapDivRef.current!, {
      center: JSON.parse(localStorage.getItem("mapCenter") || "[-6.26, 53.34]"),
      zoom: Number(localStorage.getItem("mapZoom") || 7),
      view: "Auto",
      style: resolvedStyle,
      authOptions: {
        authType: atlas.AuthenticationType.subscriptionKey,
        subscriptionKey,
      },
    });

    map.events.add("ready", () => {
      map.controls.add([new atlas.control.ZoomControl()], {
        position: atlas.ControlPosition.TopRight,
      });

      devices.forEach((device) => {
        if (!markersRef.current.has(device.deviceId)) {
          const marker = createMarker(device, selectedIds.has(device.deviceId));
          map.markers.add(marker);
          markersRef.current.set(device.deviceId, marker);
        }
      });
    });

    map.events.add("moveend", () => {
      const center = map.getCamera().center;
      const zoom = map.getCamera().zoom;
      localStorage.setItem("mapCenter", JSON.stringify(center));
      localStorage.setItem("mapZoom", String(zoom));
    });

    mapRef.current = map;

    return () => {
      map.dispose();
      markersRef.current.clear();
      mapRef.current = null;
    };
  }, [configLoading, config, theme, devices]);

  /**
   * Updates marker colors based on selection and notifies parent of selection changes.
   */
  useEffect(() => {
    markersRef.current.forEach((marker, deviceId) => {
      const el = marker.getOptions().htmlContent as HTMLElement;
      if (el) {
        el.style.backgroundColor = selectedIds.has(deviceId) ? "green" : "blue";
      }
    });

    if (!suppressRef.current) {
      const selectedDevices = devices.filter((d) => selectedIds.has(d.deviceId));
      onSelectionChange(selectedDevices);
    }
  }, [selectedIds]);

  /**
   * Creates a marker for a device with click-to-select behavior.
   * @param device Device location data
   * @param isSelected Whether the device is currently selected
   * @returns HtmlMarker instance
   */
  const createMarker = (device: DeviceLocationDto, isSelected: boolean) => {
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

  setSelectedIds((prev) => {
    const next = new Set(prev);
    if (next.has(device.deviceId)) {
      next.delete(device.deviceId);
    } else {
      next.add(device.deviceId);
    }

    // Call this *after* state is updated
    const selectedDevices = devices.filter((d) => next.has(d.deviceId));
    onSelectionChange(selectedDevices);

    return next;
  });
});

    return new atlas.HtmlMarker({
      position: [device.lon, device.lat],
      htmlContent: el,
    });
  };

  /**
   * Handles keyboard events for activating selection mode and exiting it.
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && !altTimerRef.current) {
        altTimerRef.current = setTimeout(() => setSelectMode(true), 2000);
      }
      if (e.key === "Escape") {
        setSelectMode(false);
        clearTimeout(altTimerRef.current!);
        altTimerRef.current = null;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Alt") {
        clearTimeout(altTimerRef.current!);
        altTimerRef.current = null;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  /**
   * Checks if a device is inside the given bounding box.
   * @param device Device location data
   * @param bounds Bounding box [west, south, east, north]
   * @returns True if device is inside bounds
   */
  function isInsideBounds(device: DeviceLocationDto, bounds: atlas.data.BoundingBox): boolean {
    const [west, south, east, north] = bounds;
    if (typeof device.lat !== "number" || typeof device.lon !== "number") return false;
    return device.lat >= south - 0.0001 && device.lat <= north + 0.0001 &&
           device.lon >= west - 0.0001 && device.lon <= east + 0.0001;
  }

  /**
   * Handles selection of devices within a bounding box.
   * @param bounds Selected bounding box
   */
  function handleBoundsSelected(bounds: atlas.data.BoundingBox) {
    const cleanedDevices = devices.filter(d => typeof d.lat === 'number' && typeof d.lon === 'number');
    const selected = cleanedDevices.filter((d) => isInsideBounds(d, bounds));
    const notSelected = cleanedDevices.filter((d) => !isInsideBounds(d, bounds));

    console.log("📐 Top-left (NW):", [bounds[0], bounds[3]]);
    console.log("📐 Bottom-right (SE):", [bounds[2], bounds[1]]);
    console.log("📦 Bounds: ", { west: bounds[0], south: bounds[1], east: bounds[2], north: bounds[3] });
    console.log("✅ Selected:", selected.map((d) => d.deviceId));
    console.log("❌ Not selected:", notSelected.map((d) => ({
      id: d.deviceId,
      lat: d.lat,
      lon: d.lon,
      inBounds: isInsideBounds(d, bounds),
    })));
    console.log("🇮🇪 Expected Ireland Bounds:", {
      west: -10.5,
      south: 51.3,
      east: -5.3,
      north: 55.4
    });

    const selectedIdsSet = new Set(selected.map((d) => d.deviceId));
    setSelectedIds((prev) => new Set([...prev, ...selectedIdsSet]));
    setSelectMode(false);
  }

  /**
   * Clears all selected devices.
   */
  const handleClearSelection = () => {
    console.log("🧹 Clearing all selected devices");
    setSelectedIds(new Set());
  };

  // --- Render ---

  return (
    <div className="relative rounded-md border overflow-hidden" style={{ height: "400px" }}>
      <div ref={mapDivRef} style={{ width: "100%", height: "100%" }} />

      {mapRef.current && selectMode && (
        <>
          <DragRectangleOverlay map={mapRef.current} onBoundsSelected={handleBoundsSelected} />
          <div className="absolute inset-0 bg-gray-500/20 flex items-start justify-center pt-4 z-50 pointer-events-none">
            <div className="bg-white text-black px-4 py-2 rounded shadow pointer-events-auto">
              Selection mode active. Drag to select devices. Press <strong>Escape</strong> to exit.
            </div>
          </div>
        </>
      )}

      {!selectMode && selectedIds.size > 0 && (
        <div className="absolute top-2 left-2 z-50">
          <Button size="sm" variant="outline" onClick={handleClearSelection}>
            Deselect All ({selectedIds.size})
          </Button>
        </div>
      )}

      {!selectMode && selectedIds.size === 0 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 text-black text-sm px-3 py-1 rounded shadow">
          Hold <strong>Alt</strong> for 2 seconds to activate selection mode
        </div>
      )}
    </div>
  );
}
/*WORKING VERSION */
/*WORKING VERSION */