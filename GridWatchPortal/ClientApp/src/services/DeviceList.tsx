import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { getSubstationsMap } from "@/services/GridWatchService";

/**
 * Represents a substation with its associated feeders and location information.
 * @interface
 */
interface SubstationDto {
    substationId: string;
    name: string;
    type: string;
    latitude: number;
    longitude: number;
    status: string;
    createdAt: string;
    signalStrength: number;
    feeders: FeederDto[];
    properties: Record<string, any>;
}

/**
 * Represents a feeder connected to a substation with phases information.
 * @interface
 */
interface FeederDto {
    feederId: string;
    customerCount: number;
    phases: PhaseDto[];
}

/**
 * Represents electrical measurements for a specific phase.
 * @interface
 */
interface PhaseDto {
    phaseName: string;
    voltage: number | null;
    current: number | null;
    activePower: number | null;
    lastUpdated: string;
    thD: number;  // Total Harmonic Distortion
}

/**
 * Represents a point on the heatmap with geographic coordinates and intensity value.
 * @interface
 */
interface HeatmapPoint {
    latitude: number;
    longitude: number;
    value: number;
}

/**
 * Represents a layer of heatmap data with a name, threshold, and collection of points.
 * @interface
 */
interface HeatmapLayer {
    name: string;
    threshold: number;
    points: HeatmapPoint[];
}

/**
 * Container for substations and heatmap data returned by the API.
 * @interface
 */
interface SubstationMappingDto {
    substations: SubstationDto[];
    heatmaps: HeatmapLayer[];
}

/**
 * Legacy device format used for compatibility with existing components.
 * Structured to match the expected format of components consuming device data.
 * @interface
 */
interface Device {
    deviceId: string;
    connectionState: string;
    lastActivityTime?: string;
    coordinates: {
        latitude: string;
        longitude: string;
        name: string;
        type: string;
    };
    details: {
        properties: {
            reported: {
                substation: {
                    id: string;
                    latitude: string;
                    longitude: string;
                    name: string;
                    type: string;
                };
                readings: {
                    voltage: number;
                    current: number;
                    activePower: number;
                    thd?: number;
                }[];
                signalStrength?: number;
                [key: string]: any;
            };
        };
    };
}

/**
 * Props for the DeviceList component.
 * @interface
 * @property {function} [onDevicesLoaded] - Optional callback executed when devices are loaded.
 */
interface DeviceListProps {
    /** Optional callback that is executed when devices have been successfully loaded */
    onDevicesLoaded?: (devices: Device[]) => void;
}

/**
 * DeviceList React component.
 *
 * Fetches substation data from the API, transforms it into the legacy Device format,
 * and invokes the optional `onDevicesLoaded` callback with the processed data.
 *
 * This component does not render any UI elements.
 *
 * @param {DeviceListProps} props - Component properties.
 * @returns {null} This component does not render any visible elements.
 */
export function DeviceList({ onDevicesLoaded }: DeviceListProps) {
    const { instance } = useMsal();
    const [devices, setDevices] = useState<Device[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [hasFetched, setHasFetched] = useState<boolean>(false);

    /**
     * Effect hook to fetch substation data on component mount.
     * Only fetches data once unless dependencies change.
     */
    useEffect(() => {
        if (hasFetched) {
            return;
        }

        /**
         * Fetches substation data from the API and converts it to the Device format.
         * Sets the devices state and calls the onDevicesLoaded callback if provided.
         *
         * @async
         */
        const fetchSubstations = async () => {
            try {
                setLoading(true);

                // Get substation mapping data from the GridWatchService
                const substationMap: SubstationMappingDto = await getSubstationsMap();
                console.log("🗺️ Retrieved substation map data:", substationMap);

                // Convert SubstationDto[] to Device[] format for compatibility
                const convertedDevices: Device[] = substationMap.substations.map(substation => {
                    // Extract the readings from all phases of the first feeder (if available)
                    const readings = substation.feeders?.[0]?.phases || [];

                    // Get the last updated time from the first phase if available
                    const lastActivityTime = readings.length > 0 ? readings[0].lastUpdated : undefined;

                    return {
                        deviceId: substation.substationId,
                        connectionState: substation.status || "Connected",
                        lastActivityTime: lastActivityTime,
                        coordinates: {
                            latitude: substation.latitude.toString(),
                            longitude: substation.longitude.toString(),
                            name: substation.name,
                            type: substation.type
                        },
                        details: {
                            properties: {
                                reported: {
                                    substation: {
                                        id: substation.substationId,
                                        latitude: substation.latitude.toString(),
                                        longitude: substation.longitude.toString(),
                                        name: substation.name,
                                        type: substation.type
                                    },
                                    readings: readings.map(phase => ({
                                        voltage: phase.voltage ?? 0,
                                        current: phase.current ?? 0,
                                        activePower: phase.activePower ?? 0,
                                        thd: phase.thD  // Include THD value
                                    })),
                                    signalStrength: substation.signalStrength,
                                    // Include additional properties from the backend
                                    ...substation.properties?.reported
                                }
                            }
                        }
                    };
                });

                setDevices(convertedDevices);
                setHasFetched(true);
                console.log("🗺️ Converted devices for map:", convertedDevices);

                if (onDevicesLoaded) {
                    onDevicesLoaded(convertedDevices);
                }
            } catch (error) {
                console.error("🔴 Error fetching substations:", error);
                setError((error as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchSubstations();
    }, [instance, onDevicesLoaded, hasFetched]);

    // This component doesn't render anything visible but processes the device data
    return null;
}