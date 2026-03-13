import { formatDistanceToNow, format, isToday, isTomorrow, isPast } from "date-fns";
import { Card } from "@/components/ui/card";
import { ChannelBadge } from "@/components/ChannelBadge";
import { mockMessages, mockReminders, mockDeals, mockMeetings, DEAL_STAGES } from "@/lib/mock-data";
import { CheckCircle2, Clock, ArrowRight, Sparkles, CalendarDays, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const activeDeals = mockDeals.filter(d => !["closed_won", "closed_lost"].includes(d.stage));
  const totalPipeline = activeDeals.reduce((s, d) => s + d.value, 0);
  const recentMessages = [...mockMessages].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);
  const pendingReminders = mockReminders.filter(r => !r.is_done).sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());
  const upcomingMeetings = mockMeetings.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()).slice(0, 3);

  return (
    <div className="max-w-5xl space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your sales at a glance</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Pipeline" value={`$${(totalPipeline / 1000).toFixed(0)}k`} icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard label="Active Deals" value={String(activeDeals.length)} icon={<ArrowRight className="h-4 w-4" />} />
        <StatCard label="Pending Reminders" value={String(pendingReminders.length)} icon={<Clock className="h-4 w-4" />} />
        <StatCard label="Meetings This Week" value={String(upcomingMeetings.length)} icon={<CalendarDays className="h-4 w-4" />} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Reminders */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-sm font-semibold flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Reminders
            </h2>
            <Link to="/reminders" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {pendingReminders.slice(0, 4).map(r => (
              <div key={r.id} className="flex items-start gap-2 rounded-md border p-2.5 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="leading-snug">{r.text}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {r.contact_name} · {isPast(new Date(r.due_at)) ? <span className="text-destructive">Overdue</span> : isToday(new Date(r.due_at)) ? "Today" : isTomorrow(new Date(r.due_at)) ? "Tomorrow" : format(new Date(r.due_at), "MMM d")}
                    {r.auto_generated && <span className="ml-1 text-primary">✦ auto</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent conversations */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-sm font-semibold">Recent Conversations</h2>
            <Link to="/contacts" className="text-xs text-primary hover:underline">All contacts</Link>
          </div>
          <div className="space-y-1">
            {recentMessages.map(m => (
              <Link
                key={m.id}
                to={`/contacts/${m.contact_id}`}
                className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-xs font-semibold text-secondary-foreground">
                  {m.contact_name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{m.contact_name}</span>
                    <ChannelBadge channel={m.channel} showLabel={false} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{m.direction === "outbound" ? "You: " : ""}{m.body}</p>
                </div>
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(m.timestamp), { addSuffix: true })}
                </span>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Upcoming meetings */}
      <Card className="p-4">
        <h2 className="font-display text-sm font-semibold mb-3 flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4 text-primary" />
          Upcoming Meetings
        </h2>
        <div className="grid sm:grid-cols-3 gap-2">
          {upcomingMeetings.map(mt => (
            <div key={mt.id} className="rounded-md border p-3">
              <p className="text-sm font-medium">{mt.title}</p>
              <p className="text-xs text-muted-foreground">{mt.contact_name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {format(new Date(mt.start_time), "EEE, MMM d · h:mm a")}
                {mt.location && ` · ${mt.location}`}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-xl font-display font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
}
