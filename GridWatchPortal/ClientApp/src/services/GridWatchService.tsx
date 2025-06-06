/**
 * Authentication service imports for token acquisition
 */
import { msalInstance, getScopes } from "./authService";

/**
 * Fetches voltage data for a specific substation over a time period.
 *
 * @param {string} substationId - The unique identifier for the substation
 * @param {string} start - The start date/time for the data query
 * @param {string} end - The end date/time for the data query
 * @returns {Promise<any>} The voltage data for the specified substation and time range
 * @throws {Error} When authentication fails or API returns an error
 */
export const getSubstationVoltages = async (
    substationId: string,
    start: string,
    end: string
) => {
  const account = msalInstance.getActiveAccount();
  if (!account) throw new Error("No active MSAL account!");

  try {
    const tokenResponse = await msalInstance.acquireTokenSilent({
      scopes: getScopes(), // Uses the same function as in TestApiConnection
      account,
    });

    // Get the ADX API URL from environment variables or use a default
    const adxApiUrl = import.meta.env.VITE_ADX_API_URL || "http://localhost:5257";

    const url = `${adxApiUrl}/api/adx/substation/voltages?substationId=${encodeURIComponent(substationId)}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${tokenResponse.accessToken}`,
      },
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`ADX API call failed: ${res.status} ${error}`);
    }

    return await res.json();
  } catch (error) {
    // If there's a consent error, attempt interactive login
    if (error instanceof Error && error.message.includes("consent")) {
      console.warn("Consent required, attempting interactive login");
      await msalInstance.acquireTokenRedirect({
        scopes: getScopes(),
        redirectUri: window.location.origin
      });
    }
    throw error;
  }
};

/**
 * Retrieves a list of all connected devices from the GridWatch API.
 *
 * @returns {Promise<any>} A list of currently connected devices
 * @throws {Error} When authentication fails or API returns an error
 */
export const getConnectedDevices = async () => {
  const account = msalInstance.getActiveAccount();
  if (!account) throw new Error("No active MSAL account!");

  try {
    const tokenResponse = await msalInstance.acquireTokenSilent({
      scopes: getScopes(), // Using the same scopes function
      account,
    });

    const res = await fetch("/api/gridwatch/devices/connected", {
      headers: {
        Authorization: `Bearer ${tokenResponse.accessToken}`,
      },
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`API call failed: ${res.status} ${error}`);
    }

    return await res.json();
  } catch (error) {
    if (error instanceof Error && error.message.includes("consent")) {
      console.warn("Consent required, attempting interactive login");
      await msalInstance.acquireTokenRedirect({
        scopes: getScopes(),
        redirectUri: window.location.origin
      });
    }
    throw error;
  }
};
export const getSubstationsMap = async () => {
  const account = msalInstance.getActiveAccount();
  if (!account) throw new Error("No active MSAL account!");

  try {
    const tokenResponse = await msalInstance.acquireTokenSilent({
      scopes: getScopes(),
      account,
    });

    const res = await fetch("/api/gridwatch/maps/substations", {
      // ✅ changed 'map' to 'maps'
      headers: {
        Authorization: `Bearer ${tokenResponse.accessToken}`,
      },
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`API call failed: ${res.status} ${error}`);
    }

    return await res.json();
  } catch (error) {
    if (error instanceof Error && error.message.includes("consent")) {
      console.warn("Consent required, attempting interactive login");
      await msalInstance.acquireTokenRedirect({
        scopes: getScopes(),
        redirectUri: window.location.origin
      });
    }
    throw error;
  }
};
export const getGraphData = async (payload: {
  substationId: string;
  graphTypes: string[];
  groupGraphs: boolean;
  scale: "day" | "week" | "custom";
  customFrom?: string;
  customTo?: string;
  multiDeviceMode?: boolean; // ✅ new optional param
  deviceIds?: string[]; // ✅ Add this line
}) => {
  const account = msalInstance.getActiveAccount();
  if (!account) throw new Error("No active MSAL account!");

  try {
    const tokenResponse = await msalInstance.acquireTokenSilent({
      scopes: getScopes(),
      account,
    });

    const res = await fetch("/api/graphing/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenResponse.accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Graphing API call failed: ${res.status} ${error}`);
    }

    return await res.json();
  } catch (error) {
    if (error instanceof Error && error.message.includes("consent")) {
      console.warn("Consent required, attempting interactive login");
      await msalInstance.acquireTokenRedirect({
        scopes: getScopes(),
        redirectUri: window.location.origin,
      });
    }
    throw error;
  }
};

