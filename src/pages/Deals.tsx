import { mockDeals, DEAL_STAGES, DealStage } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const stageColors: Record<DealStage, string> = {
  lead: "bg-muted",
  qualified: "bg-primary/10",
  proposal: "bg-primary/20",
  negotiation: "bg-primary/30",
  closed_won: "bg-success/15",
  closed_lost: "bg-destructive/15",
};

export default function Deals() {
  const activeStages = DEAL_STAGES.filter(s => s.key !== "closed_lost");

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Deals Pipeline</h1>
        <p className="text-sm text-muted-foreground">
          ${mockDeals.filter(d => !["closed_won", "closed_lost"].includes(d.stage)).reduce((s, d) => s + d.value, 0).toLocaleString()} in pipeline
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {activeStages.map(stage => {
          const deals = mockDeals.filter(d => d.stage === stage.key);
          const total = deals.reduce((s, d) => s + d.value, 0);
          return (
            <div key={stage.key} className="min-w-[240px] flex-1">
              <div className={`mb-2 flex items-center justify-between rounded-lg px-3 py-2 ${stageColors[stage.key]}`}>
                <span className="text-xs font-semibold">{stage.label}</span>
                <span className="text-xs text-muted-foreground">${(total / 1000).toFixed(0)}k</span>
              </div>
              <div className="space-y-2">
                {deals.map(d => (
                  <Link key={d.id} to={`/contacts/${d.contact_id}`}>
                    <Card className="p-3 transition-colors hover:border-primary/30 cursor-pointer">
                      <p className="text-sm font-medium">{d.title}</p>
                      <p className="text-xs text-muted-foreground">{d.contact_name}</p>
                      <p className="mt-1 font-display text-lg font-bold">${d.value.toLocaleString()}</p>
                    </Card>
                  </Link>
                ))}
                {deals.length === 0 && (
                  <p className="py-6 text-center text-xs text-muted-foreground">No deals</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
