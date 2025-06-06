/**
 * @fileoverview
 * AddContactModal component for displaying a modal dialog to add a contact to a group.
 * 
 * Technologies: React, TypeScript.
 * 
 * - Uses a Dialog UI component to present a modal.
 * - Allows selection or creation of a contact via ContactSelector.
 * - Handles modal open/close and save actions.
 * - Accepts props for open state, close handler, and save handler.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ContactSelector } from "./ContactSelector";

/**
 * Props for AddContactModal component.
 */
interface AddContactModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Callback when a contact is saved */
  onSave: (contact: { name: string; email: string }) => void;
}

/**
 * AddContactModal component.
 * 
 * Displays a modal dialog for selecting or creating a contact and saving it to a group.
 * 
 * @param {AddContactModalProps} props - The component props.
 * @returns {JSX.Element} The rendered modal dialog.
 */
export function AddContactModal({
  isOpen,
  onClose,
  onSave,
}: AddContactModalProps) {
  const [selectedContact, setSelectedContact] = useState<{ name: string; email: string } | null>(null);

  /**
   * Handles saving the selected contact.
   */
  const handleSave = () => {
    if (selectedContact) {
      onSave(selectedContact);
      setSelectedContact(null);
      onClose();
    }
  };

  /**
   * Handles closing the modal and resetting state.
   */
  const handleClose = () => {
    setSelectedContact(null);
    onClose();
  };

  // Mock contacts for demonstration purposes.
  const mockContacts = [
    { name: "Alice Power", email: "alice@gridwatch.ie" },
    { name: "Bob Sensor", email: "bob@gridwatch.ie" },
    { name: "Charlie Volt", email: "charlie@gridwatch.ie" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent
        className="sm:max-w-md dark:bg-slate-900"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-white dark:text-white">Add Contact to Group</DialogTitle>
        </DialogHeader>

        <div className="my-4">
          <ContactSelector
            contacts={mockContacts}
            onSelect={(contact) => {
              console.log("✔️ Selected:", contact);
              setSelectedContact(contact);
            }}
            onCreate={(contact) => {
              console.log("➕ Created:", contact);
              setSelectedContact(contact);
            }}
          />
        </div>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!selectedContact}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}