/**
 * @fileoverview
 * TriggerSelector component for selecting notification triggers.
 * Renders a list of checkboxes for available notification trigger options.
 * 
 * Props:
 * - triggers: string[] - Array of currently selected trigger labels.
 * - onToggleTrigger: (label: string) => void - Callback to toggle a trigger selection.
 */

const options = ["Overvoltage", "Device Offline", "Firmware Expiry", "Signal Drop"];

/**
 * TriggerSelector component.
 * @param {{ triggers: string[], onToggleTrigger: (label: string) => void }} props
 * @returns {JSX.Element}
 */
export function TriggerSelector({ triggers, onToggleTrigger }) {
  return (
    <div>
      <h3 className="font-semibold mb-2">Notification Triggers</h3>
      <div className="grid grid-cols-2 gap-2">
        {options.map((label) => (
          <label key={label} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={triggers.includes(label)}
              onChange={() => onToggleTrigger(label)}
              className="accent-blue-600"
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}