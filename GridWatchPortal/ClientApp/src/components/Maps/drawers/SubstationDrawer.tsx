/**
 * @file SubstationDrawer.tsx
 * @description
 * Provides the `SubstationDrawer` React component for displaying detailed information about a substation device
 * in a draggable, styled drawer overlay. Supports tabbed views for device info, metrics, and alerts, and
 * integrates with the parent map container for positioning.
 * 
 * Technologies: React, TypeScript
 * 
 * Exports:
 * - SubstationDrawer: Main component for rendering the substation detail drawer.
 * 
 * Interfaces:
 * - SubstationDrawerProps: Props for configuring the drawer's device, open state, and close handler.
 */

import { useState, useRef, useEffect } from "react";
import { Device } from "@/types/device";
import { cn } from "@/lib/utils";
import { MiniTrendChart } from "@/components/Maps/overlays/MiniTrendChart";
import { useTheme } from "@/components/theme-provider";
import {
    X,
    ArrowRight,
    AlertTriangle,
    Activity,
    Info,
    Cpu,
    Move
} from "lucide-react";

/**
 * Props for the SubstationDrawer component.
 * @interface
 * @property {Device | null} device - The device to display details for.
 * @property {boolean} isOpen - Whether the drawer is open.
 * @property {() => void} onClose - Handler to close the drawer.
 */
/**
 * Props for the SubstationDrawer component.
 * @interface
 * @property {Device | null} device - The device to display details for.
 * @property {boolean} isOpen - Whether the drawer is open.
 * @property {() => void} onClose - Handler to close the drawer.
 */
interface SubstationDrawerProps {
    device: Device | null;
    isOpen: boolean;
    onClose: () => void;
}

/**
 * SubstationDrawer React component.
 * Displays a draggable drawer with detailed information about a substation device,
 * including info, metrics, and alerts. Integrates with the parent map container for
 * positioning and bounds checking.
 * 
 * @param {SubstationDrawerProps} props - The props for the component.
 * @returns {JSX.Element | null} The rendered drawer or null if no device is provided.
 */
/**
 * SubstationDrawer React component.
 * Displays a draggable drawer with detailed information about a substation device,
 * including info, metrics, and alerts. Integrates with the parent map container for
 * positioning and bounds checking.
 * 
 * @param {SubstationDrawerProps} props - The props for the component.
 * @returns {JSX.Element | null} The rendered drawer or null if no device is provided.
 */
export function SubstationDrawer({ device, isOpen, onClose }: SubstationDrawerProps) {
    const [activeTab, setActiveTab] = useState<'info' | 'metrics' | 'alerts'>('info');
    const [position, setPosition] = useState({ x: 20, y: 50 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const cardRef = useRef<HTMLDivElement>(null);
    const mapContainerRef = useRef<HTMLElement | null>(null);
    const { theme } = useTheme();

    // Find and store the map container reference
    useEffect(() => {
        if (cardRef.current) {
            const parent = cardRef.current.closest('.relative');
            if (parent) {
                mapContainerRef.current = parent as HTMLElement;
            }
        }
    }, [isOpen]);

    /**
     * Handler for mouse down event on the drawer header (drag start).
     * @param {React.MouseEvent} e
     */
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        if (cardRef.current && mapContainerRef.current) {
            const cardRect = cardRef.current.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - cardRect.left,
                y: e.clientY - cardRect.top
            });
            setIsDragging(true);
        }
    };

    /**
     * Handler for mouse move event during dragging.
     * @param {React.MouseEvent} e
     */
    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && mapContainerRef.current) {
            e.preventDefault();
            const containerRect = mapContainerRef.current.getBoundingClientRect();
            const newX = e.clientX - containerRect.left - dragOffset.x;
            const newY = e.clientY - containerRect.top - dragOffset.y;
            const cardWidth = cardRef.current?.offsetWidth || 320;
            const cardHeight = cardRef.current?.offsetHeight || 400;
            const boundedX = Math.max(0, Math.min(newX, containerRect.width - cardWidth));
            const boundedY = Math.max(0, Math.min(newY, containerRect.height - cardHeight));
            setPosition({
                x: boundedX,
                y: boundedY
            });
        }
    };

    /**
     * Handler for mouse up event (drag end).
     */
    const handleMouseUp = () => {
        setIsDragging(false);
    };

    if (!device) return null;

    // Sample data and other functions remain the same

    return (
        <div
            ref={cardRef}
            className={cn(
                "absolute bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-md shadow-lg z-30 transition-opacity duration-300 w-80",
                isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
                isDragging ? "cursor-grabbing select-none" : ""
            )}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                maxHeight: "80%",
                overflow: "hidden"
            }}
            data-theme={theme}
        >
            {/* Header with drag handle */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-100/80 dark:bg-gray-800/80">
                <div
                    className="flex items-center gap-1 cursor-move flex-1"
                    onMouseDown={handleMouseDown}
                >
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                       Substation Details
                    </h3>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 z-10"
                    aria-label="Close drawer"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Content area */}
            <div className="p-4 overflow-y-auto border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200" style={{ maxHeight: "calc(100% - 93px)" }}>
                {activeTab === 'info' && (
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                           <h1 className="text-lg">{device.deviceId.charAt(0).toUpperCase() + device.deviceId.slice(1)}</h1>
                           <div className="ml-4 text-right">
                                <p className="text-gray-600 dark:text-gray-400">{device.coordinates?.type || 'Unknown'}</p>
                           </div>
                       </div>
                       <div className="flex items-center">
                           <span
                               className={
                                   "inline-block w-3 h-3 rounded-full mr-2 " +
                                   (device.connectionState === 'Connected'
                                       ? "bg-green-600 dark:bg-green-500"
                                       : device.connectionState === 'Disconnected'
                                           ? "bg-red-600 dark:bg-red-500"
                                           : "bg-yellow-500 dark:bg-yellow-400")
                               }
                           />
                           <p>
                               {device.connectionState || 'Unknown'}
                           </p>
                       </div>
                        {device?.details?.properties?.reported?.readings && (
                            <div>
                                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">Phase Readings</h4>
                                <div className="mt-2">
                                    <div className="grid grid-cols-4 gap-2 font-semibold text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        <div>Phase</div>
                                        <div>Voltage</div>
                                        <div>Current</div>
                                        <div>Power</div>
                                    </div>
                                    {device.details.properties.reported.readings.map((reading, idx) => (
                                        <div key={idx} className="grid grid-cols-4 gap-2 items-center  py-1 text-sm">
                                            <div className="font-medium">Phase {idx+1}</div>
                                            <div>{reading.voltage.toFixed(1)} <span style={{ color: "#2563eb" }}>V</span></div>
                                            <div>{reading.current.toFixed(1)} <span style={{ color: "#16a34a" }}>A</span></div>
                                            <div>{reading.activePower.toFixed(1)} <span style={{ color: "#f59e42" }}>W</span></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* Content area 2 */}
            <div className="p-4 overflow-y-auto text-gray-800 dark:text-gray-200" style={{ maxHeight: "calc(100% - 93px)" }}>
                <div className="flex items-start justify-between mt-4">
                    <div>
                        <h4 className="text-md font-semibold mb-2">Recent Alerts</h4>
                        <div className="mb-1 text-gray-600 dark:text-gray-400">Low signal strength</div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                            Yesterday, 3:45 PM
                        </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                        <AlertTriangle size={24} className="text-yellow-500" />
                    </div>
                </div>
            </div>
            {/* Footer with date logs */}
            <div className="flex items-center justify-between p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-100/80 dark:bg-gray-800/80">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Last updated: {new Date().toLocaleString()}
                </div>
            </div>
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