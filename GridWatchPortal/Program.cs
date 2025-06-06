using GridWatchPortal.Interfaces;
using GridWatchPortal.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.FileProviders;
using Microsoft.Identity.Web;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

// ✅ Load configuration from environment variables or fallback to appsettings
string GetRequiredUrl(string key) =>
    configuration[key]
    ?? configuration[$"ApiUrls:{key}"]
    ?? throw new InvalidOperationException($"{key} is not configured.");

var frontendUrl =
    configuration["FRONTEND_URL"] ?? throw new InvalidOperationException("FRONTEND_URL not set");
var deviceApiUrl = GetRequiredUrl("DeviceApi");
var adxApiUrl = GetRequiredUrl("AdxApi");
var adtApiUrl = GetRequiredUrl("AdtApi");
var sqlApiUrl = GetRequiredUrl("SqlApi");
var blobStorageUrl = configuration["BLOB_STORAGE_URL"] ?? "";
var azureAudience =
    configuration["AzureAd:Audience"] ?? $"api://{configuration["AzureAd:ClientId"]}";

// Add this line just after loading other URLs
var mapsKey = configuration["AZURE_MAPS_KEY"] ?? configuration["AzureMaps:Key"] ?? "";

// ✅ Configure authentication with token acquisition support
builder
    .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(configuration.GetSection("AzureAd"))
    .EnableTokenAcquisitionToCallDownstreamApi()
    .AddInMemoryTokenCaches();

builder.Services.Configure<JwtBearerOptions>(
    JwtBearerDefaults.AuthenticationScheme,
    options =>
    {
        options.TokenValidationParameters.ValidAudience = azureAudience;
    }
);

// ✅ Authorization
builder.Services.AddAuthorization(options =>
{
    var defaultPolicy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
    options.DefaultPolicy = defaultPolicy;
});

// ✅ Register GridWatchService with IHttpClientFactory
builder.Services.AddScoped<IGridWatchService, GridWatchService>();
builder.Services.AddScoped<IMapService, MapService>();
builder.Services.AddScoped<IGridWatchGraphService, GridWatchGraphService>();
// ✅ Register named HttpClients for each API
builder.Services.AddHttpClient("DeviceApi", client => client.BaseAddress = new Uri(deviceApiUrl));
builder.Services.AddHttpClient("AdtApi", client => client.BaseAddress = new Uri(adtApiUrl));
builder.Services.AddHttpClient("AdxApi", client => client.BaseAddress = new Uri(adxApiUrl));
builder.Services.AddHttpClient("SqlApi", client => client.BaseAddress = new Uri(sqlApiUrl));

// ✅ CORS for React frontend
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(frontendUrl).AllowAnyHeader().AllowAnyMethod().AllowCredentials();
    });
});

// ✅ Add controllers and configuration access
builder.Services.AddControllers();
builder.Services.AddSingleton<IConfiguration>(configuration);

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles(
    new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(
            Path.Combine(app.Environment.ContentRootPath, "wwwroot")
        ),
        RequestPath = "",
    }
);

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ✅ Serve config.json for frontend MSAL setup
app.MapGet(
    "/config.json",
    (IConfiguration config) =>
    {
        var azureAd = config.GetSection("AzureAd");

        var clientId = azureAd["ClientId"];
        var tenantId = azureAd["TenantId"];
        var audience = azureAd["Audience"] ?? $"api://{clientId}";
        var mapsKey = config["AZURE_MAPS_KEY"] ?? config["AzureMaps:Key"] ?? "";

        return Results.Json(
            new
            {
                azureAd = new
                {
                    clientId,
                    tenantId,
                    authority = $"https://login.microsoftonline.com/{tenantId}",
                    redirectUri = config["FRONTEND_URL"],
                    scopes = new[] { $"{audience}/user_impersonation" },
                },
                apiUrls = new
                {
                    deviceApi = deviceApiUrl,
                    adtApi = adtApiUrl,
                    adxApi = adxApiUrl,
                    sqlApi = sqlApiUrl,
                },
                blobStorageUrl = blobStorageUrl,
                azureMapsKey = mapsKey, // ✅ Include here for frontend maps
            }
        );
    }
);

app.MapFallbackToFile("index.html");
app.Run();
