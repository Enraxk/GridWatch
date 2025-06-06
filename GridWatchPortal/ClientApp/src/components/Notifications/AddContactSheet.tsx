/**
 * @fileoverview
 * AddContactSheet component for adding a new contact via a side sheet.
 * 
 * This component renders a sheet UI with input fields for name, email, and optional phone.
 * It provides callbacks for saving the contact and closing the sheet.
 * 
 * Props:
 * - open: boolean - Controls the visibility of the sheet.
 * - onClose: () => void - Callback to close the sheet.
 * - onSave: (contact: { name: string; email: string; phone?: string }) => void - Callback to save the contact.
 */

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface AddContactSheetProps {
  open: boolean;
  onClose: () => void;
  onSave: (contact: { name: string; email: string; phone?: string }) => void;
}

/**
 * AddContactSheet component.
 *
 * @param {AddContactSheetProps} props - The props for the component.
 * @returns {JSX.Element} The rendered AddContactSheet component.
 */
export function AddContactSheet({
  open,
  onClose,
  onSave,
}: AddContactSheetProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  /**
   * Handles saving the contact.
   * Validates required fields, calls onSave, resets state, and closes the sheet.
   */
  const handleSave = () => {
    if (!name.trim() || !email.trim()) return;
    onSave({ name, email, phone });
    setName("");
    setEmail("");
    setPhone("");
    onClose();
  };

  /**
   * Handles closing the sheet and resets input fields.
   */
  const handleClose = () => {
    setName("");
    setEmail("");
    setPhone("");
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className="space-y-4 bg-background text-foreground"
      >
        <SheetHeader>
          <SheetTitle className="text-lg">Add New Contact</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 px-1">
          <div>
            <label className="text-sm text-muted-foreground block mb-1">
              Full Name
            </label>
            <Input
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">
              Email
            </label>
            <Input
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">
              Phone (optional)
            </label>
            <Input
              placeholder="+353 87 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <SheetFooter className="flex justify-end gap-2 mt-auto">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name || !email}>
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}