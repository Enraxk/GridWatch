/**
 * @file GridWatchPortal/ClientApp/src/types/device.tsx
 * @description Defines the Device interface for IoT device representation in the GridWatch system.
 *
 * The Device interface models a connected IoT device, including its unique identifier, connection state,
 * geographic location, and detailed configuration and telemetry data. This structure is used throughout
 * the GridWatch system to ensure consistent handling of device data.
 */

/**
 * Represents a connected IoT device in the GridWatch system.
 *
 * @interface Device
 * @property {string} deviceId - Unique identifier for the device.
 * @property {string} connectionState - Current connection status of the device (e.g., 'connected', 'disconnected').
 * @property {string} [lastActivityTime] - Timestamp of the last activity from the device.
 * @property {Object} coordinates - Geographic location and classification information.
 * @property {string} coordinates.latitude - Latitude coordinate as string.
 * @property {string} coordinates.longitude - Longitude coordinate as string.
 * @property {string} coordinates.name - Location name.
 * @property {string} coordinates.type - Type of location.
 * @property {Object} details - Device configuration and telemetry data.
 * @property {Object} details.properties - Device properties container.
 * @property {Object} details.properties.reported - Values reported by device.
 * @property {Object} details.properties.reported.substation - Associated electrical substation information.
 * @property {string} details.properties.reported.substation.id - Unique identifier for the substation.
 * @property {string} details.properties.reported.substation.latitude - Substation latitude coordinate.
 * @property {string} details.properties.reported.substation.longitude - Substation longitude coordinate.
 * @property {string} details.properties.reported.substation.name - Substation name.
 * @property {string} details.properties.reported.substation.type - Substation type/classification.
 * @property {Array<Object>} [details.properties.reported.readings] - Optional array of electrical measurements from the device.
 * @property {number} details.properties.reported.readings[].voltage - Voltage measurement in volts.
 * @property {number} details.properties.reported.readings[].current - Current measurement in amperes.
 * @property {number} details.properties.reported.readings[].activePower - Active power measurement in watts.
 * @property {number} [details.properties.reported.readings[].thd] - Total Harmonic Distortion measurement.
 * @property {number} [details.properties.reported.signalStrength] - Signal strength of the device in percentage.
 * @property {*} [details.properties.reported[key]] - Additional device properties.
 */
export interface Device {
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
                readings?: {
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