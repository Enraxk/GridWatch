using System;
using System.Reflection;
using Azure.Identity;
using GridWatchDeviceApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Azure.Devices;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ✅ Load Configuration (Environment Variables + appsettings.json fallback)
var configuration = builder.Configuration;

// ✅ Get Frontend URLs from Environment Variables (Fallback to appsettings.json)
string frontendUrls =
    Environment.GetEnvironmentVariable("GRIDWATCH_FRONTEND_URL")
    ?? configuration["Cors:AllowedOrigins"]
    ?? string.Empty; // Ensures no null assignment

if (string.IsNullOrEmpty(frontendUrls) && builder.Environment.IsDevelopment())
{
    frontendUrls = "http://localhost:3000"; // Default for local testing
    Console.WriteLine(
        "⚠️ WARNING: No GRIDWATCH_FRONTEND_URL set. Using default: http://localhost:3000"
    );
}

if (string.IsNullOrEmpty(frontendUrls))
{
    throw new Exception("❌ FRONTEND URL NOT SET!");
}

string[] allowedOrigins = frontendUrls.Split(
    ',',
    StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries
);

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "DynamicCors",
        policy =>
        {
            policy.WithOrigins(allowedOrigins).AllowAnyMethod().AllowAnyHeader().AllowCredentials();
        }
    );
});

// ✅ IoT Hub Hostname from Environment Variables (Fallback to appsettings.json)
string iotHubHost =
    Environment.GetEnvironmentVariable("IOT_HUB_HOSTNAME")
    ?? configuration["ApplicationSettings:IoTHubHostname"]
    ?? string.Empty; // Ensures no null assignment

if (string.IsNullOrEmpty(iotHubHost))
{
    throw new Exception("❌ IoT Hub hostname not set!");
}

Console.WriteLine($"🔍 Connecting to IoT Hub: {iotHubHost}");

// ✅ Authenticate IoT Hub using Managed Identity (if running in Azure) or use local credentials
// ✅ Ensure RegistryManager is a Singleton
builder.Services.AddSingleton(provider =>
{
    string iotHubHost =
        Environment.GetEnvironmentVariable("IOT_HUB_HOSTNAME")
        ?? configuration["ApplicationSettings:IoTHubHostname"]
        ?? throw new Exception("❌ IoT Hub hostname not set!");

    Console.WriteLine($"🔍 Connecting to IoT Hub: {iotHubHost}");

    if (builder.Environment.IsDevelopment())
    {
        Console.WriteLine("⚙️ Running Locally: Using Connection String for IoT Hub.");
        string iotConnectionString =
            configuration["ApplicationSettings:IoTHubConnectionString"]
            ?? throw new Exception("❌ IoT Hub connection string missing from appsettings.json!");

        return RegistryManager.CreateFromConnectionString(iotConnectionString);
    }
    else
    {
        Console.WriteLine("🔐 Running in Azure: Using Managed Identity for IoT Hub.");
        return RegistryManager.Create(iotHubHost, new DefaultAzureCredential());
    }
});


// ✅ Register IoT Device Service
builder.Services.AddScoped<IIotDeviceService, IotDeviceService>();

// ✅ Azure AD Authentication & Authorization (Environment Variables + appsettings.json fallback)
string azureTenantId =
    Environment.GetEnvironmentVariable("AZURE_TENANT_ID")
    ?? configuration["AzureAd:TenantId"]
    ?? throw new Exception("❌ AZURE_TENANT_ID not set!");

string portalClientId =
    Environment.GetEnvironmentVariable("PORTAL_CLIENT_ID")
    ?? configuration["AzureAd:PortalClientId"] // ✅ Correct Key
    ?? throw new Exception("❌ PORTAL_CLIENT_ID not set!");

Console.WriteLine(
    $"🔐 Configuring Authentication: TenantID={azureTenantId}, ClientID={portalClientId}"
);

builder
    .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://login.microsoftonline.com/{azureTenantId}/v2.0";
        options.Audience = portalClientId;
    });

if (builder.Environment.IsProduction())
{
    builder.Services.AddAuthorization(options =>
    {
        options.FallbackPolicy = new AuthorizationPolicyBuilder()
            .RequireAuthenticatedUser()
            .Build();
    });
}
else
{
    builder.Services.AddAuthorization(); // Allow anonymous in local/dev
}

// ✅ Controllers & Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();


builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc(
        "v1",
        new OpenApiInfo
        {
            Title = "GridWatch Device API",
            Version = "v1",
            Description = "API for managing IoT devices in GridWatch.",
        }
    );

    // ✅ Enable JWT Authentication in Swagger
    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Enter 'Bearer {your_token}'",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
    };

    options.AddSecurityDefinition("Bearer", securityScheme);
    options.AddSecurityRequirement(
        new OpenApiSecurityRequirement { { securityScheme, new string[] { } } }
    );

    // ✅ Include XML comments from the generated documentation file
    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFilename);
    options.IncludeXmlComments(xmlPath);
});

var app = builder.Build();

app.UseCors("DynamicCors");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/", () => "🚀 GridWatch Device API is running!").WithName("Home");
app.MapControllers();

app.Run();
