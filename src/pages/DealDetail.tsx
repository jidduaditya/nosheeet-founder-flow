import { useParams, Link } from "react-router-dom";
import { mockDeals, mockContacts, mockMessages, mockMeetings, DEAL_STAGES } from "@/lib/mock-data";
import { ChannelBadge } from "@/components/ChannelBadge";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from "date-fns";
import { ArrowLeft, CalendarDays, User, DollarSign, Clock } from "lucide-react";

export default function DealDetail() {
  const { id } = useParams<{ id: string }>();
  const deal = mockDeals.find(d => d.id === id);
  if (!deal) return <p className="p-8 text-muted-foreground">Deal not found</p>;

  const contact = mockContacts.find(c => c.id === deal.contact_id);
  const messages = mockMessages.filter(m => m.contact_id === deal.contact_id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const meetings = mockMeetings.filter(m => m.contact_id === deal.contact_id);
  const stageLabel = DEAL_STAGES.find(s => s.key === deal.stage)?.label ?? deal.stage;
  const stageIndex = DEAL_STAGES.findIndex(s => s.key === deal.stage);

  return (
    <div className="max-w-3xl space-y-5 animate-fade-in">
      <Link to="/deals" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Deals
      </Link>

      {/* Deal header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{deal.title}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <Link to={`/contacts/${deal.contact_id}`} className="flex items-center gap-1 hover:text-primary">
            <User className="h-3.5 w-3.5" /> {deal.contact_name}
          </Link>
          <span className="flex items-center gap-1">
            <DollarSign className="h-3.5 w-3.5" /> ${deal.value.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Created {formatDistanceToNow(new Date(deal.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Stage progress */}
      <Card className="p-4">
        <h2 className="font-display text-sm font-semibold mb-3">Pipeline Stage</h2>
        <div className="flex items-center gap-1">
          {DEAL_STAGES.filter(s => s.key !== "closed_lost").map((s, i) => {
            const isActive = s.key === deal.stage;
            const isPast = i <= stageIndex;
            return (
              <div key={s.key} className="flex-1">
                <div className={`h-2 rounded-full transition-colors ${isPast ? "bg-primary" : "bg-muted"}`} />
                <p className={`mt-1.5 text-[10px] text-center ${isActive ? "font-semibold text-primary" : "text-muted-foreground"}`}>
                  {s.label}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Deal info */}
        <Card className="p-4 space-y-3">
          <h2 className="font-display text-sm font-semibold">Deal Info</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Value</span>
              <span className="font-display font-bold text-lg">${deal.value.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stage</span>
              <Badge variant="secondary">{stageLabel}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last updated</span>
              <span>{formatDistanceToNow(new Date(deal.updated_at), { addSuffix: true })}</span>
            </div>
            {contact && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Company</span>
                  <span>{contact.company ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lead score</span>
                  <span className="font-medium text-primary">{contact.lead_score}</span>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Upcoming meetings */}
        <Card className="p-4">
          <h2 className="font-display text-sm font-semibold mb-3 flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-primary" /> Meetings
          </h2>
          {meetings.length > 0 ? (
            <div className="space-y-2">
              {meetings.map(mt => (
                <div key={mt.id} className="rounded-md border p-2.5 text-sm">
                  <p className="font-medium">{mt.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(mt.start_time), "EEE, MMM d · h:mm a")}
                    {mt.location && ` · ${mt.location}`}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No meetings scheduled</p>
          )}
        </Card>
      </div>

      {/* Activity timeline */}
      <div>
        <h2 className="font-display text-sm font-semibold mb-3">Recent Activity</h2>
        <div className="space-y-2">
          {messages.slice(0, 6).map(m => (
            <div key={m.id} className="flex items-start gap-3 rounded-md border p-3">
              <ChannelBadge channel={m.channel} showLabel={false} />
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug">
                  <span className="font-medium">{m.direction === "outbound" ? "You" : m.contact_name}:</span>{" "}
                  {m.body}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {format(new Date(m.timestamp), "MMM d, h:mm a")}
                </p>
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">No activity yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
