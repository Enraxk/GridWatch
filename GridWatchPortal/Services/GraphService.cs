using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GridWatchPortal.Dtos.Graphs;
using GridWatchPortal.Interfaces;
using Microsoft.Extensions.Logging;

namespace GridWatchPortal.Services
{
    public interface IGridWatchGraphService
    {
        Task<GraphDataResponseDto> GetGraphDataAsync(GraphQueryDto query);
    }

    public class GridWatchGraphService : IGridWatchGraphService
    {
        private readonly ILogger<GridWatchGraphService> _logger;
        private static readonly Random _rand = new();

        public GridWatchGraphService(ILogger<GridWatchGraphService> logger)
        {
            _logger = logger;
        }

        public async Task<GraphDataResponseDto> GetGraphDataAsync(GraphQueryDto query)
        {
            var seriesList = new List<GraphSeriesDto>();

            var from = query.Scale == "custom" && query.CustomFrom.HasValue
                ? query.CustomFrom.Value
                : DateTime.UtcNow.AddDays(-1);

            var to = query.Scale == "custom" && query.CustomTo.HasValue
                ? query.CustomTo.Value
                : DateTime.UtcNow;

            List<string> devices = (query.DeviceIds != null && query.DeviceIds.Any())
                ? query.DeviceIds.ToList()
                : new List<string> { "device-1" };

            bool isMultiDeviceMode = devices.Count > 1;

            foreach (var graphType in query.GraphTypes)
            {
                foreach (var deviceId in devices)
                {
                    switch (graphType)
                    {
                        case "Voltage":
                        case "Current":
                        case "Power":
                        case "Frequency":
                        case "Harmonics":
                            seriesList.AddRange(
                                SimulateThreePhasePerFeeder(
                                    graphType,
                                    graphType switch
                                    {
                                        "Voltage" => "V",
                                        "Current" => "A",
                                        "Power" => "kW",
                                        "Frequency" => "Hz",
                                        "Harmonics" => "%",
                                        _ => "",
                                    },
                                    from,
                                    to,
                                    deviceId,
                                    isMultiDeviceMode
                                )
                            );
                            break;

                        case "Temperature":
                            seriesList.Add(SimulateTemperatureSeries(from, to, deviceId));
                            break;
                    }
                }
            }

            await Task.Delay(50); // simulate latency

            return new GraphDataResponseDto
            {
                SubstationId = query.SubstationId,
                Grouped = query.GroupGraphs,
                TimeScale = query.Scale,
                Series = seriesList,
            };
        }

        private List<GraphSeriesDto> SimulateThreePhasePerFeeder(
            string type,
            string unit,
            DateTime from,
            DateTime to,
            string deviceId,
            bool isMultiDeviceMode
        )
        {
            bool isBusbarType = type is "Voltage" or "Frequency" or "Harmonics";
            var feeders = isBusbarType
                ? new[] { "busbar" }
                : new[] { "feeder-1", "feeder-2", "feeder-3" };
            var phases = new[] { "Phase 1", "Phase 2", "Phase 3" };

            var result = new List<GraphSeriesDto>();

            foreach (var feeder in feeders)
            {
                foreach (var phase in phases)
                {
                    var seriesName = isMultiDeviceMode
                        ? $"{deviceId} - {feeder} - {type} - {phase}"
                        : $"{type} - {phase}";

                    result.Add(
                        new GraphSeriesDto
                        {
                            GraphType = type,
                            SeriesName = seriesName,
                            Unit = unit,
                            FeederId = feeder,
                            DeviceId = deviceId,
                            DataPoints = GenerateTimeSeries(from, to, GetBaseValue(type)),
                        }
                    );
                }
            }

            return result;
        }

        private GraphSeriesDto SimulateTemperatureSeries(
            DateTime from,
            DateTime to,
            string deviceId
        )
        {
            return new GraphSeriesDto
            {
                GraphType = "Temperature",
                SeriesName = $"Temperature - {deviceId}",
                Unit = "°C",
                FeederId = "", // No feeder for temperature
                DeviceId = deviceId,
                DataPoints = GenerateTimeSeries(from, to, 25 + _rand.NextDouble() * 5),
            };
        }

        private List<GraphPointDto> GenerateTimeSeries(DateTime from, DateTime to, double baseValue)
        {
            var result = new List<GraphPointDto>();
            var step = TimeSpan.FromMinutes(15);

            for (var t = from; t <= to; t += step)
            {
                result.Add(
                    new GraphPointDto
                    {
                        Timestamp = t,
                        Value = baseValue + (_rand.NextDouble() * 5 - 2.5),
                    }
                );
            }

            return result;
        }

        private double GetBaseValue(string type)
        {
            return type switch
            {
                "Voltage" => 230 + _rand.NextDouble() * 10,
                "Current" => 10 + _rand.NextDouble() * 5,
                "Power" => 3 + _rand.NextDouble() * 2,
                "Frequency" => 49.5 + _rand.NextDouble(),
                "Harmonics" => 1 + _rand.NextDouble() * 3,
                _ => 0,
            };
        }
    }
}
