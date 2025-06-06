using System;
using System.Data;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using Azure.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;

namespace GridWatch.Function
{
    public class GenerateReports
    {
        private readonly ILogger<GenerateReports> _logger;
        private readonly string _sqlConnectionString;

        public GenerateReports(ILogger<GenerateReports> logger)
        {
            _logger = logger;
            _sqlConnectionString = Environment.GetEnvironmentVariable("SQL_CONNECTION_STRING")
                ?? throw new InvalidOperationException("❌ SQL_CONNECTION_STRING environment variable not set.");
        }

        [Function("GenerateReports")]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "get", "post")] HttpRequest req
        )
        {
            _logger.LogInformation("📝 Generating reports...");

            await using var sqlConnection = new SqlConnection(_sqlConnectionString);
            await sqlConnection.OpenAsync();

            // Fetch users and their associated reports
            var fetchReportsCmd = new SqlCommand(@"
                SELECT u.Email, ur.ReportType
                FROM UserReports ur
                INNER JOIN Users u ON ur.UserId = u.UserId", sqlConnection);

            await using var reader = await fetchReportsCmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                var userEmail = reader.GetString(0);
                var reportType = reader.GetString(1);

                string emailContent = reportType switch
                {
                    "Telemetry" => await GenerateTelemetryReportAsync(sqlConnection),
                    "NetworkHealth" => await GenerateNetworkHealthReportAsync(sqlConnection),
                    _ => "Report type not implemented."
                };

                // Send email (placeholder, replace with actual sending logic or Logic App)
                await SendEmailAsync(userEmail, $"{reportType} Report", emailContent);

                _logger.LogInformation($"📧 Sent {reportType} report to {userEmail}");
            }

            return new OkObjectResult("✅ Reports generated and dispatched successfully!");
        }

        private async Task<string> GenerateTelemetryReportAsync(SqlConnection sqlConnection)
        {
            // Placeholder logic for telemetry report
            var sb = new StringBuilder();
            sb.Append("<h1>Telemetry Report</h1><p>Hello World from Telemetry!</p>");

            // Add real query logic here if needed

            return sb.ToString();
        }

        private async Task<string> GenerateNetworkHealthReportAsync(SqlConnection sqlConnection)
        {
            // Example logic: Count reconnections per device over the past week
            var sb = new StringBuilder();
            sb.Append("<h1>Network Health Report</h1>");

            var cmd = new SqlCommand(@"
                SELECT d.Name, COUNT(*) AS Reconnects
                FROM Notifications n
                INNER JOIN Devices d ON n.DeviceId = d.Id
                WHERE n.Message LIKE '%connected%'
                  AND n.CreatedAt >= DATEADD(day, -7, GETDATE())
                GROUP BY d.Name
                HAVING COUNT(*) > 5 -- threshold of reconnects
                ORDER BY Reconnects DESC", sqlConnection);

            await using var reader = await cmd.ExecuteReaderAsync();

            sb.Append("<table border='1'><tr><th>Device</th><th>Reconnects (Last 7 days)</th></tr>");

            bool hasData = false;
            while (await reader.ReadAsync())
            {
                hasData = true;
                sb.AppendFormat("<tr><td>{0}</td><td>{1}</td></tr>",
                    WebUtility.HtmlEncode(reader.GetString(0)),
                    reader.GetInt32(1));
            }

            sb.Append("</table>");

            if (!hasData)
                sb.Append("<p>No significant reconnect events in the last 7 days.</p>");

            return sb.ToString();
        }

        private async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
        {
            // This function illustrates sending an email; in production, you might use SendGrid, Logic Apps, etc.
            var smtpClient = new SmtpClient(Environment.GetEnvironmentVariable("SMTP_SERVER"))
            {
                Port = 587,
                Credentials = new NetworkCredential(
                    Environment.GetEnvironmentVariable("SMTP_USER"),
                    Environment.GetEnvironmentVariable("SMTP_PASSWORD")
                ),
                EnableSsl = true,
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(Environment.GetEnvironmentVariable("EMAIL_FROM")),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true,
            };
            mailMessage.To.Add(toEmail);

            await smtpClient.SendMailAsync(mailMessage);
        }
    }
}
