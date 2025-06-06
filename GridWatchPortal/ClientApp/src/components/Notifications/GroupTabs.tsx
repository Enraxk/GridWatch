/**
 * @fileoverview
 * GroupTabs component renders a set of group selection tabs and an "Add New Group" button.
 * 
 * Props:
 * - groups: Array of group objects with `id` and `name` properties.
 * - selected: The id of the currently selected group.
 * - onSelect: Callback function invoked with the group id when a tab is selected.
 * - onAdd: Callback function invoked when the "Add New Group" button is clicked.
 */

import { useState } from "react";

/**
 * Renders group selection tabs and an "Add New Group" button.
 *
 * @param {Object} props
 * @param {Array<{id: string|number, name: string}>} props.groups - List of group objects.
 * @param {string|number} props.selected - Currently selected group id.
 * @param {(id: string|number) => void} props.onSelect - Handler for selecting a group.
 * @param {() => void} props.onAdd - Handler for adding a new group.
 * @returns {JSX.Element}
 */
export function GroupTabs({ groups, selected, onSelect, onAdd }) {
  return (
    <div className="border-b pb-2">
      <div className="flex flex-wrap gap-2">
        {groups.map((group) => (
          <button
            key={group.id}
            onClick={() => onSelect(group.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium 
              ${
                selected === group.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100"
              }`}
          >
            {group.name}
          </button>
        ))}
        <div className="ml-auto">
          <button
            onClick={onAdd}
            className="px-4 py-2 text-blue-600 hover:underline text-sm"
          >
            + Add New Group
          </button>
        </div>
      </div>
    </div>
  );
}