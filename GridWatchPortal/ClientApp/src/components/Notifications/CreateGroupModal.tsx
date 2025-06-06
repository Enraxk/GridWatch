/**
 * @fileoverview
 * CreateGroupModal component for creating a new notification group.
 * 
 * This modal provides a form for users to input a group name and description,
 * and handles the creation and submission of a new group object.
 * 
 * Technologies: React, TypeScript.
 * 
 * Props:
 * - isOpen: Controls the visibility of the modal.
 * - onClose: Callback to close the modal.
 * - onSave: Callback invoked with the new group object when saved.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface CreateGroupModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Callback to save the new group */
  onSave: (newGroup: { id: string; name: string; description: string }) => void;
}

/**
 * Modal dialog for creating a new notification group.
 * 
 * @param {CreateGroupModalProps} props - The props for the component.
 * @returns {JSX.Element} The modal dialog component.
 */
export const CreateGroupModal = ({ isOpen, onClose, onSave }: CreateGroupModalProps) => {
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");

  /**
   * Handles saving the new group and closing the modal.
   */
  const handleSave = () => {
    const newGroup = {
      id: crypto.randomUUID(), // or Date.now().toString()
      name: groupName,
      description: groupDesc
    };
    onSave(newGroup);
    setGroupName("");
    setGroupDesc("");
    onClose();
  };

  return (
<Dialog
  open={isOpen}
  onOpenChange={(open) => {
    // Prevent closing if backdrop is clicked
    if (!open) {
      onClose(); // Optional: allow close via Cancel or Save only
    }
  }}
  modal={true} // ← ensures it's modal
>
<DialogContent
  className="sm:max-w-md dark:bg-slate-900"
  onPointerDownOutside={(e) => e.preventDefault()} // 🛑 Prevent backdrop click
  onEscapeKeyDown={(e) => e.preventDefault()}      // 🛑 Prevent escape key
>
        <DialogHeader>
          <DialogTitle>Create Notification Group</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <Input
            placeholder="Group description"
            value={groupDesc}
            onChange={(e) => setGroupDesc(e.target.value)}
          />
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!groupName}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};