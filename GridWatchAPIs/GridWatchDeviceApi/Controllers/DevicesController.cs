using GridWatchDeviceApi.Models;
using GridWatchDeviceApi.Services;
using GridWatchDeviceApi.Services.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GridWatchDeviceApi.Controllers
{
    [Route("api/devices")]
    [ApiController]
    //[Authorize("RequireAAD")] // Uncomment for authentication
    public class DevicesController : ControllerBase
    {
        private readonly IIotDeviceService _iotDeviceService;

        public DevicesController(IIotDeviceService iotDeviceService)
        {
            _iotDeviceService = iotDeviceService;
        }

        /// <summary>
        /// Retrieves all IoT devices that are currently registered.
        /// </summary>
        /// <returns>A list of all registered devices with basic details.</returns>
        [HttpGet]
        public async Task<IActionResult> GetAllDevices()
        {
            var devices = await _iotDeviceService.GetAllDevicesAsync();
            if (devices == null)
            {
                return Ok(new List<object>());
            }

            return Ok(
                devices
                    .Where(d => d != null)
                    .Select(d => new
                    {
                        DeviceId = d!.DeviceId,
                        ConnectionState = d.ConnectionState ?? "Unknown",
                        LastActivityTime = d.LastActivityTime,
                    })
            );
        }

        /// <summary>
        /// Retrieves all IoT devices that are currently connected.
        /// </summary>
        [HttpGet("connected")]
        public async Task<IActionResult> GetConnectedDevices()
        {
            var devices = await _iotDeviceService.GetDevicesByConnectionStateAsync("Connected");
            if (devices == null)
            {
                return Ok(new List<object>());
            }

            return Ok(
                devices
                    .Where(d => d != null)
                    .Select(d => new
                    {
                        DeviceId = d!.DeviceId,
                        ConnectionState = d.ConnectionState ?? "Unknown",
                        LastActivityTime = d.LastActivityTime,
                    })
            );
        }

        /// <summary>
        /// Retrieves all IoT devices that are currently disconnected.
        /// </summary>
        [HttpGet("disconnected")]
        public async Task<IActionResult> GetDisconnectedDevices()
        {
            var devices = await _iotDeviceService.GetDevicesByConnectionStateAsync("Disconnected");
            if (devices == null)
            {
                return Ok(new List<object>());
            }

            return Ok(
                devices
                    .Where(d => d != null)
                    .Select(d => new
                    {
                        DeviceId = d!.DeviceId,
                        ConnectionState = d.ConnectionState ?? "Unknown",
                        LastActivityTime = d.LastActivityTime,
                    })
            );
        }

        /// <summary>
        /// Retrieves full details of a specific device, including metadata and configurations.
        /// </summary>
        [HttpGet("{deviceId}")]
        public async Task<IActionResult> GetDevice(string deviceId)
        {
            try
            {
                var device = await _iotDeviceService.GetDevice(deviceId);
                if (device == null)
                    return NotFound($"Device {deviceId} not found.");

                return Ok(device);
            }
            catch (Exception ex)
            {
                return Problem($"Failed to retrieve device: {ex.Message}");
            }
        }

        /// <summary>
        /// Retrieves the device tags, which include metadata like alarm states and device model.
        /// </summary>
        [HttpGet("{deviceId}/tags")]
        public async Task<IActionResult> GetDeviceTags(string deviceId)
        {
            try
            {
                var tags = await _iotDeviceService.GetDeviceTags(deviceId);
                if (tags == null)
                    return NotFound($"Tags not found for device {deviceId}.");

                return Ok(tags);
            }
            catch (Exception ex)
            {
                return Problem($"Failed to retrieve device tags: {ex.Message}");
            }
        }

        /// <summary>
        /// Retrieves reported properties, which reflect the actual state of the device.
        /// </summary>
        [HttpGet("{deviceId}/reported")]
        public async Task<IActionResult> GetReportedProperties(string deviceId)
        {
            try
            {
                var reported = await _iotDeviceService.GetReportedPropertiesAsync(deviceId);
                if (reported == null)
                    return NotFound($"Reported properties not found for device {deviceId}.");

                return Ok(reported);
            }
            catch (Exception ex)
            {
                return Problem($"Failed to get reported properties: {ex.Message}");
            }
        }

        /// <summary>
        /// Retrieves desired properties, which represent the intended configuration for the device.
        /// </summary>
        [HttpGet("{deviceId}/desired")]
        public async Task<IActionResult> GetDesiredProperties(string deviceId)
        {
            try
            {
                var desired = await _iotDeviceService.GetDesiredPropertiesAsync(deviceId);
                if (desired == null)
                    return NotFound($"Desired properties not found for device {deviceId}.");

                return Ok(desired);
            }
            catch (Exception ex)
            {
                return Problem($"Failed to get desired properties: {ex.Message}");
            }
        }

        /// <summary>
        /// Updates the desired property settings for a device.
        /// </summary>
        [HttpPut("{deviceId}/desired")]
        public async Task<IActionResult> UpdateDesiredPropertiesAsync(
            string deviceId,
            [FromBody] DesiredProperties model
        )
        {
            try
            {
                await _iotDeviceService.UpdateDesiredPropertiesAsync(deviceId, model);
                return Ok(model);
            }
            catch (Exception ex)
            {
                return Problem($"Failed to update telemetry: {ex.Message}");
            }
        }

        /// <summary>
        /// Invokes a direct method on an IoT device.
        /// </summary>
        /// <param name="deviceId">The ID of the target IoT device.</param>
        /// <param name="request">The method name and payload to invoke.</param>
        /// <returns>The response from the device or an error if the device is unreachable.</returns>
        [HttpPost("{deviceId}/invoke")]
        public async Task<IActionResult> CallDeviceMethod(
            string deviceId,
            [FromBody] DirectMethodRequest request
        )
        {
            try
            {
                if (request == null)
                {
                    return BadRequest("Direct method request cannot be null.");
                }

                // Create the full DirectMethod object
                var method = new DirectMethod
                {
                    DeviceId = deviceId,
                    Method = request.Method,
                    Payload = request.Payload ?? "{}", // Ensure a default JSON object if null
                };

                var result = await _iotDeviceService.CallDirectMethodAsync(method);

                if (result == null)
                {
                    return NotFound($"Device {deviceId} not found or unreachable.");
                }

                return Ok(new { Status = result.Status, Payload = result.GetPayloadAsJson() });
            }
            catch (Exception ex)
            {
                return Problem($"Failed to invoke method on device {deviceId}: {ex.Message}");
            }
        }
    }
}
