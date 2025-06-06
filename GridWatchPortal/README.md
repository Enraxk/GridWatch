# GridWatch Platform

GridWatch is a cloud-native, Azure-integrated platform for monitoring and analyzing substation and feeder telemetry in low-voltage networks. It includes a modular architecture with:

- Azure AD-secured portal
- APIs for SQL, ADX, Device Twins
- Dashboard with customizable widgets
- Notification + reporting system
- Logic Apps & IoT integration

---

## 🧭 Architecture Overview

- `GridWatchPortal`: React + MSAL + Backend (C#)
- `GridWatchSqlApi`: Secure access to SQL-backed data (device status, reports, contacts)
- `GridWatchAdxApi`: Queries to Azure Data Explorer
- `GridWatchDeviceApi`: Interfaces with IoT Hub & Twins
- `Azure Functions`: Telemetry ingestion & reporting
- `SQL Database`: Stores state, preferences, actions, alerts

---

## 🔐 Authentication

All APIs are protected via Azure AD. The portal frontend acquires tokens using MSAL and sends them to internal APIs.

---

## 📡 API Usage

### 1. Device Status API

**URL:**
```http
GET /api/gridwatch/devices/connected
Response:

json
Copy
Edit
[
  {
    "deviceId": "c82e18b0f390",
    "status": "Connected",
    "model": "GW200P",
    "lastSeen": "2025-05-14T10:03:00Z"
  }
]
2. ADX Voltage Query API
URL:

http
Copy
Edit
GET /api/gridwatch/substation/voltages?substationId={id}&start={ISO}&end={ISO}
Response:

json
Copy
Edit
[
  {
    "phase": "A",
    "voltage": 242.1,
    "timestamp": "2025-05-14T10:00:00Z"
  },
  ...
]
🌐 CORS Configuration (Local Dev)
If you're hitting CORS errors, ensure your backend APIs (e.g., GridWatchSqlApi) have cors enabled for local React dev URL:

csharp
Copy
Edit
app.UseCors(policy => policy
  .WithOrigins("http://localhost:5141")
  .AllowAnyHeader()
  .AllowAnyMethod()
  .AllowCredentials()
);
⚙️ Developer Workflow
Run backend APIs:

bash
Copy
Edit
dotnet run --project GridWatchSqlApi
dotnet run --project GridWatchAdxApi
Run React Portal:

bash
Copy
Edit
npm install
npm run dev
Login using Azure AD, token will be forwarded to APIs automatically.

📂 SQL Schema
See schema.sql for full table structure:

Substations, Devices, Feeders, Contacts

Dashboard Widgets

Audit logs

User preferences

Algorithms for thresholds & health

🛠️ Custom Dashboard Widgets
Portal users can add dashboard tiles backed by:

ADX queries

SQL queries

Static Markdown text

These are defined via DashboardWidgets table.

✍️ Contributors
Edward Keane – Architect, Lead Developer

AI Copilot – Documentation & Strategy