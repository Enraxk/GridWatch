import { useState } from "react";
import { ContactSelector } from "@/components/Notifications/ContactSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactSelectorTestPage() {
  const [selected, setSelected] = useState<{ name: string; email: string } | null>(null);

  const mockContacts = [
    { name: "Alice Power", email: "alice@gridwatch.ie" },
    { name: "Bob Sensor", email: "bob@gridwatch.ie" },
    { name: "Charlie Volt", email: "charlie@gridwatch.ie" },
  ];

  return (
    <div className="p-6 max-w-xl mx-auto">
      <Card className="dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-white">Contact Selector Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <ContactSelector
            contacts={mockContacts}
            onSelect={(contact) => {
              console.log("🔍 Selected:", contact);
              setSelected(contact);
            }}
            onCreate={(contact) => {
              console.log("➕ Created:", contact);
              setSelected(contact);
            }}
          />

          {selected && (
            <div className="mt-4 text-white">
              <strong>Selected:</strong> {selected.name} ({selected.email})
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
