using System;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using System.Threading.Tasks;
using Azure.DigitalTwins.Core;
using Azure.Identity;
using Microsoft.Extensions.Configuration;

namespace GridWatchAdtApi.Services
{
    public interface IAdtService
    {
        Task<string> GetTwinAsync(string twinId);
        Task<string> QueryTwinsAsync(string query);
    }

    public class AdtService : IAdtService
    {
        private readonly DigitalTwinsClient _dtClient;

        public AdtService(IConfiguration config, IWebHostEnvironment env)
        {
            var endpoint = env.IsDevelopment()
                ? config["ApplicationSettings:ADTInstanceUrl"]
                : Environment.GetEnvironmentVariable("ADT_INSTANCE_URL");

            if (string.IsNullOrWhiteSpace(endpoint))
                throw new Exception(
                    "❌ ADT endpoint is missing from environment variables or configuration."
                );

            _dtClient = new DigitalTwinsClient(new Uri(endpoint), new DefaultAzureCredential());
        }

        public async Task<string> GetTwinAsync(string twinId)
        {
            var twin = await _dtClient.GetDigitalTwinAsync<string>(twinId);
            return twin.Value;
        }

        public async Task<string> QueryTwinsAsync(string query)
        {
            var queryResult = _dtClient.QueryAsync<JsonElement>(query);
            using var ms = new MemoryStream();
            await JsonSerializer.SerializeAsync(ms, queryResult);
            return System.Text.Encoding.UTF8.GetString(ms.ToArray());
        }
    }
}
