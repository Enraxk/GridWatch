/**
 * @fileoverview
 * ContactSelector component for selecting or creating contacts.
 * 
 * This component provides a searchable dropdown to select an existing contact
 * or create a new one if no match is found. It uses a popover UI with a command
 * palette style search and supports both selection and creation callbacks.
 * 
 * Technologies: React, TypeScript, Lucide React Icons, custom UI components.
 */

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Check, Plus } from "lucide-react";
import { useState } from "react";

/**
 * Represents a contact with a name and email.
 */
export interface Contact {
  name: string;
  email: string;
}

interface ContactSelectorProps {
  /** List of available contacts to select from. */
  contacts: Contact[];
  /** Callback when a contact is selected. */
  onSelect: (contact: Contact) => void;
  /** Callback when a new contact is created. */
  onCreate: (contact: Contact) => void;
}

/**
 * ContactSelector component.
 * 
 * Renders a button that opens a popover with a searchable list of contacts.
 * Allows the user to select an existing contact or create a new one if no match is found.
 * 
 * @param contacts - Array of contacts to display.
 * @param onSelect - Function to call when a contact is selected.
 * @param onCreate - Function to call when a new contact is created.
 */
export function ContactSelector({
  contacts,
  onSelect,
  onCreate,
}: ContactSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter contacts based on the search term.
  const filtered = contacts.filter((c) =>
    `${c.name} ${c.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * Handles creation of a new contact using the current search term.
   * Generates an email based on the trimmed name.
   */
  const handleCreate = () => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    const contact = {
      name: trimmed,
      email: `${trimmed.replace(/\s+/g, "").toLowerCase()}@gridwatch.ie`,
    };
    console.log("➕ Creating:", contact);
    onCreate(contact);
    setOpen(false);
    setSearchTerm("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
<Button
  variant="outline"
  className="text-sm dark:bg-gray-800 dark:text-white"
  role="combobox"
>
  Search or create contact
</Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0 dark:bg-slate-900">
        <Command>
          <CommandInput
            placeholder="Search contacts..."
            value={searchTerm}
            onValueChange={(val) => {
              console.log("🔎 Typing:", val);
              setSearchTerm(val);
            }}
          />

          {filtered.length > 0 ? (
            <CommandGroup heading="Contacts">
              {filtered.map((contact) => (
                <CommandItem
                  key={contact.email}
                  onSelect={() => {
                    console.log("✔️ Selected:", contact);
                    onSelect(contact);
                    setOpen(false);
                    setSearchTerm("");
                  }}
                >
                  <span>{contact.name} — {contact.email}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : (
            <CommandEmpty>
              <div className="p-4 text-center space-y-2">
                <p className="text-sm text-gray-400">No match found.</p>
                <Button
                  onClick={handleCreate}
                  variant="default"
                  className="w-full justify-center"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create “{searchTerm}”
                </Button>
              </div>
            </CommandEmpty>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}