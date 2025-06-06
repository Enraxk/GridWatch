/**
 * @fileoverview
 * NetworkHealthOverlay component displays a draggable overlay summarizing the health of network devices.
 * It provides interactive filters for device connection states and visual feedback for network status.
 * 
 * Technologies: React, TypeScript, Lucide Icons, Tailwind CSS.
 * 
 * Props:
 * - devices: Array of Device objects representing network devices.
 * - selectedFilter: Currently selected filter for device connection state.
 * - onFilterChange: Callback to update the selected filter.
 */

import { useState, useRef, useEffect } from "react";
import { Device } from "@/types/device";
import { Heart, CheckCircle, XCircle, AlertTriangle, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Props for NetworkHealthOverlay component.
 */
interface NetworkHealthOverlayProps {
    devices: Device[];
    selectedFilter: string | null;
    onFilterChange: (filter: string | null) => void;
}

/**
 * NetworkHealthOverlay
 * 
 * Displays a draggable overlay with network health statistics and filter options.
 * Allows users to filter devices by connection state and see a summary of network status.
 * 
 * @param devices - List of network devices.
 * @param selectedFilter - Current filter for device connection state.
 * @param onFilterChange - Callback to change the filter.
 */
export function NetworkHealthOverlay({
                                         devices,
                                         selectedFilter,
                                         onFilterChange
                                     }: NetworkHealthOverlayProps) {
    // Overlay position state (right, top in px)
    const [position, setPosition] = useState({ right: 12, top: 16 });
    // Dragging state
    const [isDragging, setIsDragging] = useState(false);
    // Offset for drag calculations
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    // Ref to the overlay DOM element
    const overlayRef = useRef<HTMLDivElement>(null);
    // Ref to the map container DOM element
    const mapContainerRef = useRef<HTMLElement | null>(null);
    // Heart icon animation state
    const [heartBeat, setHeartBeat] = useState(false);

    /**
     * On mount, find the closest parent with class 'relative' to use as the drag boundary.
     */
    useEffect(() => {
        if (overlayRef.current) {
            const parent = overlayRef.current.closest('.relative');
            if (parent) mapContainerRef.current = parent as HTMLElement;
        }
    }, []);

    /**
     * Handle mouse down event to start dragging.
     * @param e Mouse event
     */
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        if (overlayRef.current && mapContainerRef.current) {
            const overlayRect = overlayRef.current.getBoundingClientRect();
            const containerRect = mapContainerRef.current.getBoundingClientRect();
            setDragOffset({
                x: containerRect.right - e.clientX - (containerRect.right - overlayRect.right),
                y: e.clientY - overlayRect.top
            });
            setIsDragging(true);
        }
    };

    /**
     * Handle mouse move event to update overlay position while dragging.
     * @param e Mouse event
     */
    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && mapContainerRef.current && overlayRef.current) {
            e.preventDefault();
            const containerRect = mapContainerRef.current.getBoundingClientRect();
            const overlayWidth = overlayRef.current.offsetWidth;
            const overlayHeight = overlayRef.current.offsetHeight;
            let newRight = containerRect.right - e.clientX - dragOffset.x;
            let newTop = e.clientY - containerRect.top - dragOffset.y;
            newRight = Math.max(0, Math.min(newRight, containerRect.width - overlayWidth));
            newTop = Math.max(0, Math.min(newTop, containerRect.height - overlayHeight));
            setPosition({
                right: newRight,
                top: newTop
            });
        }
    };

    /**
     * Handle mouse up event to stop dragging.
     */
    const handleMouseUp = () => setIsDragging(false);

    // Device connection state counts
    const total = devices.length;
    const connected = devices.filter(d => d.connectionState === "Connected").length;
    const disconnected = devices.filter(d => d.connectionState === "Disconnected").length;
    const degraded = devices.filter(d => d.connectionState !== "Connected" && d.connectionState !== "Disconnected").length;
    const percent = total > 0 ? Math.round((connected / total) * 100) : 0;

    /**
     * Handle filter button click.
     * @param filter Filter string or null
     */
    const handleFilterClick = (filter: string | null) => {
        onFilterChange(selectedFilter === filter ? null : filter);
    };

    return (
        <div
            ref={overlayRef}
            className={cn(
                "absolute z-40",
                isDragging ? "cursor-grabbing select-none" : ""
            )}
            style={{
                right: `${position.right}px`,
                top: `${position.top}px`,
                minWidth: "140px",
                userSelect: isDragging ? "none" : "auto"
            }}
        >
            <Card className="w-[92vw] max-w-[200px] p-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200/60 dark:border-gray-700/60 shadow-xl text-white">
                <CardContent className="p-3">
                    {/* Drag handle */}
                    <div
                        className="flex items-center gap-2 cursor-move mb-2"
                        onMouseDown={handleMouseDown}
                    >
                        <span className="font-bold text-base tracking-tight">Network Health</span>
                    </div>
                    <div className="border-b border-gray-200 dark:border-gray-700 mb-2" />
                    {/* Heart and percentage */}
                    <div className="flex items-center gap-3 mb-3">
                        <div
                            onMouseEnter={() => setHeartBeat(true)}
                            onMouseLeave={() => setHeartBeat(false)}
                            className="relative"
                        >
                            <Heart
                                className={cn(
                                    "w-7 h-7 text-red-500 transition-transform",
                                    heartBeat && "animate-pulse"
                                )}
                                fill={heartBeat ? "#ef4444" : "none"}
                            />
                        </div>
                        <span className="text-2xl font-extrabold">{percent}%</span>
                        <span className="text-gray-500 ml-1 font-medium text-sm">online</span>
                    </div>
                    {/* Counters with filter - now vertical */}
                    <div className="flex flex-col gap-2">
                        <div
                            className={cn(
                                "flex items-center gap-1 cursor-pointer px-2 py-1 rounded-md transition-colors text-xs",
                                selectedFilter === "Connected" ? "bg-green-100 dark:bg-green-900" : "hover:bg-green-50 dark:hover:bg-green-800"
                            )}
                            onClick={() => handleFilterClick("Connected")}
                        >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-green-700 dark:text-green-400">{connected}</span>
                            <span className="text-gray-700 dark:text-gray-200">Connected</span>
                        </div>
                        <div
                            className={cn(
                                "flex items-center gap-1 cursor-pointer px-2 py-1 rounded-md transition-colors text-xs",
                                selectedFilter === "Disconnected" ? "bg-red-100 dark:bg-red-900" : "hover:bg-red-50 dark:hover:bg-red-800"
                            )}
                            onClick={() => handleFilterClick("Disconnected")}
                        >
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span className="font-semibold text-red-700 dark:text-red-400">{disconnected}</span>
                            <span className="text-gray-700 dark:text-gray-200">Disconnected</span>
                        </div>
                        <div
                            className={cn(
                                "flex items-center gap-1 cursor-pointer px-2 py-1 rounded-md transition-colors text-xs",
                                selectedFilter === "Degraded" ? "bg-yellow-100 dark:bg-yellow-900" : "hover:bg-yellow-50 dark:hover:bg-yellow-800"
                            )}
                            onClick={() => handleFilterClick("Degraded")}
                        >
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            <span className="font-semibold text-yellow-600 dark:text-yellow-400">{degraded}</span>
                            <span className="text-gray-700 dark:text-gray-200">Degraded</span>
                        </div>
                        <div
                            className={cn(
                                "flex items-center gap-1 cursor-pointer px-2 py-1 rounded-md transition-colors text-xs",
                                selectedFilter === null ? "bg-gray-100 dark:bg-gray-900" : "hover:bg-gray-50 dark:hover:bg-gray-800"
                            )}
                            onClick={() => handleFilterClick(null)}
                        >
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{total}</span>
                            <span className="text-gray-700 dark:text-gray-200">Total</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
            {/* Drag event handlers */}
            {isDragging && (
                <div
                    className="fixed inset-0 z-50 cursor-grabbing"
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                />
            )}
        </div>
    );
}