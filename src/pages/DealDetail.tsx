import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { DEAL_STAGES, type DealStage, type Channel, type Reminder } from "@/lib/mock-data";
import { useDeal, useContact, useContactTimeline, useReminders, useSnoozeReminder, useMarkReminderDone } from "@/hooks/use-api";
import { PageLoader, PageError } from "@/components/PageStates";
import { ChannelBadge } from "@/components/ChannelBadge";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format, formatDistanceToNow, isPast, isToday } from "date-fns";
import {
  ArrowLeft, CalendarDays, User, Mail, Phone, Building2,
  Sparkles, AlertTriangle, Lightbulb, Clock, CheckCircle2,
  MessageCircle, Loader2,
} from "lucide-react";

const stageBadgeStyle: Record<DealStage, string> = {
  discovery: "bg-muted text-muted-foreground",
  demo: "bg-primary/10 text-primary",
  proposal: "bg-primary/15 text-primary",
  won: "bg-success/10 text-success",
  lost: "bg-destructive/10 text-destructive",
  cold: "bg-[hsl(var(--cold))]/10 text-[hsl(var(--cold))]",
};

type TimelineEntry =
  | { type: "message"; id: string; channel: Channel; direction: "inbound" | "outbound"; body: string; timestamp: string; contactName: string }
  | { type: "meeting"; id: string; title: string; timestamp: string; location?: string; contactName: string }
  | { type: "ai_summary"; id: string; summary: string; timestamp: string };

export default function DealDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: deal, isLoading: dealLoading, error: dealError, refetch: refetchDeal } = useDeal(id ?? "");
  const contactId = deal?.contact_id ?? "";
  const { data: contact } = useContact(contactId);
  const { data: timelineData, isLoading: timelineLoading } = useContactTimeline(contactId);
  const { data: allReminders } = useReminders();
  const snoozeMutation = useSnoozeReminder();
  const markDoneMutation = useMarkReminderDone();

  if (dealLoading) return <PageLoader />;
  if (dealError) return <PageError message={dealError.message} onRetry={() => refetchDeal()} />;
  if (!deal) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <p className="text-lg font-medium">Deal not found</p>
        <Link to="/deals" className="mt-2 text-sm text-primary hover:underline">Back to Deals</Link>
      </div>
    );
  }

  const stageLabel = DEAL_STAGES.find(s => s.key === deal.stage)?.label ?? deal.stage;
  const aiInsight = timelineData?.lead_summary;
  const messages = timelineData?.messages ?? [];
  const meetings = timelineData?.meetings ?? [];
  const contactReminders = (allReminders ?? []).filter(r => r.contact_id === deal.contact_id && !r.is_done);

  const timeline: TimelineEntry[] = [
    ...messages.map(m => ({ type: "message" as const, id: m.id, channel: m.channel, direction: m.direction, body: m.body, timestamp: m.timestamp, contactName: m.contact_name })),
    ...meetings.map(m => ({ type: "meeting" as const, id: m.id, title: m.title, timestamp: m.start_time, location: m.location, contactName: m.contact_name })),
    ...(aiInsight ? [{ type: "ai_summary" as const, id: aiInsight.id, summary: aiInsight.summary, timestamp: aiInsight.generated_at }] : []),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const progressStages = DEAL_STAGES.filter(s => !["lost", "cold"].includes(s.key));
  const progressIndex = progressStages.findIndex(s => s.key === deal.stage);

  return (
    <div className="animate-fade-in">
      <Link to="/deals" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Deals
      </Link>

      <div className="mt-3 mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-display text-2xl font-bold tracking-tight">{deal.title}</h1>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${stageBadgeStyle[deal.stage]}`}>{stageLabel}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          ${deal.value.toLocaleString()} · Created {formatDistanceToNow(new Date(deal.created_at), { addSuffix: true })}
        </p>
        {!["lost", "cold"].includes(deal.stage) && (
          <div className="mt-4 flex items-center gap-1 max-w-md">
            {progressStages.map((s, i) => (
              <div key={s.key} className="flex-1">
                <div className={`h-1.5 rounded-full ${i <= progressIndex ? "bg-primary" : "bg-muted"}`} />
                <p className={`mt-1 text-[9px] text-center ${s.key === deal.stage ? "font-semibold text-primary" : "text-muted-foreground"}`}>{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        {/* LEFT: Timeline */}
        <div>
          <h2 className="font-display text-base font-semibold mb-3">Conversation Timeline</h2>
          {timelineLoading ? (
            <div className="flex items-center gap-2 py-8 justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Loading timeline…</span>
            </div>
          ) : timeline.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-12 text-center">
              <MessageCircle className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
            </Card>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />
              <div className="space-y-0">
                {timeline.map((entry) => <TimelineItem key={entry.id} entry={entry} />)}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Deal Card + AI + Reminders */}
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-display text-sm font-semibold mb-3">Contact & Deal</h3>
            <div className="space-y-2.5">
              <InfoRow icon={<User className="h-3.5 w-3.5" />} label="Name" value={contact?.name ?? deal.contact_name} />
              <InfoRow icon={<Building2 className="h-3.5 w-3.5" />} label="Company" value={contact?.company ?? "—"} />
              <InfoRow icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={contact?.email ?? "—"} />
              {contact?.phone && <InfoRow icon={<Phone className="h-3.5 w-3.5" />} label="Phone" value={contact.phone} />}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Deal Stage</span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${stageBadgeStyle[deal.stage]}`}>{stageLabel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Value</span>
                <span className="font-display font-bold">${deal.value.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Primary Channel</span>
                {contact ? <ChannelBadge channel={contact.channel} /> : <span className="text-xs">—</span>}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Last Activity</span>
                <span className="text-xs">{deal.last_activity ? formatDistanceToNow(new Date(deal.last_activity), { addSuffix: true }) : "—"}</span>
              </div>
            </div>
          </Card>

          {aiInsight && (
            <Card className="border-primary/20 p-4">
              <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" /> AI Insights
              </h3>
              <p className="text-sm leading-relaxed">{aiInsight.summary}</p>
              {aiInsight.pain_points.length > 0 && (
                <div className="mt-3">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Pain Points
                  </p>
                  <ul className="space-y-1">
                    {aiInsight.pain_points.map((p, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground leading-relaxed">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-destructive/60" />{p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-3 rounded-md bg-primary/5 p-2.5">
                <p className="text-[11px] font-semibold text-primary mb-0.5 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3" /> Recommended Next Action
                </p>
                <p className="text-xs leading-relaxed">{aiInsight.recommended_action}</p>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">
                Generated {formatDistanceToNow(new Date(aiInsight.generated_at), { addSuffix: true })}
              </p>
            </Card>
          )}

          <Card className="p-4">
            <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary" /> Reminders
            </h3>
            {contactReminders.length === 0 ? (
              <p className="text-xs text-muted-foreground">No pending reminders</p>
            ) : (
              <div className="space-y-2.5">
                {contactReminders.map(r => (
                  <ReminderRow
                    key={r.id}
                    reminder={r}
                    onSnooze={(days) => snoozeMutation.mutate({ id: r.id, days })}
                    onDone={() => markDoneMutation.mutate(r.id)}
                    isActing={snoozeMutation.isPending || markDoneMutation.isPending}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ entry }: { entry: TimelineEntry }) {
  const iconBg = entry.type === "message"
    ? entry.channel === "whatsapp" ? "bg-[hsl(var(--channel-whatsapp))]/15" : entry.channel === "gmail" ? "bg-[hsl(var(--channel-gmail))]/15" : "bg-[hsl(var(--channel-calendar))]/15"
    : entry.type === "meeting" ? "bg-[hsl(var(--channel-calendar))]/15" : "bg-primary/10";

  return (
    <div className="relative flex gap-3 pl-1 pb-4">
      <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
        {entry.type === "message" && <ChannelBadge channel={entry.channel} showLabel={false} />}
        {entry.type === "meeting" && <CalendarDays className="h-3.5 w-3.5 text-[hsl(var(--channel-calendar))]" />}
        {entry.type === "ai_summary" && <Sparkles className="h-3.5 w-3.5 text-primary" />}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        {entry.type === "message" && (
          <>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-medium">{entry.direction === "outbound" ? "You" : entry.contactName}</span>
              <ChannelBadge channel={entry.channel} showLabel />
              {entry.direction === "outbound" && <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">Sent</span>}
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">{entry.body}</p>
          </>
        )}
        {entry.type === "meeting" && (
          <>
            <p className="text-xs font-medium flex items-center gap-1"><CalendarDays className="h-3 w-3 text-[hsl(var(--channel-calendar))]" /> Meeting: {entry.title}</p>
            {entry.location && <p className="text-xs text-muted-foreground">{entry.location}</p>}
          </>
        )}
        {entry.type === "ai_summary" && (
          <div className="rounded-md bg-primary/5 border border-primary/10 p-2.5">
            <p className="text-[10px] font-semibold text-primary mb-0.5 flex items-center gap-1"><Sparkles className="h-3 w-3" /> AI Summary</p>
            <p className="text-xs leading-relaxed">{entry.summary}</p>
          </div>
        )}
        <p className="mt-1 text-[10px] text-muted-foreground">{format(new Date(entry.timestamp), "MMM d, h:mm a")}</p>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon} {label}</span>
      <span className="text-sm font-medium truncate max-w-[180px] text-right">{value}</span>
    </div>
  );
}

function ReminderRow({ reminder, onSnooze, onDone, isActing }: { reminder: Reminder; onSnooze: (days: number) => void; onDone: () => void; isActing: boolean }) {
  const due = new Date(reminder.due_at);
  const overdue = isPast(due) && !isToday(due);
  const today = isToday(due);

  return (
    <div className={`rounded-md border p-2.5 ${overdue ? "border-destructive/30" : today ? "border-warning/30" : ""}`}>
      <div className="flex items-start gap-2">
        <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${overdue ? "text-destructive" : today ? "text-warning" : "text-muted-foreground"}`} />
        <div className="min-w-0 flex-1">
          <p className="text-xs leading-snug">{reminder.text}</p>
          <p className={`mt-0.5 text-[10px] font-medium ${overdue ? "text-destructive" : today ? "text-warning" : "text-muted-foreground"}`}>
            {overdue ? "Overdue" : today ? "Due today" : format(due, "MMM d")}
            {reminder.auto_generated && <span className="ml-1 text-primary">✦ auto</span>}
          </p>
          <div className="mt-1.5 flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[10px]" disabled={isActing} onClick={onDone}>
              ✓
            </Button>
            <span className="text-[10px] text-muted-foreground mr-1">Snooze:</span>
            <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[10px]" disabled={isActing} onClick={() => onSnooze(1)}>1d</Button>
            <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[10px]" disabled={isActing} onClick={() => onSnooze(3)}>3d</Button>
            <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[10px]" disabled={isActing} onClick={() => onSnooze(7)}>1w</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
