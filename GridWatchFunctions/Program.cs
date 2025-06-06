using System;
using Azure.DigitalTwins.Core;
using Azure.Identity;
using Azure.Messaging.EventHubs.Producer;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

// Program.cs for .NET 8 Isolated Azure Functions using Managed Identity
var host = Host.CreateDefaultBuilder(args)
    .ConfigureFunctionsWorkerDefaults() // ✅ Correct configuration for isolated Azure Functions
    .ConfigureAppConfiguration(
        (context, config) =>
        {
            // ✅ Load environment variables (e.g., ADT_INSTANCE_URL, IOTHUB_CONNECTION)
            config.AddEnvironmentVariables();
        }
    )
    .ConfigureServices(
        (context, services) =>
        {
            var configuration = context.Configuration;

            // ✅ Retrieve Azure Digital Twins (ADT) endpoint from environment variables
            var adtEndpoint =
                configuration["ADT_INSTANCE_URL"]
                ?? throw new InvalidOperationException(
                    "❌ ADT_INSTANCE_URL is not set in configuration."
                );

            // ✅ Retrieve IoT Hub connection string (for Event Hub Producer) from environment variables
            var eventHubConnection =
                configuration["IOTHUB_CONNECTION"]
                ?? throw new InvalidOperationException("❌ IOTHUB_CONNECTION is not set.");

            // ✅ Build SQL connection using Managed Identity (no password in production)
            var sqlServer =
                configuration["SQL_SERVER_NAME"]
                ?? throw new InvalidOperationException("❌ SQL_SERVER_NAME is not set.");
            var sqlDatabase =
                configuration["SQL_DATABASE_NAME"]
                ?? throw new InvalidOperationException("❌ SQL_DATABASE_NAME is not set.");

            var sqlConnectionString =
                $"Server=tcp:{sqlServer}.database.windows.net,1433;"
                + $"Database={sqlDatabase};"
                + "Authentication=Active Directory Default;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;";

            // ✅ Add DigitalTwinsClient using Managed Identity
            services.AddSingleton(
                new DigitalTwinsClient(new Uri(adtEndpoint), new DefaultAzureCredential())
            );

            // ✅ Add EventHubProducerClient (e.g., for forwarding telemetry)
            services.AddSingleton(_ => new EventHubProducerClient(eventHubConnection));

            // ✅ Add SQL connection using Managed Identity
            services.AddTransient(_ => new SqlConnection(sqlConnectionString));
        }
    )
    .Build();

// ✅ Run the configured Azure Functions host
host.Run();

public class IotHubConnection
{
    public string ConnectionString { get; set; } = string.Empty;
}
