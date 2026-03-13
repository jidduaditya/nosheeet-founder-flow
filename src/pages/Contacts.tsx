import { useState } from "react";
import { mockContacts } from "@/lib/mock-data";
import { ChannelBadge } from "@/components/ChannelBadge";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Contacts() {
  const [search, setSearch] = useState("");
  const filtered = mockContacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company?.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-3xl space-y-4 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Contacts</h1>
        <p className="text-sm text-muted-foreground">{mockContacts.length} contacts</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, company, or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-1">
        {filtered.map(c => (
          <Link
            key={c.id}
            to={`/contacts/${c.id}`}
            className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-sm font-semibold text-secondary-foreground">
              {c.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{c.name}</span>
                <ChannelBadge channel={c.channel} showLabel={false} />
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {c.company && `${c.company} · `}{c.email}
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(c.last_contacted), { addSuffix: true })}
              </div>
              <div className="mt-0.5 text-[10px] font-medium text-primary">
                Score: {c.lead_score}
              </div>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No contacts found</p>
        )}
      </div>
    </div>
  );
}
