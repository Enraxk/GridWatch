/**
 * @fileoverview
 * GroupDetails component displays the details of a notification group,
 * including its name, description, contacts, triggers, and report schedule.
 * Allows users to select or create contacts, view and modify triggers,
 * and manage the group's report schedule.
 * 
 * Props:
 * - group: The group object containing name, description, contacts, triggers, and schedule.
 * - allContacts: List of all available contacts for selection or creation.
 * - onSelectContact: Callback when a contact is selected.
 * - onCreateContact: Callback when a new contact is created.
 */

import { ContactList } from "./ContactList";
import { TriggerSelector } from "./TriggerSelector";
import { ReportSchedule } from "./ReportSchedule";

interface GroupDetailsProps {
  group: any;
  allContacts: { name: string; email: string }[];
  onSelectContact: (contact: { name: string; email: string }) => void;
  onCreateContact: (contact: { name: string; email: string }) => void; // ← updated here
}

/**
 * Renders the details of a notification group, including contacts, triggers, and schedule.
 * @param group The group object with details to display.
 * @param allContacts List of all contacts available.
 * @param onSelectContact Handler for selecting a contact.
 * @param onCreateContact Handler for creating a new contact.
 */
export function GroupDetails({
  group,
  allContacts,
  onSelectContact,
  onCreateContact
}: GroupDetailsProps) {
  return (
    <div className="border rounded-lg p-6 shadow-sm bg-background text-foreground space-y-6 mt-4 transition-colors duration-300">
      <div>
        <h2 className="text-xl font-semibold">{group.name}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-300">
          {group.description}
        </p>
      </div>
      <ContactList
        contacts={group.contacts}
        allContacts={allContacts}
        onSelect={onSelectContact}
        onCreate={onCreateContact}
      />
      <TriggerSelector triggers={group.triggers} onToggleTrigger={() => {}} />
      <ReportSchedule schedule={group.schedule} onChangeSchedule={() => {}} />
      <div className="flex justify-between pt-4">
        <button className="text-red-500">Delete Group</button>
        <div className="space-x-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Save Changes</button>
          <button className="bg-gray-200 dark:bg-gray-800 text-sm px-4 py-2 rounded">Test Notification</button>
        </div>
      </div>
    </div>
  );
}