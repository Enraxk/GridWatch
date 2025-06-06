/**
 * @fileoverview
 * MapLegend component displays a legend for device status on the map,
 * showing icons and labels for Connected, Degraded, and Disconnected states.
 * Uses Lucide React icons and Tailwind CSS for styling.
 */

import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

/**
 * Renders a map legend overlay with device status indicators.
 * @returns {JSX.Element} The MapLegend component.
 */
export function MapLegend() {
    return (
        <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-900/90 border border-gray-200/60 dark:border-gray-700/60 rounded-lg shadow-lg p-3 max-w-[180px] flex flex-col gap-2 z-30">
            <div className="text-sm font-semibold mb-1 text-gray-900 dark:text-gray-100">Device Status</div>
            <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-700 dark:text-gray-300">Connected</span>
            </div>
            <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-gray-700 dark:text-gray-300">Degraded</span>
            </div>
            <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-xs text-gray-700 dark:text-gray-300">Disconnected</span>
            </div>
        </div>
    );
}