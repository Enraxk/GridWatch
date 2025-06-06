using System.Reflection;
using Azure.Identity;
using GridWatchAdxApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ✅ Load configuration
var configuration = builder.Configuration;

// ✅ CORS for frontend apps
string frontendUrls =
    Environment.GetEnvironmentVariable("GRIDWATCH_FRONTEND_URL")
    ?? configuration["Cors:AllowedOrigins"]
    ?? "http://localhost:3000";

string[] allowedOrigins = frontendUrls.Split(
    ',',
    StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries
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

// ✅ Azure AD Authentication
string azureTenantId =
    configuration["AzureAd:TenantId"] ?? throw new Exception("AZURE_TENANT_ID not set");
string clientId =
    configuration["AzureAd:PortalClientId"] ?? throw new Exception("PORTAL_CLIENT_ID not set");

builder
    .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://login.microsoftonline.com/{azureTenantId}/v2.0";
        options.Audience = clientId;
    });

// ✅ Unified Authorization logic
builder.Services.AddAuthorization(options =>
{
    if (builder.Environment.IsProduction())
    {
        options.FallbackPolicy = new AuthorizationPolicyBuilder()
            .RequireAuthenticatedUser()
            .Build();
    }
    else
    {
        // Dev/local: No fallback policy, default allows anonymous
    }

    // Optional: Add named policy
    options.AddPolicy(
        "RequireAAD",
        policy =>
        {
            policy.RequireAuthenticatedUser();
        }
    );
});

// ✅ Register ADX Service
builder.Services.AddScoped<IAdxQueryService, AdxQueryService>();

// ✅ Controllers & Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc(
        "v1",
        new OpenApiInfo
        {
            Title = "GridWatch ADX API",
            Version = "v1",
            Description = "API for querying GridWatch telemetry from Azure Data Explorer.",
        }
    );

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
        new OpenApiSecurityRequirement { { securityScheme, Array.Empty<string>() } }
    );

    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFilename);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath, true);
    }
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

app.MapGet("/", () => "🚀 GridWatch ADX API is running!").WithName("Home");
app.MapControllers();

app.Run();
