/**
 * @fileoverview
 * AzureMapCard is a React component that displays a map with device overlays,
 * filtering, fullscreen support, and device detail drawers. It integrates with
 * various UI and map-related components, and manages device state, filtering,
 * and UI overlays for a grid watch portal.
 */

import {useState, useRef} from "react";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {MapContainer} from "@/components/Maps/containers/MapContainer";
import {MapLegend} from "@/components/Maps/overlays/MapLegend";
import {DeviceList} from "@/services/DeviceList";
import {Device} from "@/types/device";
import {FullscreenButton} from "@/components/Maps/utils/FullscreenButton";
import {SubstationDrawer} from "@/components/Maps/drawers/SubstationDrawer";
import {useTheme} from "@/components/theme-provider";
import {NetworkHealthOverlay} from "@/components/Maps/overlays/NetworkHealthOverlay";
import {ControlBar} from "@/components/Maps/overlays/ControlBar.tsx";

/**
 * Props for AzureMapCard component.
 */
interface AzureMapCardProps {
    aspectRatio?: string;
    className?: string;
}

/**
 * AzureMapCard component displays a map with device overlays, filtering,
 * fullscreen support, and device detail drawers.
 *
 * @param {AzureMapCardProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
export function AzureMapCard({aspectRatio, className}: AzureMapCardProps) {
    // State for device data and UI controls
    const [devices, setDevices] = useState<Device[]>([]);
    const [devicesLoaded, setDevicesLoaded] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [popupPosition, setPopupPosition] = useState({x: 0, y: 0});
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [deviceFilter, setDeviceFilter] = useState<string | null>(null);
    const [showOvervoltage, setShowOvervoltage] = useState(false);
    const [showTHD, setShowTHD] = useState(false);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const {theme} = useTheme();

    /**
     * Handles loading of device data.
     * @param {Device[]} data - Array of devices loaded.
     */
    const handleDevicesLoaded = (data: Device[]) => {
        setDevices(data);
        setDevicesLoaded(true);
    };

    /**
     * Toggles fullscreen mode for the map container.
     */
    const toggleFullscreen = () => {
        if (!isFullscreen && mapContainerRef.current) {
            if (mapContainerRef.current.requestFullscreen) {
                mapContainerRef.current.requestFullscreen();
            } else if ((mapContainerRef.current as any).webkitRequestFullscreen) {
                (mapContainerRef.current as any).webkitRequestFullscreen();
            } else if ((mapContainerRef.current as any).mozRequestFullScreen) {
                (mapContainerRef.current as any).mozRequestFullScreen();
            }
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    };

    /**
     * Handles click on a device marker.
     * @param {Device} device - The selected device.
     */
    const handleDeviceClick = (device: Device) => {
        setSelectedDevice(device);
        setPopupPosition({x: 0, y: 0});
        setShowPopup(true);
        setDrawerOpen(true);
    };

    /**
     * Closes the popup overlay.
     */
    const handleClosePopup = () => {
        setShowPopup(false);
    };

    /**
     * Closes the device detail drawer.
     */
    const handleDrawerClose = () => {
        setDrawerOpen(false);
        if (!showPopup) {
            setSelectedDevice(null);
        }
    };

    // Filter devices for the map based on UI controls
    const filteredDevices = devices.filter(d => {
        let pass = true;
        if (showOvervoltage) {
            const voltage = d.details?.properties?.reported?.readings?.[0]?.voltage || 0;
            pass = pass && voltage > 240;
        }
        if (showTHD) {
            const thd = d.details?.properties?.reported?.readings?.[0]?.thd || 0;
            pass = pass && thd > 5;
        }
        if (deviceFilter) {
            pass = pass && (
                deviceFilter === "Degraded"
                    ? d.connectionState !== "Connected" && d.connectionState !== "Disconnected"
                    : d.connectionState === deviceFilter
            );
        }
        return pass;
    });

    return (
        <Card className={className}>
            <CardContent className="px-2 sm:p-6">
                <div
                    ref={mapContainerRef}
                    style={{
                        width: '100%',
                        height: '100%',
                        ...(aspectRatio ? {aspectRatio} : {})
                    }}
                    className="relative h-[400px]"
                >
                    <MapContainer
                        key={theme}
                        devices={filteredDevices}
                        devicesLoaded={devicesLoaded}
                        onDeviceClick={handleDeviceClick}
                        isFullscreen={isFullscreen}
                        setIsFullscreen={setIsFullscreen}
                    />
            
                    <FullscreenButton
                        isFullscreen={isFullscreen}
                        toggleFullscreen={toggleFullscreen}
                    />

                    <div className="hidden">
                        <DeviceList onDevicesLoaded={handleDevicesLoaded}/>
                    </div>

                    <SubstationDrawer
                        device={selectedDevice}
                        isOpen={drawerOpen}
                        onClose={handleDrawerClose}
                    />
                    <NetworkHealthOverlay
                        devices={devices}
                        selectedFilter={deviceFilter}
                        onFilterChange={setDeviceFilter}
                    />
                    <ControlBar
                        showOvervoltage={showOvervoltage}
                        setShowOvervoltage={setShowOvervoltage}
                        showTHD={showTHD}
                        setShowTHD={setShowTHD}
                    />
                </div>
            </CardContent>
        </Card>
    );
}