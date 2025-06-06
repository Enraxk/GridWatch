/**
 * @fileoverview
 * MapContainer component for rendering an interactive Azure Map with device markers and clustering.
 *
 * Features:
 * - Displays device locations with custom HTML markers and clustering.
 * - Supports filtering devices by voltage, THD, signal, alerts, and model.
 * - Responsive to fullscreen mode and theme changes.
 * - Handles device click and hover events.
 * - Automatically adjusts map view to fit device points.
 * - Uses Azure Maps Control and react-azure-maps.
 *
 * @module components/Maps/containers/MapContainer
 */

import { useEffect, useState, useMemo, useCallback } from "react";
import {
    AzureMap,
    AzureMapsProvider,
    IAzureMapOptions,
    ControlOptions,
    AzureMapDataSourceProvider,
    AzureMapLayerProvider,
    AuthenticationType,
} from "react-azure-maps";
import { useConfig } from "@/hooks/useConfig";
import { Device } from "@/types/device";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useTheme } from "@/components/theme-provider";
import * as atlas from "azure-maps-control";

type FilterType = 'voltage' | 'thd' | 'signal' | 'alerts' | 'model';

interface MapContainerProps {
    devices: Device[];
    devicesLoaded: boolean;
    onDeviceClick: (device: Device) => void;
    isFullscreen: boolean;
    setIsFullscreen: (value: boolean) => void;
    onDeviceHover?: (device: Device | null, event: any) => void;
}

/**
 * Utility to create a circular HTML marker for map points.
 * @param color - The background color of the marker.
 * @param size - The diameter of the marker in pixels.
 * @returns HTMLElement representing the marker.
 */
function createCircleMarker(color: string, size = 24) {
    const div = document.createElement("div");
    div.className = "custom-circle-marker transition-shadow border-2 border-white shadow hover:shadow-lg hover:cursor-pointer";
    div.style.width = `${size}px`;
    div.style.height = `${size}px`;
    div.style.borderRadius = "9999px";
    div.style.background = color;
    return div;
}

/**
 * MapContainer component.
 * Renders an Azure Map with device markers, clustering, and filtering.
 *
 * @param devices - Array of device objects to display.
 * @param devicesLoaded - Flag indicating if devices are loaded.
 * @param onDeviceClick - Callback for when a device marker is clicked.
 * @param isFullscreen - Flag for fullscreen mode.
 * @param setIsFullscreen - Setter for fullscreen state.
 * @param onDeviceHover - Optional callback for device marker hover.
 */
export function MapContainer({
                                 devices,
                                 devicesLoaded,
                                 onDeviceClick,
                                 isFullscreen,
                                 setIsFullscreen,
                                 onDeviceHover
                             }: MapContainerProps) {
    const { theme } = useTheme();
    const { config, loading: configLoading } = useConfig();
    const [mapOptions, setMapOptions] = useState<IAzureMapOptions | null>(null);
    const [mapReady, setMapReady] = useState(false);
    const [mapRef, setMapRef] = useState<atlas.Map | null>(null);
    const [loading, setLoading] = useState(true);
    const [pointCollection, setPointCollection] = useState<atlas.data.Feature<atlas.data.Point, any>[]>([]);
    const [activeFilters, setActiveFilters] = useState<FilterType[]>([]);

    /**
     * Returns the map style based on the current theme.
     */
    const getMapStyle = useCallback(() => {
        if (theme === "system") {
            return window.matchMedia("(prefers-color-scheme: dark)").matches ? "night" : "road";
        }
        return theme === "dark" ? "night" : "road";
    }, [theme]);

    // Handle fullscreen state changes
    useEffect(() => {
        const fullScreenChanged = () => {
            const isFullScreenNow = Boolean(
                document.fullscreenElement ||
                (document as any).webkitFullscreenElement ||
                (document as any).mozFullScreenElement
            );
            setIsFullscreen(isFullScreenNow);
        };
        document.addEventListener('fullscreenchange', fullScreenChanged);
        document.addEventListener('webkitfullscreenchange', fullScreenChanged);
        document.addEventListener('mozfullscreenchange', fullScreenChanged);
        return () => {
            document.removeEventListener('fullscreenchange', fullScreenChanged);
            document.removeEventListener('webkitfullscreenchange', fullScreenChanged);
            document.removeEventListener('mozfullscreenchange', fullScreenChanged);
        };
    }, [setIsFullscreen]);

    // Set loading state based on config and device loading
    useEffect(() => {
        setLoading(configLoading || !devicesLoaded);
    }, [configLoading, devicesLoaded]);

    // Initialize map options and center based on devices or user location
    useEffect(() => {
        if (configLoading || !config) return;
        const subscriptionKey = config.azureMapsKey || import.meta.env.VITE_AZURE_MAP_KEY;
        let mapStyle: string;
        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            mapStyle = systemTheme === "dark" ? "night" : "road";
        } else {
            mapStyle = theme === "dark" ? "night" : "road";
        }
        const options: IAzureMapOptions = {
            zoom: 7,
            view: "Auto",
            style: mapStyle,
            authOptions: {
                authType: AuthenticationType.subscriptionKey,
                subscriptionKey,
            },
        };
        function tryGetUserLocation(mapOpts: IAzureMapOptions) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        mapOpts.center = [position.coords.longitude, position.coords.latitude];
                        setMapOptions(mapOpts);
                    },
                    () => {
                        mapOpts.center = [-8.547624169588227, 52.67168922700702];
                        setMapOptions(mapOpts);
                    }
                );
            } else {
                mapOpts.center = [-8.547624169588227, 52.67168922700702];
                setMapOptions(mapOpts);
            }
        }
        if (devicesLoaded && devices.length > 0) {
            const firstDeviceWithCoords = devices.find(d =>
                d.coordinates?.latitude && d.coordinates.longitude);
            if (firstDeviceWithCoords?.coordinates) {
                const longitude = parseFloat(firstDeviceWithCoords.coordinates.longitude);
                const latitude = parseFloat(firstDeviceWithCoords.coordinates.latitude);
                options.center = [longitude, latitude];
                setMapOptions(options);
            } else {
                tryGetUserLocation(options);
            }
        } else {
            tryGetUserLocation(options);
        }
    }, [config, configLoading, devices, devicesLoaded, theme]);

    // Build point collection for devices, applying filters
    useEffect(() => {
        if (!devicesLoaded || devices.length === 0) return;
        try {
            let devicesWithCoords = devices.filter(device =>
                device.coordinates?.latitude && device.coordinates.longitude
            );
            if (activeFilters.includes('voltage')) {
                devicesWithCoords = devicesWithCoords.filter(device => {
                    const voltage = device.details?.properties?.reported?.readings?.[0]?.voltage || 0;
                    return voltage > 240;
                });
            }
            if (activeFilters.includes('alerts')) {
                devicesWithCoords = devicesWithCoords.filter(device =>
                    device.connectionState !== 'Connected'
                );
            }
            if (activeFilters.includes('model')) {
                devicesWithCoords = devicesWithCoords.filter(device => {
                    const modelType = device.details?.properties?.reported?.modelType || '';
                    return modelType.includes('GW200');
                });
            }
            const points = devicesWithCoords.map(device => {
                const { latitude, longitude, name, type } = device.coordinates!;
                const voltage = device.details?.properties?.reported?.readings?.[0]?.voltage || 0;
                const isConnected = device.connectionState === 'Connected';
                const thd = device.details?.properties?.reported?.readings?.[0]?.thd || 0;
                const signalStrength = device.details?.properties?.reported?.signalStrength || 0;
                const modelType = device.details?.properties?.reported?.modelType || 'Unknown';
                let magnitude = voltage > 0 ? voltage / 100 : 1;
                let colorProperty = 'isConnected';
                if (activeFilters.includes('thd')) {
                    magnitude = thd > 0 ? thd / 5 : 1;
                    colorProperty = 'thdColor';
                } else if (activeFilters.includes('signal')) {
                    magnitude = signalStrength > 0 ? signalStrength / 20 : 1;
                    colorProperty = 'signalColor';
                }
                // Add degraded property
                const isDegraded = device.connectionState !== "Connected" && device.connectionState !== "Disconnected";
                return new atlas.data.Feature(
                    new atlas.data.Point([parseFloat(longitude), parseFloat(latitude)]),
                    {
                        deviceId: device.deviceId,
                        name: name || device.deviceId,
                        type: type || 'Unknown',
                        status: device.connectionState || 'Unknown',
                        isConnected: isConnected,
                        degraded: isDegraded,
                        voltage: voltage,
                        magnitude: magnitude,
                        thd: thd,
                        signalStrength: signalStrength,
                        modelType: modelType,
                        thdColor: thd > 5 ? true : false,
                        signalColor: signalStrength > 70 ? true : false
                    }
                );
            });
            setPointCollection(points);
        } catch (error) {
            console.error("Error creating data points:", error);
        }
    }, [devices, devicesLoaded, activeFilters]);

    // Adjust map view to fit all points
    useEffect(() => {
        if (!mapRef || !mapReady || pointCollection.length === 0) return;
        try {
            if (typeof mapRef.setCamera !== 'function') return;
            if (pointCollection.length === 1) {
                const point = pointCollection[0].geometry.coordinates;
                mapRef.setCamera({
                    center: point,
                    zoom: 14
                });
            } else {
                const points = pointCollection.map(point => {
                    const coords = point.geometry.coordinates;
                    return new atlas.data.Position(coords[0], coords[1]);
                });
                const boundingBox = atlas.data.BoundingBox.fromPositions(points);
                mapRef.setCamera({
                    bounds: boundingBox,
                    padding: 100
                });
            }
        } catch (error) {
            console.error("Error adjusting map view:", error);
        }
    }, [mapRef, mapReady, pointCollection]);

    // Add HTML markers for individual devices
    useEffect(() => {
        if (!mapRef || !mapReady || !mapRef.markers) return;
        mapRef.markers.clear();
        pointCollection.forEach(feature => {
            const props = feature.properties;
            if (!props.point_count) {
                const [lng, lat] = feature.geometry.coordinates;
                const color =
                    props.isConnected
                        ? "#22c55e"
                        : props.status === "Disconnected"
                            ? "#ef4444"
                            : "#facc15";
                const marker = new atlas.HtmlMarker({
                    position: [lng, lat],
                    htmlContent: createCircleMarker(color),
                    anchor: "center"
                });
                const htmlContent = marker.getOptions().htmlContent;
                if (htmlContent instanceof HTMLElement) {
                    htmlContent.onclick = (e: any) => {
                        e.stopPropagation();
                        const device = devices.find(d => d.deviceId === props.deviceId);
                        if (device) onDeviceClick(device);
                    };
                    if (onDeviceHover) {
                        htmlContent.onmouseenter = (e: any) => {
                            const device = devices.find(d => d.deviceId === props.deviceId);
                            if (device) onDeviceHover(device, e);
                        };
                        htmlContent.onmouseleave = (e: any) => {
                            onDeviceHover(null, e);
                        };
                    }
                }
                mapRef.markers.add(marker);
            }
        });
    }, [mapRef, mapReady, pointCollection, devices, onDeviceClick, onDeviceHover]);

    /**
     * Bubble layer options for individual device points.
     */
    const bubbleLayerOptions = useMemo(() => ({
        radius: [
            'interpolate',
            ['linear'],
            ['get', 'magnitude'],
            0, 5,
            5, 15,
            10, 30
        ],
        color: [
            'case',
            ['get', 'isConnected'], 'rgba(34,197,94,0.7)', // green
            ['==', ['get', 'status'], 'Disconnected'], 'rgba(239,68,68,0.7)', // red
            'rgba(250,204,21,0.7)' // yellow for Degraded
        ],
        strokeColor: [
            'case',
            ['get', 'isConnected'], 'rgb(22,163,74)', // green
            ['==', ['get', 'status'], 'Disconnected'], 'rgb(220,38,38)', // red
            'rgb(202,138,4)' // yellow for Degraded
        ],
        strokeWidth: 2,
        opacity: 0.8,
        filter: ['!', ['has', 'point_count']]
    }), [activeFilters]);

    /**
     * Bubble layer options for clusters.
     */
    const clusterBubbleLayerOptions = useMemo(() => ({
        radius: [
            'step',
            ['get', 'point_count'],
            25,
            10,
            35,
            25,
            45,
            50,
            55
        ],
        color: [
            'step',
            ['get', 'point_count'],
            'rgba(0, 102, 255, 0.8)',
            10,
            'rgba(255, 165, 0, 0.8)',
            25,
            'rgba(255, 0, 0, 0.8)'
        ],
        strokeColor: 'white',
        strokeWidth: 2,
        opacity: 0.8,
        filter: ['has', 'point_count']
    }), []);

    /**
     * Symbol layer options for cluster count labels.
     */
    const clusterSymbolLayerOptions = useMemo(() => ({
        iconOptions: {
            image: 'none'
        },
        textOptions: {
            textField: ['get', 'point_count_abbreviated'],
            size: 12,
            font: ['StandardFont-Bold'],
            offset: [0, 0.1],
            color: 'white',
            haloColor: 'black',
            haloWidth: 1
        },
        filter: ['has', 'point_count']
    }), []);

    /**
     * Map controls configuration.
     */
    const controls = useMemo(() => [
        {
            controlName: "ZoomControl",
            options: { position: "top-right" } as ControlOptions,
        },
    ], []);

    /**
     * Data source options for clustering.
     */
    const dataSourceOptions = useMemo(() => ({
        cluster: true,
        clusterRadius: 45,
        clusterMaxZoom: 15,
        clusterProperties: {
            connectedCount: ['+', ['case', ['get', 'isConnected'], 1, 0]],
            avgVoltage: ['/', ['+', ['get', 'voltage']], ['get', 'point_count']]
        }
    }), []);

    /**
     * Handles click events on clusters to zoom in.
     * @param e - Event object from Azure Maps.
     */
    const handleClusterClick = (e: any) => {
        try {
            if (e?.shapes?.[0]?.properties?.cluster) {
                const cluster = e.shapes[0];
                const coordinates = cluster.geometry.coordinates;
                const clusterId = cluster.properties.cluster_id;
                if (e.source?.getClusterExpansionZoom) {
                    e.source.getClusterExpansionZoom(clusterId).then((zoom: number) => {
                        if (e.map?.setCamera) {
                            e.map.setCamera({
                                center: coordinates,
                                zoom: zoom,
                                type: 'ease',
                                duration: 500
                            });
                        }
                    });
                } else if (e.map) {
                    const currentZoom = e.map.getCamera().zoom;
                    e.map.setCamera({
                        center: coordinates,
                        zoom: currentZoom + 1,
                        type: 'ease',
                        duration: 500
                    });
                }
            }
        } catch (error) {
            console.error("Error handling cluster click:", error);
        }
    };

    /**
     * Handles click events on individual device markers.
     * @param e - Event object from Azure Maps.
     */
    const handleDeviceClick = (e: any) => {
        const properties = e.shapes?.[0]?.getProperties();
        if (properties?.deviceId) {
            const device = devices.find(d => d.deviceId === properties.deviceId);
            if (device) {
                onDeviceClick(device);
            }
        }
    };

    /**
     * Handles mouse over events on device markers.
     * @param e - Event object from Azure Maps.
     */
    const handleDeviceMouseOver = (e: any) => {
        const properties = e.shapes?.[0]?.getProperties();
        if (properties?.deviceId && onDeviceHover) {
            const device = devices.find(d => d.deviceId === properties.deviceId);
            if (device) {
                onDeviceHover(device, e);
            }
        }
    };

    /**
     * Handles mouse out events on device markers.
     */
    const handleDeviceMouseOut = () => {
        if (onDeviceHover) {
            onDeviceHover(null, null);
        }
    };

    // --- Render ---
    return (
        <>
            {mapOptions ? (
                <AzureMapsProvider>
                    <div className="h-full w-full relative">
                        <AzureMap
                            options={mapOptions}
                            events={{
                                ready: (map) => {
                                    setMapRef(map);
                                    setMapReady(true);
                                }
                            }}
                        >
                            {pointCollection.length > 0 && (
                                <AzureMapDataSourceProvider
                                    id="deviceDataSource"
                                    collection={pointCollection}
                                    options={dataSourceOptions}
                                >
                                    {/* Individual device points (BubbleLayer, but visually replaced by HTML markers) */}
                                    <AzureMapLayerProvider
                                        id="individualPointLayer"
                                        options={bubbleLayerOptions}
                                        events={{
                                            click: handleDeviceClick,
                                            mouseover: handleDeviceMouseOver,
                                            mouseout: handleDeviceMouseOut
                                        }}
                                        type="BubbleLayer"
                                    />
                                    {/* Device clusters */}
                                    <AzureMapLayerProvider
                                        id="clusterBubbleLayer"
                                        options={clusterBubbleLayerOptions}
                                        events={{
                                            click: handleClusterClick
                                        }}
                                        type="BubbleLayer"
                                    />
                                    {/* Cluster count labels */}
                                    <AzureMapLayerProvider
                                        id="clusterSymbolLayer"
                                        options={clusterSymbolLayerOptions}
                                        type="SymbolLayer"
                                    />
                                </AzureMapDataSourceProvider>
                            )}
                        </AzureMap>
                        {loading && <LoadingSpinner />}
                    </div>
                </AzureMapsProvider>
            ) : (
                <LoadingSpinner />
            )}
        </>
    );
}