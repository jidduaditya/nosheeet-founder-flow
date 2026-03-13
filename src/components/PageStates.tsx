import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";

export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20 animate-fade-in">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

export function PageError({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <Card className="mx-auto max-w-sm flex flex-col items-center justify-center py-12 text-center animate-fade-in">
      <AlertTriangle className="h-8 w-8 text-destructive/60 mb-3" />
      <p className="text-sm font-medium">Something went wrong</p>
      <p className="mt-1 text-xs text-muted-foreground">{message || "Failed to load data"}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={onRetry}>
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </Button>
      )}
    </Card>
  );
}

export function InlineLoader() {
  return (
    <div className="flex items-center gap-2 py-4">
      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      <span className="text-xs text-muted-foreground">Loading…</span>
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <Card className={`p-4 animate-pulse ${className ?? ""}`}>
      <div className="h-3 w-2/3 rounded bg-muted mb-2" />
      <div className="h-2.5 w-1/2 rounded bg-muted mb-3" />
      <div className="h-2 w-full rounded bg-muted mb-1.5" />
      <div className="h-2 w-4/5 rounded bg-muted" />
    </Card>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
