// Program.cs
using System.Reflection;
using GridWatchSqlApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ✅ Load configuration
var configuration = builder.Configuration;

// ✅ CORS setup
string frontendUrls =
    Environment.GetEnvironmentVariable("GRIDWATCH_FRONTEND_URL")
    ?? configuration["Cors:AllowedOrigins"]
    ?? "http://localhost:3000";

string[] allowedOrigins = frontendUrls.Split(',', StringSplitOptions.RemoveEmptyEntries);

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

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAAD", policy => policy.RequireAuthenticatedUser());
});

// ✅ Register SQL service
builder.Services.AddScoped<ISqlQueryService, SqlQueryService>();

// ✅ Add controllers and Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc(
        "v1",
        new OpenApiInfo
        {
            Title = "GridWatch SQL API",
            Version = "v1",
            Description = "API for accessing GridWatch SQL data.",
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

app.MapGet("/", () => "🚀 GridWatch SQL API is running!").WithName("Home");
app.MapControllers();

app.Run();
