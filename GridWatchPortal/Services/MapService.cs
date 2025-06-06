using System.Collections.Concurrent;
using GridWatchPortal.Dtos.Map;
using GridWatchPortal.Interfaces;
using Microsoft.Extensions.Logging;

namespace GridWatchPortal.Services
{
    /// <summary>
    /// Service responsible for providing map-related data including substations and heatmaps.
    /// Simulates a grid with multiple substations across Ireland with varying statuses and measurements.
    /// </summary>
    public class MapService : IMapService
    {
        private readonly ILogger<MapService> _logger;
        private static readonly ConcurrentBag<SubstationDto> _persistentSubstations = new();
        private static readonly DateTime _initialCreationTime = DateTime.UtcNow;
        private static readonly object _initLock = new();
        private static bool _isInitialized = false;
        private static readonly Random _rand = new();

        // Define coordinates covering more of Ireland (roughly corners and major cities)
        private static readonly (string name, double lat, double lon)[] _locations = new[]
        {
            (name: "Dublin", lat: 53.35, lon: -6.26),
            (name: "Cork", lat: 51.90, lon: -8.47),
            (name: "Galway", lat: 53.27, lon: -9.05),
            (name: "Limerick", lat: 52.66, lon: -8.63),
            (name: "Waterford", lat: 52.26, lon: -7.11),
            (name: "Belfast", lat: 54.60, lon: -5.93),
            (name: "Derry", lat: 54.99, lon: -7.32),
            (name: "Sligo", lat: 54.27, lon: -8.47),
            (name: "Kilkenny", lat: 52.65, lon: -7.25),
            (name: "Athlone", lat: 53.42, lon: -7.94),
        };

        /// <summary>
        /// Initializes a new instance of the <see cref="MapService"/> class.
        /// </summary>
        /// <param name="logger">The logger used for diagnostic information.</param>
        public MapService(ILogger<MapService> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Determines if a geographic coordinate is likely to be on land in Ireland.
        /// Uses a simple polygon approximation to exclude water areas.
        /// </summary>
        /// <param name="lat">Latitude of the point to check.</param>
        /// <param name="lon">Longitude of the point to check.</param>
        /// <returns>True if the point is likely on land; otherwise, false.</returns>
        private static bool IsLikelyOnLand(double lat, double lon)
        {
            // Simple polygon approximation to avoid water
            // West coast exclusion
            if (lon < -10.0)
                return false;
            if (lon < -9.7 && lat > 53.0)
                return false;
            if (lon < -9.5 && lat < 52.0)
                return false;

            // East coast exclusion
            if (lon > -6.0 && lat < 52.0)
                return false;
            if (lon > -5.5 && lat > 53.8)
                return false;

            // North constraint
            if (lat > 55.4)
                return false;

            // South constraint
            if (lat < 51.4)
                return false;

            // Dublin Bay
            if (lon > -6.0 && lon < -5.9 && lat > 53.2 && lat < 53.4)
                return false;

            return true;
        }

        /// <summary>
        /// Initializes a collection of simulated substations if not already done.
        /// Creates 1000 substations with randomized properties spread around key locations in Ireland.
        /// Thread-safe method that ensures initialization happens only once.
        /// </summary>
        private static void InitializeSubstations()
        {
            if (_isInitialized)
                return;

            lock (_initLock)
            {
                if (_isInitialized)
                    return;

                for (int i = 0; i < 1000; i++)
                {
                    // Choose a random location as base
                    var baseLocation = _locations[_rand.Next(_locations.Length)];

                    // Add some randomness to spread devices around each location
                    double lat,
                        lon;
                    int attempts = 0;

                    // Generate positions until we find one on land
                    do
                    {
                        var spreadFactor = 0.3; // Degrees (~20-30km)
                        lat =
                            baseLocation.lat
                            + (_rand.NextDouble() * spreadFactor * 2 - spreadFactor);
                        lon =
                            baseLocation.lon
                            + (_rand.NextDouble() * spreadFactor * 2 - spreadFactor);
                        attempts++;

                        // Safety break
                        if (attempts > 10)
                        {
                            // Fall back to the base location
                            lat = baseLocation.lat;
                            lon = baseLocation.lon;
                            break;
                        }
                    } while (!IsLikelyOnLand(lat, lon));

                    // Initial values
                    var voltage = 230 + _rand.NextDouble() * 20;
                    var activePower = _rand.NextDouble() * 8 - 3; // -3 to +5

                    // Consumers vs producers
                    if (i < 800)
                        activePower = Math.Abs(activePower); // Consumer
                    else
                        activePower = -Math.Abs(activePower); // Renewable

                    // Initial status - all start as connected
                    string status = "Connected";

                    // Create the persistent device
                    var substation = new SubstationDto
                    {
                        SubstationId = $"sub-{i:D4}",
                        Name = $"{baseLocation.name} Substation {i % 100}",
                        Type = i % 2 == 0 ? "Pole-mounted" : "Ground-mounted",
                        Latitude = lat,
                        Longitude = lon,
                        Status = status,
                        CreatedAt = _initialCreationTime,
                        SignalStrength = 70 + _rand.Next(0, 31), // 70-100
                        Feeders = new List<FeederDto>
                        {
                            new FeederDto
                            {
                                FeederId = $"f{i}",
                                CustomerCount = 25 + (i % 10),
                                Phases = new List<PhaseDto>
                                {
                                    new PhaseDto
                                    {
                                        PhaseName = "1",
                                        Voltage = voltage,
                                        Current = 10 + _rand.NextDouble() * 5,
                                        ActivePower = activePower,
                                        LastUpdated = DateTime.UtcNow,
                                        ThD = 2.5 + _rand.NextDouble() * 2.0,
                                    },
                                    new PhaseDto
                                    {
                                        PhaseName = "2",
                                        Voltage = voltage - 1.5,
                                        Current = 9 + _rand.NextDouble() * 5,
                                        ActivePower = activePower * 0.95,
                                        LastUpdated = DateTime.UtcNow,
                                        ThD = 2.5 + _rand.NextDouble() * 2.0,
                                    },
                                    new PhaseDto
                                    {
                                        PhaseName = "3",
                                        Voltage = voltage + 1.2,
                                        Current = 11 + _rand.NextDouble() * 5,
                                        ActivePower = activePower * 1.05,
                                        LastUpdated = DateTime.UtcNow,
                                        ThD = 2.5 + _rand.NextDouble() * 2.0,
                                    },
                                },
                            },
                        },
                        Properties = new Dictionary<string, object>
                        {
                            ["reported"] = new Dictionary<string, object>
                            {
                                ["firmware"] = "v1.2.3",
                                ["model"] = i % 3 == 0 ? "GridSense 2000" : "PowerMonitor 3500",
                                ["serialNumber"] = $"GW{i:D6}",
                                ["lastMaintenance"] = DateTime
                                    .UtcNow.AddDays(-_rand.Next(10, 90))
                                    .ToString("yyyy-MM-dd"),
                                ["installDate"] = _initialCreationTime
                                    .AddDays(-_rand.Next(100, 1000))
                                    .ToString("yyyy-MM-dd"),
                                ["signalStrength"] = 70 + _rand.Next(0, 31), // 70-100
                            },
                        },
                    };

                    _persistentSubstations.Add(substation);
                }

                _isInitialized = true;
            }
        }

        /// <summary>
        /// Retrieves substation mapping data including locations and various heatmap layers.
        /// Updates each substation with new simulated values based on probabilistic status changes.
        /// </summary>
        /// <returns>
        /// A task that represents the asynchronous operation, containing the <see cref="SubstationMappingDto"/>
        /// with updated substation information and relevant heatmap data.
        /// </returns>
        public async Task<SubstationMappingDto> GetSubstationMappingsAsync()
        {
            // Initialize our substations if this is the first run
            if (!_isInitialized)
            {
                InitializeSubstations();
            }

            var response = new SubstationMappingDto();

            // For random updates
            double disconnectionChance = 0.12; // 12% chance to be disconnected
            double degradedChance = 0.08; // 8% chance to be degraded

            // Update each device with new values but keep positions the same
            foreach (var substation in _persistentSubstations)
            {
                // Update status based on probability
                double statusRoll = _rand.NextDouble();
                string newStatus;

                if (statusRoll < disconnectionChance)
                    newStatus = "Disconnected";
                else if (statusRoll < disconnectionChance + degradedChance)
                    newStatus = "Degraded";
                else
                    newStatus = "Connected";

                // Status might have changed - update it
                substation.Status = newStatus;

                // Update signal strength with some natural variation (± 5%)
                int signalChange = _rand.Next(-5, 6);
                substation.SignalStrength = Math.Max(
                    0,
                    Math.Min(100, substation.SignalStrength + signalChange)
                );
                (
                    (Dictionary<string, object>)(
                        (Dictionary<string, object>)substation.Properties["reported"]
                    )
                )["signalStrength"] = substation.SignalStrength;

                // Update phase data for connected devices
                foreach (var feeder in substation.Feeders)
                {
                    foreach (var phase in feeder.Phases)
                    {
                        if (newStatus == "Connected")
                        {
                            // Small variations for connected devices
                            double voltageVariation = _rand.NextDouble() * 6 - 3; // -3V to +3V
                            double currentVariation = _rand.NextDouble() * 2 - 1; // -1A to +1A
                            double powerVariation = _rand.NextDouble() * 0.8 - 0.4; // -0.4 to +0.4 kW

                            phase.Voltage += voltageVariation;
                            phase.Current += currentVariation;
                            phase.ActivePower += powerVariation;
                            phase.ThD += (_rand.NextDouble() * 0.4 - 0.2); // Small THD variations
                            phase.LastUpdated = DateTime.UtcNow;
                        }
                        else if (newStatus == "Degraded")
                        {
                            // More unstable readings for degraded devices
                            double voltageVariation = _rand.NextDouble() * 10 - 5; // -5V to +5V
                            double currentVariation = _rand.NextDouble() * 4 - 2; // -2A to +2A

                            phase.Voltage += voltageVariation;
                            phase.Current += currentVariation;
                            // Degraded devices might still be providing power, but less reliably
                            phase.ActivePower *= (0.7 + _rand.NextDouble() * 0.3); // 70%-100% of normal power
                            phase.ThD += _rand.NextDouble() * 1 - 0.5; // More THD variability
                            phase.LastUpdated = DateTime.UtcNow;
                        }
                        else
                        {
                            // Disconnected devices have no power, and stale timestamps
                            phase.ActivePower = 0;
                            // Don't update timestamp for disconnected devices
                        }
                    }
                }

                // Add to response
                response.Substations.Add(substation);

                // Only add connected and some degraded substations to heatmaps
                if (
                    newStatus == "Disconnected"
                    || (newStatus == "Degraded" && _rand.NextDouble() < 0.7)
                )
                    continue;

                // Extract values we need for heatmaps
                var voltage = substation.Feeders[0].Phases[0].Voltage ?? 0;
                var thd = substation.Feeders[0].Phases[0].ThD;
                var activePower = substation.Feeders[0].Phases[0].ActivePower ?? 0;
                var lat = substation.Latitude;
                var lon = substation.Longitude;

                // High voltage heatmap logic
                if (voltage > 240)
                {
                    var highVoltageLayer = response.Heatmaps.FirstOrDefault(h =>
                        h.Name == "Overvoltage Regions"
                    );
                    if (highVoltageLayer == null)
                    {
                        highVoltageLayer = new HeatmapLayer
                        {
                            Name = "Overvoltage Regions",
                            Threshold = 240,
                        };
                        response.Heatmaps.Add(highVoltageLayer);
                    }

                    highVoltageLayer.Points.Add(
                        new HeatmapPoint
                        {
                            Latitude = lat,
                            Longitude = lon,
                            Value = voltage,
                        }
                    );
                }

                // THD heatmap logic
                if (thd > 3.75)
                {
                    var thdLayer = response.Heatmaps.FirstOrDefault(h =>
                        h.Name == "THD Over Voltage"
                    );
                    if (thdLayer == null)
                    {
                        thdLayer = new HeatmapLayer { Name = "THD Over Voltage", Threshold = 3.75 };
                        response.Heatmaps.Add(thdLayer);
                    }

                    thdLayer.Points.Add(
                        new HeatmapPoint
                        {
                            Latitude = lat,
                            Longitude = lon,
                            Value = thd,
                        }
                    );
                }

                // Grid Consumption Hotspots
                if (activePower > 0)
                {
                    var consumptionLayer = response.Heatmaps.FirstOrDefault(h =>
                        h.Name == "Grid Consumption"
                    );
                    if (consumptionLayer == null)
                    {
                        consumptionLayer = new HeatmapLayer
                        {
                            Name = "Grid Consumption",
                            Threshold = 0,
                        };
                        response.Heatmaps.Add(consumptionLayer);
                    }

                    consumptionLayer.Points.Add(
                        new HeatmapPoint
                        {
                            Latitude = lat,
                            Longitude = lon,
                            Value = activePower,
                        }
                    );
                }

                // Renewable Export Hotspots
                if (activePower < 0)
                {
                    var renewableLayer = response.Heatmaps.FirstOrDefault(h =>
                        h.Name == "Renewable Export"
                    );
                    if (renewableLayer == null)
                    {
                        renewableLayer = new HeatmapLayer
                        {
                            Name = "Renewable Export",
                            Threshold = 0,
                        };
                        response.Heatmaps.Add(renewableLayer);
                    }

                    renewableLayer.Points.Add(
                        new HeatmapPoint
                        {
                            Latitude = lat,
                            Longitude = lon,
                            Value = Math.Abs(activePower), // Use absolute value for visualization
                        }
                    );
                }
            }

            await Task.Delay(10); // Simulated async
            return response;
        }
    }
}
