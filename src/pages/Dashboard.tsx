import { isToday, isPast, format, formatDistanceToNow, subDays, differenceInDays } from "date-fns";
import { Card } from "@/components/ui/card";
import { DEAL_STAGES, type DealStage } from "@/lib/mock-data";
import { useDeals, useReminders } from "@/hooks/use-api";
import { PageLoader, PageError } from "@/components/PageStates";
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Snowflake,
  Trophy,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

// ─── Stage colors ───────────────────────────────────────────────
const stageColumnColors: Record<DealStage, string> = {
  discovery: "border-muted-foreground/20",
  demo: "border-primary/30",
  proposal: "border-primary/50",
  won: "border-success/50",
  lost: "border-destructive/40",
  cold: "border-[hsl(var(--cold))]/40",
};

const stageHeaderBg: Record<DealStage, string> = {
  discovery: "bg-muted",
  demo: "bg-primary/10",
  proposal: "bg-primary/15",
  won: "bg-success/10",
  lost: "bg-destructive/10",
  cold: "bg-[hsl(var(--cold))]/10",
};

const stageIcons: Partial<Record<DealStage, React.ReactNode>> = {
  won: <Trophy className="h-3.5 w-3.5 text-success" />,
  lost: <XCircle className="h-3.5 w-3.5 text-destructive" />,
  cold: <Snowflake className="h-3.5 w-3.5 text-[hsl(var(--cold))]" />,
};

// ─── Urgency helpers ────────────────────────────────────────────
type Urgency = "overdue" | "today" | "future";

function getUrgency(due: string): Urgency {
  const d = new Date(due);
  if (isPast(d) && !isToday(d)) return "overdue";
  if (isToday(d)) return "today";
  return "future";
}

const urgencyConfig: Record<Urgency, { border: string; dot: string; label: string; labelClass: string }> = {
  overdue: { border: "border-destructive/40", dot: "bg-destructive", label: "Overdue", labelClass: "text-destructive font-semibold" },
  today:   { border: "border-warning/40",     dot: "bg-warning",     label: "Due today", labelClass: "text-warning font-semibold" },
  future:  { border: "border-border",          dot: "bg-muted-foreground/30", label: "", labelClass: "text-muted-foreground" },
};

// ─── Main component ─────────────────────────────────────────────
export default function Dashboard() {
  const { data: deals, isLoading: dealsLoading, error: dealsError, refetch: refetchDeals } = useDeals();
  const { data: reminders, isLoading: remindersLoading, error: remindersError, refetch: refetchReminders } = useReminders();

  const isLoading = dealsLoading || remindersLoading;
  const error = dealsError || remindersError;

  if (isLoading) return <PageLoader />;
  if (error) return <PageError message={error.message} onRetry={() => { refetchDeals(); refetchReminders(); }} />;

  const allDeals = deals ?? [];
  const allReminders = reminders ?? [];

  const pendingReminders = allReminders
    .filter(r => !r.is_done)
    .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());

  // Weekly snapshot
  const oneWeekAgo = subDays(new Date(), 7);
  const dealsCreatedThisWeek = allDeals.filter(d => new Date(d.created_at) >= oneWeekAgo).length;
  const dealsClosedThisWeek = allDeals.filter(d => d.stage === "won" && new Date(d.updated_at) >= oneWeekAgo).length;
  const dealsGoingCold = allDeals.filter(d =>
    !["won", "lost", "cold"].includes(d.stage) &&
    d.last_activity &&
    differenceInDays(new Date(), new Date(d.last_activity)) >= 7
  ).length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {format(new Date(), "EEEE, MMMM d")} — here's what needs your attention
        </p>
      </div>

      {/* Weekly snapshot */}
      <div className="grid grid-cols-3 gap-3">
        <SnapshotCard icon={<TrendingUp className="h-4 w-4" />} label="Deals created" value={dealsCreatedThisWeek} sub="this week" accent="text-success" />
        <SnapshotCard icon={<Trophy className="h-4 w-4" />} label="Deals closed" value={dealsClosedThisWeek} sub="this week" accent="text-primary" />
        <SnapshotCard icon={<Snowflake className="h-4 w-4" />} label="Going cold" value={dealsGoingCold} sub="no activity 7d+" accent="text-[hsl(var(--cold))]" warn={dealsGoingCold > 0} />
      </div>

      {/* Today's Actions */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base font-semibold flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" /> Today's Actions
          </h2>
          <Link to="/reminders" className="text-xs text-primary hover:underline">View all</Link>
        </div>
        {pendingReminders.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-10 text-center">
            <CheckCircle2 className="h-8 w-8 text-success/40 mb-2" />
            <p className="text-sm font-medium">All caught up!</p>
            <p className="text-xs text-muted-foreground">No pending reminders</p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {pendingReminders.map(r => {
              const urgency = getUrgency(r.due_at);
              const uc = urgencyConfig[urgency];
              return (
                <Link key={r.id} to={`/contacts/${r.contact_id}`}>
                  <Card className={`p-3 border-l-[3px] ${uc.border} transition-colors hover:bg-muted/50 cursor-pointer h-full`}>
                    <div className="flex items-start gap-2">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${uc.dot}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-snug">{r.text}</p>
                        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs text-muted-foreground">{r.contact_name}</span>
                          <span className="text-muted-foreground/30">·</span>
                          <span className={`text-[11px] ${uc.labelClass}`}>
                            {urgency === "future" ? format(new Date(r.due_at), "MMM d") : uc.label}
                          </span>
                          {r.auto_generated && (
                            <span className="text-[10px] text-primary flex items-center gap-0.5">
                              <Sparkles className="h-2.5 w-2.5" /> auto
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Pipeline Overview */}
      <section>
        <h2 className="font-display text-base font-semibold mb-3">Pipeline Overview</h2>
        <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
          {DEAL_STAGES.map(stage => {
            const stageDeals = allDeals.filter(d => d.stage === stage.key);
            const total = stageDeals.reduce((s, d) => s + d.value, 0);
            return (
              <div key={stage.key} className="min-w-[220px] flex-1">
                <div className={`mb-2 flex items-center justify-between rounded-lg px-3 py-2 ${stageHeaderBg[stage.key]}`}>
                  <span className="flex items-center gap-1.5 text-xs font-semibold">
                    {stageIcons[stage.key]}
                    {stage.label}
                    <span className="ml-1 rounded-full bg-background px-1.5 py-0.5 text-[10px] font-normal text-muted-foreground">{stageDeals.length}</span>
                  </span>
                  {total > 0 && <span className="text-[10px] font-medium text-muted-foreground">${total >= 1000 ? `${(total / 1000).toFixed(0)}k` : total}</span>}
                </div>
                <div className="space-y-2">
                  {stageDeals.map(d => {
                    const daysSinceActivity = d.last_activity ? differenceInDays(new Date(), new Date(d.last_activity)) : 0;
                    const isCooling = daysSinceActivity >= 7 && !["won", "lost", "cold"].includes(d.stage);
                    return (
                      <Link key={d.id} to={`/deals/${d.id}`}>
                        <Card className={`p-3 border-l-2 ${stageColumnColors[stage.key]} transition-all hover:shadow-sm hover:border-primary/20 cursor-pointer`}>
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium leading-tight">{d.contact_name}</p>
                            {isCooling && <Snowflake className="h-3 w-3 shrink-0 text-[hsl(var(--cold))]" />}
                          </div>
                          {d.last_message && <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">"{d.last_message}"</p>}
                          <div className="mt-2 flex items-center justify-between">
                            <span className="font-display text-sm font-bold">${d.value >= 1000 ? `${(d.value / 1000).toFixed(0)}k` : d.value}</span>
                            {d.last_activity && (
                              <span className={`text-[10px] ${daysSinceActivity >= 5 ? "text-destructive" : "text-muted-foreground"}`}>
                                {formatDistanceToNow(new Date(d.last_activity), { addSuffix: true })}
                              </span>
                            )}
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
                  {stageDeals.length === 0 && (
                    <div className="rounded-lg border border-dashed py-8 text-center">
                      <p className="text-xs text-muted-foreground">No deals</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function SnapshotCard({ icon, label, value, sub, accent, warn }: { icon: React.ReactNode; label: string; value: number; sub: string; accent: string; warn?: boolean }) {
  return (
    <Card className={`p-4 ${warn ? "border-destructive/30" : ""}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={accent}>{icon}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={`font-display text-2xl font-bold ${warn ? "text-destructive" : ""}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{sub}</p>
    </Card>
  );
}
