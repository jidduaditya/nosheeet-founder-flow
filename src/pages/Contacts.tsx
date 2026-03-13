import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DEAL_STAGES, type DealStage } from "@/lib/mock-data";
import { useContacts, useDeals, useReminders } from "@/hooks/use-api";
import { PageLoader, PageError } from "@/components/PageStates";
import { ChannelBadge } from "@/components/ChannelBadge";
import { formatDistanceToNow, format, isPast, isToday } from "date-fns";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const stageBadgeVariant: Record<DealStage, string> = {
  discovery: "bg-muted text-muted-foreground",
  demo: "bg-primary/10 text-primary",
  proposal: "bg-primary/15 text-primary",
  won: "bg-success/10 text-success",
  lost: "bg-destructive/10 text-destructive",
  cold: "bg-[hsl(var(--cold))]/10 text-[hsl(var(--cold))]",
};

export default function Contacts() {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<DealStage | "all">("all");
  const navigate = useNavigate();

  const { data: contacts, isLoading: contactsLoading, error: contactsError, refetch: refetchContacts } = useContacts();
  const { data: deals } = useDeals();
  const { data: reminders } = useReminders();

  if (contactsLoading) return <PageLoader />;
  if (contactsError) return <PageError message={contactsError.message} onRetry={() => refetchContacts()} />;

  const allContacts = contacts ?? [];
  const allDeals = deals ?? [];
  const allReminders = reminders ?? [];

  // Lookups
  const dealsByContact = new Map<string, typeof allDeals[number]>();
  for (const d of allDeals) {
    const existing = dealsByContact.get(d.contact_id);
    if (!existing || ["won", "lost", "cold"].includes(existing.stage)) {
      dealsByContact.set(d.contact_id, d);
    }
  }

  const remindersByContact = new Map<string, typeof allReminders[number]>();
  const pendingReminders = allReminders
    .filter(r => !r.is_done)
    .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());
  for (const r of pendingReminders) {
    if (!remindersByContact.has(r.contact_id)) {
      remindersByContact.set(r.contact_id, r);
    }
  }

  const filtered = allContacts.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company?.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (stageFilter !== "all") {
      const deal = dealsByContact.get(c.id);
      if (!deal || deal.stage !== stageFilter) return false;
    }
    return true;
  });

  const handleRowClick = (contactId: string) => {
    const deal = dealsByContact.get(contactId);
    navigate(deal ? `/deals/${deal.id}` : `/contacts/${contactId}`);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Contacts</h1>
        <p className="text-sm text-muted-foreground">{allContacts.length} contacts</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name, company, or email…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
          <StageFilterButton active={stageFilter === "all"} onClick={() => setStageFilter("all")} label="All" />
          {DEAL_STAGES.map(s => (
            <StageFilterButton key={s.key} active={stageFilter === s.key} onClick={() => setStageFilter(s.key)} label={s.label} />
          ))}
          {stageFilter !== "all" && (
            <button onClick={() => setStageFilter("all")} className="ml-1 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold hidden sm:table-cell">Company</TableHead>
              <TableHead className="font-semibold">Channel</TableHead>
              <TableHead className="font-semibold hidden md:table-cell">Deal Stage</TableHead>
              <TableHead className="font-semibold hidden lg:table-cell">Last Activity</TableHead>
              <TableHead className="font-semibold hidden md:table-cell">Next Reminder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(c => {
              const deal = dealsByContact.get(c.id);
              const reminder = remindersByContact.get(c.id);
              const reminderUrgency = reminder
                ? isPast(new Date(reminder.due_at)) && !isToday(new Date(reminder.due_at)) ? "overdue" : isToday(new Date(reminder.due_at)) ? "today" : "future"
                : null;
              return (
                <TableRow key={c.id} className="cursor-pointer transition-colors hover:bg-muted/50" onClick={() => handleRowClick(c.id)}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-xs font-semibold text-secondary-foreground">
                        {c.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{c.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate sm:hidden">{c.company ?? c.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell"><span className="text-sm text-muted-foreground">{c.company ?? "—"}</span></TableCell>
                  <TableCell><ChannelBadge channel={c.channel} /></TableCell>
                  <TableCell className="hidden md:table-cell">
                    {deal ? (
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${stageBadgeVariant[deal.stage]}`}>
                        {DEAL_STAGES.find(s => s.key === deal.stage)?.label}
                      </span>
                    ) : <span className="text-xs text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(c.last_contacted), { addSuffix: true })}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {reminder ? (
                      <div>
                        <p className="text-xs truncate max-w-[180px]">{reminder.text}</p>
                        <p className={`text-[10px] font-medium ${reminderUrgency === "overdue" ? "text-destructive" : reminderUrgency === "today" ? "text-warning" : "text-muted-foreground"}`}>
                          {reminderUrgency === "overdue" ? "Overdue" : reminderUrgency === "today" ? "Due today" : format(new Date(reminder.due_at), "MMM d")}
                        </p>
                      </div>
                    ) : <span className="text-xs text-muted-foreground">—</span>}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No contacts match your filters</p>
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setSearch(""); setStageFilter("all"); }}>Clear filters</Button>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">Showing {filtered.length} of {allContacts.length} contacts</p>
    </div>
  );
}

function StageFilterButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}>
      {label}
    </button>
  );
}
