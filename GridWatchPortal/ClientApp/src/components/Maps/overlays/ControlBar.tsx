/**
 * @fileoverview
 * ControlBar component and related overlays for map UI controls.
 * 
 * This file provides:
 * - A draggable ControlBar React component for toggling map overlays (Overvoltage, THD).
 * - PositionOverlay for visual feedback during drag-and-drop docking.
 * - Tooltip utility for button hints.
 * 
 * Technologies: React, TypeScript, Tailwind CSS, Lucide icons.
 */

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Zap, Activity } from "lucide-react";

type Position = "top" | "right" | "bottom" | "left";

interface ControlBarProps {
    showOvervoltage: boolean;
    setShowOvervoltage: (v: boolean) => void;
    showTHD: boolean;
    setShowTHD: (v: boolean) => void;
}

const positionClasses: Record<Position, string> = {
    top: "top-4 left-1/2 -translate-x-1/2 right-auto bottom-auto",
    right: "top-1/2 right-4 -translate-y-1/2 left-auto bottom-auto",
    bottom: "bottom-4 left-1/2 -translate-x-1/2 top-auto right-auto",
    left: "top-1/2 left-4 -translate-y-1/2 right-auto bottom-auto",
};

const flexDirection: Record<Position, string> = {
    top: "flex-row",
    bottom: "flex-row",
    left: "flex-col",
    right: "flex-col",
};

/**
 * Tooltip component for displaying a hint on hover.
 * @param text The tooltip text.
 * @param children The element to wrap with the tooltip.
 */
function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative flex items-center">
            <div
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
                className="flex"
            >
                {children}
            </div>
            {show && (
                <div className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-gray-800 text-white text-xs shadow">
                    {text}
                </div>
            )}
        </div>
    );
}

/**
 * Overlay that previews the actual docked position/size for each area during drag.
 * @param containerRect The bounding rect of the map container.
 * @param highlight The currently highlighted docking position.
 */
function PositionOverlay({
                             containerRect,
                             highlight,
                         }: {
    containerRect: DOMRect | null;
    highlight?: Position;
}) {
    if (!containerRect) return null;

    const margin = 16;

    // Define sizes for each position, matching the ControlBar's style logic
    const sizes: Record<Position, { width: number; height: number }> = {
        top:    { width: 120, height: 40 },
        bottom: { width: 120, height: 40 },
        left:   { width: 40,  height: 120 },
        right:  { width: 40,  height: 120 },
    };

    const positions = {
        top: {
            left: containerRect.left + (containerRect.width - sizes.top.width) / 2,
            top: containerRect.top + margin,
            width: sizes.top.width,
            height: sizes.top.height,
            borderRadius: "12px 12px 8px 8px",
        },
        bottom: {
            left: containerRect.left + (containerRect.width - sizes.bottom.width) / 2,
            top: containerRect.bottom - sizes.bottom.height - margin,
            width: sizes.bottom.width,
            height: sizes.bottom.height,
            borderRadius: "8px 8px 12px 12px",
        },
        left: {
            left: containerRect.left + margin,
            top: containerRect.top + (containerRect.height - sizes.left.height) / 2,
            width: sizes.left.width,
            height: sizes.left.height,
            borderRadius: "12px 8px 8px 12px",
        },
        right: {
            left: containerRect.right - sizes.right.width - margin,
            top: containerRect.top + (containerRect.height - sizes.right.height) / 2,
            width: sizes.right.width,
            height: sizes.right.height,
            borderRadius: "8px 12px 12px 8px",
        },
    };

    return (
        <>
            {(Object.keys(positions) as Position[]).map((pos) => {
                const style = {
                    position: "fixed" as const,
                    left: positions[pos].left,
                    top: positions[pos].top,
                    width: positions[pos].width,
                    height: positions[pos].height,
                    borderRadius: positions[pos].borderRadius,
                    border: `2px solid ${highlight === pos ? "#3b82f6" : "transparent"}`,
                    background: highlight === pos ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.07)",
                    zIndex: 1000,
                    pointerEvents: "none" as const,
                    transition: "all 0.15s",
                };
                return (
                    <div key={pos} style={style} />
                );
            })}
        </>
    );
}

/**
 * Draggable ControlBar for toggling map overlays.
 * Allows docking to any map edge via drag-and-drop.
 * 
 * @param showOvervoltage Whether to show overvoltage regions.
 * @param setShowOvervoltage Setter for overvoltage toggle.
 * @param showTHD Whether to show THD overvoltage.
 * @param setShowTHD Setter for THD toggle.
 */
export function ControlBar({
                               showOvervoltage,
                               setShowOvervoltage,
                               showTHD,
                               setShowTHD,
                           }: ControlBarProps) {
    const [position, setPosition] = useState<Position>("bottom");
    const [dragging, setDragging] = useState(false);
    const [highlight, setHighlight] = useState<Position | undefined>(undefined);
    const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
    const barRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Find the map container (the .relative parent)
    useEffect(() => {
        if (barRef.current) {
            const parent = barRef.current.closest(".relative");
            if (parent) {
                containerRef.current = parent as HTMLDivElement;
                setContainerRect(parent.getBoundingClientRect());
            }
        }
    }, []);

    /**
     * Handler for drag start event.
     */
    const handleDragStart = () => {
        setDragging(true);
        if (containerRef.current) {
            setContainerRect(containerRef.current.getBoundingClientRect());
        }
    };

    /**
     * Handler for drag end event.
     * Determines the new docking position based on drop location.
     */
    const handleDragEnd = (e: React.DragEvent) => {
        setDragging(false);
        setHighlight(undefined);
        if (!containerRect) return;
        const { clientX, clientY } = e;
        const x = clientX - containerRect.left;
        const y = clientY - containerRect.top;
        let newPos: Position = position;
        if (y < containerRect.height * 0.25) newPos = "top";
        else if (y > containerRect.height * 0.75) newPos = "bottom";
        else if (x < containerRect.width * 0.25) newPos = "left";
        else if (x > containerRect.width * 0.75) newPos = "right";
        setPosition(newPos);
    };

    /**
     * Handler for drag event.
     * Highlights the docking area under the cursor.
     */
    const handleDrag = (e: React.DragEvent) => {
        if (!containerRect) return;
        const { clientX, clientY } = e;
        const x = clientX - containerRect.left;
        const y = clientY - containerRect.top;
        let area: Position | undefined;
        if (y < containerRect.height * 0.25) area = "top";
        else if (y > containerRect.height * 0.75) area = "bottom";
        else if (x < containerRect.width * 0.25) area = "left";
        else if (x > containerRect.width * 0.75) area = "right";
        else area = undefined;
        setHighlight(area);
    };

    const style =
        position === "left" || position === "right"
            ? { minWidth: 40, minHeight: 120, maxHeight: "60vh" }
            : { minWidth: 120, minHeight: 40 };

    return (
        <>
            {dragging && (
                <PositionOverlay
                    containerRect={containerRect}
                    highlight={highlight}
                />
            )}
            <div
                ref={barRef}
                className={cn(
                    "absolute z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200/60 dark:border-gray-700/60 rounded-lg shadow-xl p-3 gap-4 items-center cursor-move select-none transition-all",
                    positionClasses[position],
                    flexDirection[position],
                    dragging && "opacity-70"
                )}
                draggable
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDrag={handleDrag}
                style={style}
            >
                <div className={cn("flex gap-3", position === "left" || position === "right" ? "flex-col" : "flex-row")}>
                    <Tooltip text="Show Overvoltage Regions">
                        <button
                            type="button"
                            draggable={false}
                            onClick={() => setShowOvervoltage(!showOvervoltage)}
                            className={cn(
                                "p-2 rounded-full transition-colors",
                                showOvervoltage
                                    ? "bg-blue-500 text-white shadow"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900"
                            )}
                            aria-label="Show Overvoltage Regions"
                        >
                            <Zap className="w-5 h-5" />
                        </button>
                    </Tooltip>
                    <Tooltip text="Show THD Over Voltage">
                        <button
                            type="button"
                            draggable={false}
                            onClick={() => setShowTHD(!showTHD)}
                            className={cn(
                                "p-2 rounded-full transition-colors",
                                showTHD
                                    ? "bg-blue-500 text-white shadow"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900"
                            )}
                            aria-label="Show THD Over Voltage"
                        >
                            <Activity className="w-5 h-5" />
                        </button>
                    </Tooltip>
                </div>
            </div>
        </>
    );
}