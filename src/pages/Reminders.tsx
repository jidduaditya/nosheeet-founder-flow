import { useMemo } from "react";
import { type Reminder } from "@/lib/mock-data";
import { useReminders, useSnoozeReminder, useMarkReminderDone } from "@/hooks/use-api";
import { PageLoader, PageError } from "@/components/PageStates";
import { format, isPast, isToday } from "date-fns";
import {
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Clock,
  CalendarDays,
  Bell,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Urgency = "overdue" | "today" | "upcoming";

function getUrgency(due: string, isDone: boolean): Urgency {
  if (isDone) return "upcoming";
  const d = new Date(due);
  if (isPast(d) && !isToday(d)) return "overdue";
  if (isToday(d)) return "today";
  return "upcoming";
}

const sectionConfig: Record<Urgency, {
  label: string; icon: React.ReactNode; borderClass: string; dotClass: string; countBg: string; emptyText: string;
}> = {
  overdue: { label: "Overdue", icon: <AlertCircle className="h-4 w-4 text-destructive" />, borderClass: "border-l-destructive/50", dotClass: "bg-destructive", countBg: "bg-destructive/10 text-destructive", emptyText: "Nothing overdue — nice work!" },
  today: { label: "Due Today", icon: <Clock className="h-4 w-4 text-warning" />, borderClass: "border-l-warning/50", dotClass: "bg-warning", countBg: "bg-warning/10 text-warning", emptyText: "No reminders due today" },
  upcoming: { label: "Upcoming", icon: <CalendarDays className="h-4 w-4 text-muted-foreground" />, borderClass: "border-l-border", dotClass: "bg-muted-foreground/30", countBg: "bg-muted text-muted-foreground", emptyText: "No upcoming reminders" },
};

export default function Reminders() {
  const { data: reminders, isLoading, error, refetch } = useReminders();
  const snoozeMutation = useSnoozeReminder();
  const markDoneMutation = useMarkReminderDone();

  if (isLoading) return <PageLoader />;
  if (error) return <PageError message={error.message} onRetry={() => refetch()} />;

  const allReminders = reminders ?? [];
  const pending = allReminders.filter(r => !r.is_done);
  const done = allReminders.filter(r => r.is_done);

  const grouped = (() => {
    const groups: Record<Urgency, Reminder[]> = { overdue: [], today: [], upcoming: [] };
    for (const r of pending) {
      groups[getUrgency(r.due_at, r.is_done)].push(r);
    }
    groups.overdue.sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());
    groups.today.sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());
    groups.upcoming.sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());
    return groups;
  })();

  const sections: Urgency[] = ["overdue", "today", "upcoming"];

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" /> Reminders
          </h1>
          <p className="text-sm text-muted-foreground">{pending.length} pending · {done.length} completed</p>
        </div>
        <div className="flex items-center gap-2">
          {grouped.overdue.length > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-semibold text-destructive">
              <AlertCircle className="h-3 w-3" /> {grouped.overdue.length} overdue
            </span>
          )}
          {grouped.today.length > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-1 text-[11px] font-semibold text-warning">
              <Clock className="h-3 w-3" /> {grouped.today.length} today
            </span>
          )}
        </div>
      </div>

      {sections.map(urgency => {
        const cfg = sectionConfig[urgency];
        const items = grouped[urgency];
        return (
          <section key={urgency}>
            <div className="flex items-center gap-2 mb-2">
              {cfg.icon}
              <h2 className="font-display text-sm font-semibold">{cfg.label}</h2>
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${cfg.countBg}`}>{items.length}</span>
            </div>
            {items.length === 0 ? (
              <Card className="border-dashed py-6 text-center">
                <p className="text-xs text-muted-foreground">{cfg.emptyText}</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {items.map(r => (
                  <ReminderCard
                    key={r.id}
                    reminder={r}
                    urgency={urgency}
                    borderClass={cfg.borderClass}
                    dotClass={cfg.dotClass}
                    onDone={() => markDoneMutation.mutate(r.id)}
                    onSnooze={(days) => snoozeMutation.mutate({ id: r.id, days })}
                    isActing={snoozeMutation.isPending || markDoneMutation.isPending}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}

      {done.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <h2 className="font-display text-sm font-semibold text-muted-foreground">Completed</h2>
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{done.length}</span>
          </div>
          <div className="space-y-1.5">
            {done.map(r => (
              <div key={r.id} className="flex items-center gap-2.5 rounded-md border border-dashed p-2.5 opacity-50">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                <p className="text-xs line-through text-muted-foreground flex-1 truncate">{r.text}</p>
                <span className="text-[10px] text-muted-foreground">{r.contact_name}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ReminderCard({
  reminder, urgency, borderClass, dotClass, onDone, onSnooze, isActing,
}: {
  reminder: Reminder; urgency: Urgency; borderClass: string; dotClass: string;
  onDone: () => void; onSnooze: (days: number) => void; isActing: boolean;
}) {
  const due = new Date(reminder.due_at);
  return (
    <Card className={`border-l-[3px] ${borderClass} p-3 transition-all hover:shadow-sm`}>
      <div className="flex items-start gap-2.5">
        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotClass}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <Link to={`/contacts/${reminder.contact_id}`} className="text-sm font-medium hover:text-primary transition-colors">
              {reminder.contact_name}
            </Link>
            <span className={`text-[10px] font-medium shrink-0 ${urgency === "overdue" ? "text-destructive" : urgency === "today" ? "text-warning" : "text-muted-foreground"}`}>
              {urgency === "overdue" ? `Overdue · ${format(due, "MMM d")}` : urgency === "today" ? "Due today" : format(due, "EEE, MMM d")}
            </span>
          </div>
          <p className="text-sm leading-snug">{reminder.text}</p>
          {reminder.auto_generated && (
            <span className="mt-0.5 inline-flex items-center gap-0.5 text-[10px] text-primary">
              <Sparkles className="h-2.5 w-2.5" /> AI generated
            </span>
          )}
          <div className="mt-2.5 flex items-center gap-1 flex-wrap">
            <Button size="sm" onClick={onDone} disabled={isActing} className="h-7 px-2.5 text-[11px] gap-1">
              {isActing ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />} Done
            </Button>
            <div className="flex items-center gap-0.5 ml-1">
              <span className="text-[10px] text-muted-foreground mr-0.5">Snooze:</span>
              <Button variant="outline" size="sm" className="h-7 px-2 text-[11px]" disabled={isActing} onClick={() => onSnooze(1)}>1 day</Button>
              <Button variant="outline" size="sm" className="h-7 px-2 text-[11px]" disabled={isActing} onClick={() => onSnooze(3)}>3 days</Button>
              <Button variant="outline" size="sm" className="h-7 px-2 text-[11px]" disabled={isActing} onClick={() => onSnooze(7)}>1 week</Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
