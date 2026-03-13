import { DEAL_STAGES, DealStage } from "@/lib/mock-data";
import { useDeals } from "@/hooks/use-api";
import { PageLoader, PageError } from "@/components/PageStates";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Trophy, XCircle, Snowflake } from "lucide-react";

const stageColors: Record<DealStage, string> = {
  discovery: "bg-muted",
  demo: "bg-primary/10",
  proposal: "bg-primary/20",
  won: "bg-success/10",
  lost: "bg-destructive/10",
  cold: "bg-[hsl(var(--cold))]/10",
};

const stageIcons: Partial<Record<DealStage, React.ReactNode>> = {
  won: <Trophy className="h-3.5 w-3.5 text-success" />,
  lost: <XCircle className="h-3.5 w-3.5 text-destructive" />,
  cold: <Snowflake className="h-3.5 w-3.5 text-[hsl(var(--cold))]" />,
};

export default function Deals() {
  const { data: deals, isLoading, error, refetch } = useDeals();

  if (isLoading) return <PageLoader />;
  if (error) return <PageError message={error.message} onRetry={() => refetch()} />;

  const allDeals = deals ?? [];

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Deals Pipeline</h1>
        <p className="text-sm text-muted-foreground">
          ${allDeals.filter(d => !["won", "lost", "cold"].includes(d.stage)).reduce((s, d) => s + d.value, 0).toLocaleString()} in active pipeline
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {DEAL_STAGES.map(stage => {
          const stageDeals = allDeals.filter(d => d.stage === stage.key);
          const total = stageDeals.reduce((s, d) => s + d.value, 0);
          return (
            <div key={stage.key} className="min-w-[220px] flex-1">
              <div className={`mb-2 flex items-center justify-between rounded-lg px-3 py-2 ${stageColors[stage.key]}`}>
                <span className="flex items-center gap-1.5 text-xs font-semibold">
                  {stageIcons[stage.key]}
                  {stage.label}
                  <span className="ml-1 rounded-full bg-background px-1.5 py-0.5 text-[10px] font-normal text-muted-foreground">{stageDeals.length}</span>
                </span>
                {total > 0 && <span className="text-[10px] text-muted-foreground">${(total / 1000).toFixed(0)}k</span>}
              </div>
              <div className="space-y-2">
                {stageDeals.map(d => (
                  <Link key={d.id} to={`/deals/${d.id}`}>
                    <Card className="p-3 transition-colors hover:border-primary/30 cursor-pointer">
                      <p className="text-sm font-medium">{d.title}</p>
                      <p className="text-xs text-muted-foreground">{d.contact_name}</p>
                      {d.last_message && <p className="mt-1 text-xs text-muted-foreground truncate">"{d.last_message}"</p>}
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="font-display text-base font-bold">${d.value.toLocaleString()}</span>
                        {d.last_activity && (
                          <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(d.last_activity), { addSuffix: true })}</span>
                        )}
                      </div>
                    </Card>
                  </Link>
                ))}
                {stageDeals.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">No deals</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
