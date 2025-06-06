/**
 * @fileoverview
 * This file defines the `ContactList` React component, which displays a list of contacts
 * and provides a selector for adding or selecting contacts. It uses the `ContactSelector`
 * component for contact selection and creation.
 */

import { ContactSelector, Contact } from "./ContactSelector";

/**
 * Props for the `ContactList` component.
 * @typedef {Object} ContactListProps
 * @property {Contact[]} contacts - The list of currently selected contacts to display.
 * @property {Contact[]} allContacts - The list of all available contacts for selection.
 * @property {(contact: Contact) => void} onSelect - Callback when a contact is selected.
 * @property {(contact: Contact) => void} onCreate - Callback when a new contact is created.
 */
interface ContactListProps {
  contacts: Contact[];
  allContacts: Contact[];
  onSelect: (contact: Contact) => void;
  onCreate: (contact: Contact) => void;
}

/**
 * Renders a list of contacts with a selector for adding or selecting contacts.
 *
 * @param {ContactListProps} props - The props for the component.
 * @returns {JSX.Element} The rendered contact list component.
 */
export function ContactList({ contacts, allContacts, onSelect, onCreate }: ContactListProps) {
  return (
    <div className="rounded-md border bg-background text-foreground p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Contacts</h3>
        <div className="w-auto">
          <ContactSelector
            contacts={allContacts}
            onSelect={onSelect}
            onCreate={onCreate}
          />
        </div>
      </div>

      <ul className="space-y-1">
        {contacts.map((contact, idx) => (
          <li key={idx} className="text-sm">
            <span className="font-medium">{contact.name}</span> —{" "}
            <span className="text-muted-foreground">{contact.email}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}