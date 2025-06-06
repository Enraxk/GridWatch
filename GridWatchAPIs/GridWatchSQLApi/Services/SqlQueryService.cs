using System.Data;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace GridWatchSqlApi.Services
{
    public interface ISqlQueryService
    {
        Task<string> ExecuteQueryAsync(string query);
    }

    public class SqlQueryService : ISqlQueryService
    {
        private readonly string _connectionString;

        public SqlQueryService(IConfiguration config)
        {
            _connectionString =
                Environment.GetEnvironmentVariable("SQL_CONNECTION_STRING")
                ?? config["ApplicationSettings:SqlConnectionString"]
                ?? throw new Exception("SQL connection string missing");
        }

        public async Task<string> ExecuteQueryAsync(string query)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            using var command = new SqlCommand(query, connection);
            using var reader = await command.ExecuteReaderAsync();

            var sb = new StringBuilder();
            var table = new DataTable();
            table.Load(reader);

            foreach (DataRow row in table.Rows)
            {
                foreach (var item in row.ItemArray)
                {
                    sb.Append(item + "\t");
                }
                sb.AppendLine();
            }
            return sb.ToString();
        }
    }
}
