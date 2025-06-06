import { useState } from "react";
import { GroupTabs } from "@/components/Notifications/GroupTabs";
import { GroupDetails } from "@/components/Notifications/GroupDetails";
import { CreateGroupModal } from "@/components/Notifications/CreateGroupModal";
import { AddContactSheet } from "@/components/Notifications/AddContactSheet";

export default function NotificationsPage() {
  const [groups, setGroups] = useState([
    {
      id: "1",
      name: "Maintenance Team",
      description: "Handles faults in Region A",
      contacts: [
        { name: "John Doe", email: "john@example.com" },
        { name: "Jane Smith", email: "jane@example.com" },
      ],
      triggers: ["Overvoltage", "Signal Drop"],
      schedule: {
        frequency: "Weekly",
        format: "CSV",
        lastSent: "Yesterday at 09:00",
      }
    }
  ]);

  const [allContacts, setAllContacts] = useState([
    { name: "John Doe", email: "john@example.com" },
    { name: "Jane Smith", email: "jane@example.com" },
    { name: "Alice Power", email: "alice@gridwatch.ie" },
    { name: "Bob Sensor", email: "bob@gridwatch.ie" },
  ]);

  const [selectedId, setSelectedId] = useState("1");
  const [showCreate, setShowCreate] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);

  const selectedGroupIndex = groups.findIndex((g) => g.id === selectedId);

  const handleAddGroup = (newGroup: any) => {
    const enriched = {
      ...newGroup,
      contacts: [],
      triggers: [],
      schedule: {
        frequency: "Weekly",
        format: "CSV",
        lastSent: "Never"
      }
    };
    setGroups((prev) => [...prev, enriched]);
    setSelectedId(enriched.id);
    setShowCreate(false);
  };

  const handleContactSelected = (contact: { name: string; email: string }) => {
    const updatedGroups = [...groups];
    updatedGroups[selectedGroupIndex].contacts.push(contact);
    setGroups(updatedGroups);
  };

  const handleContactCreated = (contact: { name: string; email: string }) => {
    setAllContacts((prev) => [...prev, contact]);
    setShowAddContact(true); // then open sheet to fill in full contact info
  };

  const handleAddContactFinal = (contact: { name: string; email: string }) => {
    handleContactSelected(contact);
    setShowAddContact(false);
  };

  return (
   <div className="p-6 bg-background text-foreground rounded-md shadow-md transition-colors duration-300">
      <h1 className="text-2xl font-bold mb-2">Notifications & Reports</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Manage contact groups, alert preferences and report delivery.
      </p>

      <GroupTabs
        groups={groups}
        selected={selectedId}
        onSelect={setSelectedId}
        onAdd={() => setShowCreate(true)}
      />

      <GroupDetails
        group={groups[selectedGroupIndex]}
        allContacts={allContacts}
        onSelectContact={handleContactSelected}
        onCreateContact={handleContactCreated}
      />

      <CreateGroupModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSave={handleAddGroup}
      />

      <AddContactSheet
        open={showAddContact}
        onClose={() => setShowAddContact(false)}
        onSave={handleAddContactFinal}
      />
    </div>
  );
}