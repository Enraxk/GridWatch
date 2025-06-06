/**
 * @fileoverview
 * ReportSchedule component for configuring report delivery options.
 * Allows users to select the frequency and format of scheduled reports,
 * and displays the last sent date.
 * 
 * Props:
 * - schedule: { frequency: string, format: string, lastSent: string }
 *   The current schedule configuration.
 * - onChangeSchedule: (field: string, value: string) => void
 *   Callback to update the schedule when a field changes.
 */

/**
 * Renders the report scheduling controls.
 *
 * @param {{ schedule: { frequency: string, format: string, lastSent: string }, onChangeSchedule: (field: string, value: string) => void }} props
 * @returns {JSX.Element}
 */
export function ReportSchedule({ schedule, onChangeSchedule }) {
  return (
    <div>
      <h3 className="font-semibold mb-2">Report Schedule</h3>
      <div className="flex gap-4 items-center">
        <div className="flex flex-col">
          <label className="text-xs text-gray-500">Frequency</label>
          <select
            value={schedule.frequency}
            onChange={(e) => onChangeSchedule("frequency", e.target.value)}
            className="border p-1 rounded"
          >
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-500">Format</label>
          <select
            value={schedule.format}
            onChange={(e) => onChangeSchedule("format", e.target.value)}
            className="border p-1 rounded"
          >
            <option>CSV</option>
            <option>PDF</option>
          </select>
        </div>
        <div className="text-sm text-gray-600">Last Sent: {schedule.lastSent}</div>
      </div>
    </div>
  );
}
