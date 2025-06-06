import { useState } from "react";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandGroup,
  CommandEmpty,
} from "@/components/ui/command";

export function TestContactSearch() {
  const [input, setInput] = useState("");
  const mockContacts = [
    { name: "Alice Power", email: "alice@gridwatch.ie" },
    { name: "Bob Sensor", email: "bob@gridwatch.ie" },
  ];

  const filtered = mockContacts.filter((c) =>
    `${c.name} ${c.email}`.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded bg-white dark:bg-slate-900 text-black dark:text-white">
      <h2 className="text-xl mb-4">Test Contact Search</h2>
      <Command>
        <CommandInput
          value={input}
          onValueChange={(val) => {
            console.log("🔤 Typed:", val);
            setInput(val);
          }}
          placeholder="Search..."
        />
        {filtered.length > 0 ? (
          <CommandGroup heading="Contacts">
            {filtered.map((c) => (
              <CommandItem key={c.email}>
                {c.name} — {c.email}
              </CommandItem>
            ))}
          </CommandGroup>
        ) : (
          <CommandEmpty>
            <div className="p-4 text-sm text-gray-500">No match</div>
          </CommandEmpty>
        )}
      </Command>
    </div>
  );
}
