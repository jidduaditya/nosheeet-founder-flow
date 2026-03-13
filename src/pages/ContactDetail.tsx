import { useParams, Link } from "react-router-dom";
import { mockContacts, mockMessages, mockDeals, mockReminders, mockLeadSummaries } from "@/lib/mock-data";
import { ChannelBadge } from "@/components/ChannelBadge";
import { format } from "date-fns";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const contact = mockContacts.find(c => c.id === id);
  if (!contact) return <p className="p-8 text-muted-foreground">Contact not found</p>;

  const messages = mockMessages.filter(m => m.contact_id === id).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const deals = mockDeals.filter(d => d.contact_id === id);
  const reminders = mockReminders.filter(r => r.contact_id === id && !r.is_done);
  const summary = mockLeadSummaries.find(s => s.contact_id === id);

  return (
    <div className="max-w-3xl space-y-5 animate-fade-in">
      <Link to="/contacts" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Contacts
      </Link>

      {/* Contact header */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary font-display text-lg font-bold text-secondary-foreground">
          {contact.name.split(" ").map(n => n[0]).join("")}
        </div>
        <div>
          <h1 className="font-display text-xl font-bold">{contact.name}</h1>
          <p className="text-sm text-muted-foreground">
            {contact.company && `${contact.company} · `}{contact.email}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <ChannelBadge channel={contact.channel} />
            <span className="text-xs font-medium text-primary">Score: {contact.lead_score}</span>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      {summary && (
        <Card className="border-primary/20 bg-primary/5 p-3">
          <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3 w-3" /> AI Lead Summary
          </p>
          <p className="text-sm leading-relaxed">{summary.summary}</p>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-3">
        {/* Deals */}
        {deals.length > 0 && deals.map(d => (
          <Card key={d.id} className="p-3">
            <p className="text-sm font-medium">{d.title}</p>
            <p className="text-lg font-display font-bold text-primary">${d.value.toLocaleString()}</p>
            <Badge variant="secondary" className="mt-1 text-[10px]">{d.stage.replace("_", " ")}</Badge>
          </Card>
        ))}
      </div>

      {/* Reminders */}
      {reminders.length > 0 && (
        <div className="space-y-1.5">
          <h2 className="font-display text-sm font-semibold">Pending Reminders</h2>
          {reminders.map(r => (
            <div key={r.id} className="rounded-md border p-2.5 text-sm">
              {r.text}
              <span className="ml-2 text-xs text-muted-foreground">{format(new Date(r.due_at), "MMM d")}</span>
              {r.auto_generated && <span className="ml-1 text-xs text-primary">✦</span>}
            </div>
          ))}
        </div>
      )}

      {/* Conversation timeline */}
      <div>
        <h2 className="font-display text-sm font-semibold mb-3">Conversation Timeline</h2>
        <div className="space-y-2">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.direction === "outbound" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.direction === "outbound"
                    ? "rounded-br-md bg-primary text-primary-foreground"
                    : "rounded-bl-md bg-secondary text-secondary-foreground"
                }`}
              >
                <p>{m.body}</p>
                <p className={`mt-1 flex items-center gap-1 text-[10px] ${m.direction === "outbound" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  <ChannelBadge channel={m.channel} showLabel={false} />
                  {format(new Date(m.timestamp), "MMM d, h:mm a")}
                </p>
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No messages yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
