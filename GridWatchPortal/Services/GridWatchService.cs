using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using GridWatchPortal.Dtos;
using GridWatchPortal.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Identity.Web;

namespace GridWatchPortal.Services
{
    public class GridWatchService : IGridWatchService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ITokenAcquisition _tokenAcquisition;
        private readonly ILogger<GridWatchService> _logger;
        private readonly IConfiguration _configuration;

        public GridWatchService(
            IHttpClientFactory httpClientFactory,
            ITokenAcquisition tokenAcquisition,
            ILogger<GridWatchService> logger,
            IConfiguration configuration
        )
        {
            _httpClientFactory = httpClientFactory;
            _tokenAcquisition = tokenAcquisition;
            _logger = logger;
            _configuration = configuration;
        }

        public async Task<IEnumerable<object>> GetConnectedDevicesAsync()
        {
            try
            {
                var client = _httpClientFactory.CreateClient("DeviceApi");

                var userScope = $"api://{_configuration["AzureAd:ClientId"]}/user_impersonation";
                var appScope = $"api://{_configuration["AzureAd:ClientId"]}/.default";
                var clientSecret = _configuration["AzureAd:ClientSecret"];
                string accessToken;

                if (!string.IsNullOrEmpty(clientSecret))
                {
                    accessToken = await _tokenAcquisition.GetAccessTokenForAppAsync(appScope);
                }
                else
                {
                    accessToken = await _tokenAcquisition.GetAccessTokenForUserAsync(
                        new[] { userScope }
                    );
                }

                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
                    "Bearer",
                    accessToken
                );

                var response = await client.GetAsync("api/devices/connected");
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<IEnumerable<object>>(
                        json,
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                    ) ?? new List<object>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to fetch connected devices.");
                throw;
            }
        }

        public async Task<IEnumerable<ThreePhaseReadingDto>> GetSubstationVoltagesAsync(
            string substationId,
            DateTime startTime,
            DateTime endTime
        )
        {
            try
            {
                var client = _httpClientFactory.CreateClient("AdxApi");

                var userScope = $"api://{_configuration["AzureAd:ClientId"]}/user_impersonation";
                var appScope = $"api://{_configuration["AzureAd:ClientId"]}/.default";
                var clientSecret = _configuration["AzureAd:ClientSecret"];

                string accessToken = !string.IsNullOrEmpty(clientSecret)
                    ? await _tokenAcquisition.GetAccessTokenForAppAsync(appScope)
                    : await _tokenAcquisition.GetAccessTokenForUserAsync(new[] { userScope });

                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
                    "Bearer",
                    accessToken
                );

                // 🔧 This matches the ADX API route and expected query params
                var url =
                    $"api/adx/substation/voltages?substationId={Uri.EscapeDataString(substationId)}&start={Uri.EscapeDataString(startTime.ToString("o"))}&end={Uri.EscapeDataString(endTime.ToString("o"))}";

                var response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<IEnumerable<ThreePhaseReadingDto>>(
                        json,
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                    ) ?? new List<ThreePhaseReadingDto>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to fetch substation voltages.");
                throw;
            }
        }
    }
}
