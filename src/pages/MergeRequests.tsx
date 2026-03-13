import { useState } from "react";
import { mockMergeRequests, MergeRequest } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitMerge, Check, X, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function MergeRequests() {
  const [requests, setRequests] = useState(mockMergeRequests);

  const updateStatus = (id: string, status: MergeRequest["status"]) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const pending = requests.filter(r => r.status === "pending");
  const resolved = requests.filter(r => r.status !== "pending");

  return (
    <div className="max-w-3xl space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight flex items-center gap-2">
          <GitMerge className="h-6 w-6 text-primary" />
          Merge Requests
        </h1>
        <p className="text-sm text-muted-foreground">{pending.length} pending duplicates to review</p>
      </div>

      {pending.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <GitMerge className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium">All clear!</p>
          <p className="text-xs text-muted-foreground">No pending merge requests</p>
        </Card>
      )}

      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-sm font-semibold">Pending Review</h2>
          {pending.map(mr => (
            <MergeCard key={mr.id} mr={mr} onApprove={() => updateStatus(mr.id, "approved")} onReject={() => updateStatus(mr.id, "rejected")} />
          ))}
        </div>
      )}

      {resolved.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-sm font-semibold text-muted-foreground">Resolved</h2>
          {resolved.map(mr => (
            <MergeCard key={mr.id} mr={mr} resolved />
          ))}
        </div>
      )}
    </div>
  );
}

function MergeCard({ mr, onApprove, onReject, resolved }: {
  mr: MergeRequest;
  onApprove?: () => void;
  onReject?: () => void;
  resolved?: boolean;
}) {
  return (
    <Card className={`p-4 transition-opacity ${resolved ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Contact comparison */}
          <div className="flex items-center gap-2 flex-wrap">
            <ContactChip name={mr.source_contact.name} email={mr.source_contact.email} />
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            <ContactChip name={mr.target_contact.name} email={mr.target_contact.email} primary />
          </div>

          <p className="mt-2 text-xs text-muted-foreground">{mr.reason}</p>

          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">
              {mr.confidence}% match
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              {formatDistanceToNow(new Date(mr.created_at), { addSuffix: true })}
            </span>
            {mr.status !== "pending" && (
              <Badge variant={mr.status === "approved" ? "default" : "destructive"} className="text-[10px]">
                {mr.status === "approved" ? "Merged" : "Rejected"}
              </Badge>
            )}
          </div>
        </div>

        {!resolved && (
          <div className="flex gap-1.5 shrink-0">
            <Button size="sm" variant="outline" onClick={onReject} className="h-8 px-2.5">
              <X className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" onClick={onApprove} className="h-8 px-2.5">
              <Check className="h-3.5 w-3.5 mr-1" /> Merge
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

function ContactChip({ name, email, primary }: { name: string; email: string; primary?: boolean }) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm ${primary ? "bg-primary/10 border border-primary/20" : "bg-secondary"}`}>
      <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${primary ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20 text-foreground"}`}>
        {name.split(" ").map(n => n[0]).join("")}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium truncate">{name}</p>
        <p className="text-[10px] text-muted-foreground truncate">{email}</p>
      </div>
    </div>
  );
}
