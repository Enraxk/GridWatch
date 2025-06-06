/**
 * @fileoverview
 * DeviceHoverPanel component displays a floating panel with device information
 * when hovering over a device on the map. Shows device name, type, connection
 * status, signal strength, and last activity time.
 * 
 * Technologies: React, TypeScript
 * 
 * Props:
 * - device: Device | null - The device to display information for.
 * - position: { x: number; y: number } - The screen coordinates for panel placement.
 * - visible: boolean - Whether the panel should be visible.
 */

import { Device } from "@/types/device";
import { formatDistanceToNow } from "date-fns";
import { Wifi, WifiOff } from "lucide-react";

interface DeviceHoverPanelProps {
    device: Device | null;
    position: { x: number; y: number };
    visible: boolean;
}

/**
 * Renders a hover panel with device details at a given position.
 * @param device The device to display.
 * @param position The x and y coordinates for the panel.
 * @param visible Whether the panel is visible.
 * @returns JSX.Element | null
 */
export function DeviceHoverPanel({ device, position, visible }: DeviceHoverPanelProps) {
    if (!device || !visible) return null;

    // Calculate time since last connection
    const lastPingTime = device.lastActivityTime
        ? formatDistanceToNow(new Date(device.lastActivityTime), { addSuffix: true })
        : 'Unknown';

    /**
     * Determines the device's connection status and returns icon and text.
     * @returns {{ icon: string, text: string }}
     */
    const getStatusInfo = () => {
        if (device.connectionState === 'Connected') {
            return { icon: '🟢', text: 'Online' };
        } else if (device.connectionState === 'Disconnected') {
            return { icon: '🔴', text: 'Offline' };
        } else {
            return { icon: '⚠️', text: 'Degraded' };
        }
    };

    const statusInfo = getStatusInfo();

    // Get signal strength icon based on connection state
    const signalStrength = device.connectionState === 'Connected' ?
        <Wifi className="h-4 w-4 text-green-600" /> :
        <WifiOff className="h-4 w-4 text-red-600" />;

    // Get device name from coordinates or deviceId
    const deviceName = device.coordinates?.name || device.deviceId;

    // Get device type from coordinates
    const deviceType = device.coordinates?.type || 'Unknown Type';

    return (
        <div
            className="absolute z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 w-64"
            style={{
                left: `${position.x}px`,
                top: `${position.y + 15}px`,
                transform: 'translateX(-50%)',
                pointerEvents: 'none',
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.2s ease-in-out'
            }}
        >
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <h4 className="font-semibold truncate">{deviceName}</h4>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                        {deviceType}
                    </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                        {signalStrength}
                        <span className="text-gray-600 dark:text-gray-300">{lastPingTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span>{statusInfo.icon}</span>
                        <span>{statusInfo.text}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}