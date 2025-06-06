using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.Threading;
using System.Threading.Tasks;
using Azure.Identity;
using GridWatchAdxApi.Models;
using Kusto.Data;
using Kusto.Data.Common;
using Kusto.Data.Net.Client;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace GridWatchAdxApi.Services
{
    public interface IAdxQueryService
    {
        Task<List<ThreePhaseReading>> GetSubstationVoltagesAsync(
            string substationId,
            DateTime startTime,
            DateTime endTime
        );
    }

    public class AdxQueryService : IAdxQueryService
    {
        private readonly ICslQueryProvider _queryProvider;
        private readonly string _database;

        public AdxQueryService(IConfiguration config, IWebHostEnvironment env)
        {
            string cluster;
            string database;

            if (env.IsDevelopment())
            {
                cluster =
                    config["ApplicationSettings:ADXClusterUrl"]
                    ?? throw new Exception("ADXClusterUrl missing");
                database =
                    config["ApplicationSettings:ADXDatabase"]
                    ?? throw new Exception("ADXDatabase missing");
                var kcsb = new KustoConnectionStringBuilder(
                    cluster
                ).WithAadApplicationKeyAuthentication(
                    config["ApplicationSettings:ADXClientId"],
                    config["ApplicationSettings:ADXApplicationKey"],
                    config["ApplicationSettings:ADXAuthority"]
                );
                _queryProvider = KustoClientFactory.CreateCslQueryProvider(kcsb);
            }
            else
            {
                cluster =
                    Environment.GetEnvironmentVariable("ADX_CLUSTER_URL")
                    ?? throw new Exception("ADX_CLUSTER_URL not set");
                database =
                    Environment.GetEnvironmentVariable("ADX_DATABASE_NAME")
                    ?? throw new Exception("ADX_DATABASE_NAME not set");
                var kcsb = new KustoConnectionStringBuilder(cluster).WithAadSystemManagedIdentity();
                _queryProvider = KustoClientFactory.CreateCslQueryProvider(kcsb);
            }

            _database = database;
        }

        public async Task<List<ThreePhaseReading>> GetSubstationVoltagesAsync(
            string substationId,
            DateTime startTime,
            DateTime endTime
        )
        {
            var readings = new List<ThreePhaseReading>();
            var formatStart = startTime.ToString(
                "yyyy-MM-ddTHH:mm:ss",
                CultureInfo.InvariantCulture
            );
            var formatEnd = endTime.ToString("yyyy-MM-ddTHH:mm:ss", CultureInfo.InvariantCulture);

            var query = string.Join(
                "\n",
                new[]
                {
                    "PowerGridTelemetry",
                    $"| where Location == 'Substation' and Identifier has '{substationId}' and isnotnull(Voltage)",
                    "| extend Voltage1 = iif(Phase == \"p1\", todouble(Voltage), double(null)),",
                    "         Voltage2 = iif(Phase == \"p2\", todouble(Voltage), double(null)),",
                    "         Voltage3 = iif(Phase == \"p3\", todouble(Voltage), double(null))",
                    $"| where Timestamp between (datetime({formatStart})..datetime({formatEnd}))",
                    "| summarize Phase1 = max(Voltage1),",
                    "           Phase2 = max(Voltage2),",
                    "           Phase3 = max(Voltage3)",
                    "           by Timestamp",
                    "| order by Timestamp asc",
                }
            );

            var props = new ClientRequestProperties();

            using var reader = await _queryProvider.ExecuteQueryAsync(
                _database,
                query,
                props,
                CancellationToken.None
            );
            var dataReader = (IDataReader)reader;

            while (dataReader.Read())
            {
                readings.Add(
                    new ThreePhaseReading
                    {
                        Timestamp = dataReader.GetDateTime(0),
                        Phase1 = dataReader.IsDBNull(1) ? null : dataReader.GetDouble(1),
                        Phase2 = dataReader.IsDBNull(2) ? null : dataReader.GetDouble(2),
                        Phase3 = dataReader.IsDBNull(3) ? null : dataReader.GetDouble(3),
                    }
                );
            }

            return readings;
        }
    }
}
