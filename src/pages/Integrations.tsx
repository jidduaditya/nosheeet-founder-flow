import { useState } from "react";
import { mockIntegrations, Integration } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChannelBadge } from "@/components/ChannelBadge";
import { Plug, RefreshCw, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Integrations() {
  const [integrations, setIntegrations] = useState(mockIntegrations);

  const toggleConnection = (id: string) => {
    setIntegrations(prev => prev.map(i =>
      i.id === id
        ? { ...i, status: i.status === "connected" ? "disconnected" as const : "connected" as const, last_sync: i.status === "disconnected" ? new Date().toISOString() : i.last_sync }
        : i
    ));
  };

  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight flex items-center gap-2">
          <Plug className="h-6 w-6 text-primary" />
          Integrations
        </h1>
        <p className="text-sm text-muted-foreground">Manage your connected data sources</p>
      </div>

      <div className="space-y-3">
        {integrations.map(integration => (
          <Card key={integration.id} className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <ChannelBadge channel={integration.type} />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{integration.name}</p>
                  {integration.account && (
                    <p className="text-xs text-muted-foreground truncate">{integration.account}</p>
                  )}
                  <div className="mt-1 flex items-center gap-2">
                    <StatusIndicator status={integration.status} />
                    {integration.last_sync && integration.status === "connected" && (
                      <span className="text-[10px] text-muted-foreground">
                        Synced {formatDistanceToNow(new Date(integration.last_sync), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {integration.status === "connected" && (
                  <Button size="sm" variant="ghost" className="h-8 px-2">
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant={integration.status === "connected" ? "outline" : "default"}
                  className="h-8"
                  onClick={() => toggleConnection(integration.id)}
                >
                  {integration.status === "connected" ? "Disconnect" : "Connect"}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-dashed p-6 text-center">
        <p className="text-sm text-muted-foreground">More integrations coming soon</p>
        <p className="text-xs text-muted-foreground mt-1">Slack, LinkedIn, HubSpot import</p>
      </Card>
    </div>
  );
}

function StatusIndicator({ status }: { status: Integration["status"] }) {
  switch (status) {
    case "connected":
      return (
        <span className="flex items-center gap-1 text-[10px] font-medium text-success">
          <CheckCircle2 className="h-3 w-3" /> Connected
        </span>
      );
    case "disconnected":
      return (
        <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
          <XCircle className="h-3 w-3" /> Disconnected
        </span>
      );
    case "error":
      return (
        <span className="flex items-center gap-1 text-[10px] font-medium text-destructive">
          <AlertTriangle className="h-3 w-3" /> Error
        </span>
      );
  }
}
