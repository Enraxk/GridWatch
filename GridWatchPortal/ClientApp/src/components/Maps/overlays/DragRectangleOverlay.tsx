/**
 * @fileoverview
 * DragRectangleOverlay is a React component that enables users to draw a draggable rectangle overlay
 * on an Azure Maps map instance. The overlay allows users to select a rectangular area by clicking
 * and dragging on the map. Once the selection is complete, the component calculates the bounding box
 * in map coordinates and invokes the provided callback with the selected bounds.
 *
 * Features:
 * - Renders a transparent, dashed rectangle overlay during drag.
 * - Disables map interactions (drag, zoom) while drawing.
 * - Converts pixel coordinates to map bounding box.
 * - Cleans up event listeners and overlay on unmount.
 *
 * Props:
 * - map: The Azure Maps map instance.
 * - onBoundsSelected: Callback invoked with the selected bounding box.
 */

import { useEffect, useRef } from "react";
import * as atlas from "azure-maps-control";

/**
 * Props for DragRectangleOverlay component.
 */
type DragRectangleOverlayProps = {
  map: atlas.Map;
  onBoundsSelected: (bounds: atlas.data.BoundingBox) => void;
};

/**
 * DragRectangleOverlay React component.
 *
 * Allows users to draw a rectangle on the map by clicking and dragging.
 * Calls onBoundsSelected with the bounding box when selection is complete.
 *
 * @param {DragRectangleOverlayProps} props - The component props.
 * @returns {null} This component does not render any JSX.
 */
export default function DragRectangleOverlay({ map, onBoundsSelected }: DragRectangleOverlayProps) {
  // Reference to the overlay div element.
  const overlayRef = useRef<HTMLDivElement | null>(null);
  // Reference to the drag start position.
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const container = map.getMapContainer();

    // Create the overlay div for the drag rectangle.
    const overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.border = "2px dashed #f00";
    overlay.style.backgroundColor = "rgba(255, 0, 0, 0.1)";
    overlay.style.display = "none";
    overlay.style.zIndex = "1000";
    overlay.style.pointerEvents = "none";
    overlayRef.current = overlay;
    document.body.appendChild(overlay);

    /**
     * Mouse down event handler.
     * Starts the drag operation and shows the overlay.
     */
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      dragStart.current = { x: e.clientX, y: e.clientY };
      Object.assign(overlay.style, {
        left: `${e.clientX}px`,
        top: `${e.clientY}px`,
        width: "0px",
        height: "0px",
        display: "block",
      });

      // Disable map interactions while dragging.
      map.setUserInteraction({
        dragPanInteraction: false,
        dblClickZoomInteraction: false,
        shiftDragZoomInteraction: false,
      });
    };

    /**
     * Mouse move event handler.
     * Updates the overlay rectangle as the mouse moves.
     */
    const onMouseMove = (e: MouseEvent) => {
      if (!dragStart.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      Object.assign(overlay.style, {
        left: `${Math.min(e.clientX, dragStart.current.x)}px`,
        top: `${Math.min(e.clientY, dragStart.current.y)}px`,
        width: `${Math.abs(dx)}px`,
        height: `${Math.abs(dy)}px`,
      });
    };

    /**
     * Mouse up event handler.
     * Finalizes the drag operation, calculates the bounding box, and calls the callback.
     */
    const onMouseUp = (e: MouseEvent) => {
      if (!dragStart.current) return;
      const start = dragStart.current;
      const end = { x: e.clientX, y: e.clientY };
      dragStart.current = null;
      overlay.style.display = "none";

      try {
        const containerRect = container.getBoundingClientRect();

        const offsetMinX = Math.min(start.x, end.x) - containerRect.left;
        const offsetMaxX = Math.max(start.x, end.x) - containerRect.left;
        const offsetMinY = Math.min(start.y, end.y) - containerRect.top;
        const offsetMaxY = Math.max(start.y, end.y) - containerRect.top;

        const [nw, se] = map.pixelsToPositions([
          new atlas.Pixel(offsetMinX, offsetMinY),
          new atlas.Pixel(offsetMaxX, offsetMaxY),
        ]);

        // Bounding box: [west, south, east, north]
        const bounds: atlas.data.BoundingBox = [nw[0], se[1], se[0], nw[1]];

        console.log("📐 Corrected NW:", nw, "SE:", se);
        console.log("📦 Corrected Bounds:", bounds);

        onBoundsSelected(bounds);
      } catch (err) {
        console.error("❌ Error calculating bounds:", err);
      }

      // Re-enable map interactions.
      map.setUserInteraction({
        dragPanInteraction: true,
        dblClickZoomInteraction: true,
        shiftDragZoomInteraction: true,
      });
    };

    // Register mouse event listeners on the map container.
    container.addEventListener("mousedown", onMouseDown);
    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseup", onMouseUp);

    // Cleanup event listeners and overlay on unmount.
    return () => {
      container.removeEventListener("mousedown", onMouseDown);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseup", onMouseUp);
      overlay.remove();
    };
  }, [map, onBoundsSelected]);

  return null;
}