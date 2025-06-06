/**
 * @fileoverview
 * TestApiConnection React component for testing API connectivity.
 * 
 * This component performs the following actions:
 * - Fetches the substations map using `getSubstationsMap`.
 * - Fetches connected devices using `getConnectedDevices`.
 * - Logs the first connected device's ID.
 * - (Commented out) Optionally fetches substation voltages for the first device from the start of the day to now using `getSubstationVoltages`.
 * 
 * All API calls and errors are logged to the console for debugging purposes.
 * This component does not render any UI.
 */

import { useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { getScopes } from "@/services/authService";
import { getConnectedDevices, getSubstationsMap, getSubstationVoltages } from "@/services/GridWatchService";

/**
 * TestApiConnection component.
 * 
 * @component
 * @returns {null} This component does not render any UI.
 */
export const TestApiConnection = () => {
  const { instance } = useMsal();

  useEffect(() => {
    /**
     * Runs the API connectivity test.
     * Logs results and errors to the console.
     * 
     * @async
     * @function runTest
     * @returns {Promise<void>}
     */
    const runTest = async () => {
      try {

               console.log("🔋 Substations Map: api");     
        const subs = await getSubstationsMap();
        console.log("🔋 Substations Map:", subs);
        // 🔹 Step 1: Get Connected Devices using GridWatchService
        const devices = await getConnectedDevices();
        console.log("🟢 Connected Devices from GridWatch API:", devices);

        if (!devices.length) throw new Error("No connected devices found");

        const substationId = devices[0].deviceId;
        console.log("🔌 First Connected Device ID:", substationId);

        // 🔹 Step 2: Get Substation Voltages from ADX API (00:00 to now)
        const now = new Date();
        const startOfDay = new Date();
        startOfDay.setUTCHours(0, 0, 0, 0);

        const startTime = startOfDay.toISOString();
        const endTime = now.toISOString();

        //const voltages = await getSubstationVoltages(substationId, startTime, endTime);
        //console.log("🔋 Substation Voltages from ADX API:", voltages);

      } catch (error) {
        console.error("🔴 API Test Failed:", error);
      }
    };

    runTest();
  }, [instance]);

  return null;
};