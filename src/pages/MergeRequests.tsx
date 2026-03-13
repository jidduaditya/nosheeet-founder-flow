import { useState } from "react";
import { mockMergeRequests, type MergeRequest, type MergeContactInfo } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChannelBadge } from "@/components/ChannelBadge";
import { Separator } from "@/components/ui/separator";
import {
  GitMerge,
  Check,
  X,
  User,
  Mail,
  Phone,
  Building2,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function MergeRequests() {
  const [requests, setRequests] = useState(mockMergeRequests);

  const updateStatus = (id: string, status: MergeRequest["status"]) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const pending = requests.filter(r => r.status === "pending");
  const resolved = requests.filter(r => r.status !== "pending");

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight flex items-center gap-2">
            <GitMerge className="h-6 w-6 text-primary" />
            Merge Requests
          </h1>
          <p className="text-sm text-muted-foreground">
            {pending.length} duplicate{pending.length !== 1 ? "s" : ""} detected — review and merge or keep separate
          </p>
        </div>
        {pending.length > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-1 text-[11px] font-semibold text-warning">
            <AlertTriangle className="h-3 w-3" /> {pending.length} pending
          </span>
        )}
      </div>

      {/* Empty state */}
      {pending.length === 0 && resolved.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <GitMerge className="h-12 w-12 text-muted-foreground/20 mb-3" />
          <p className="text-sm font-medium">No duplicates detected</p>
          <p className="text-xs text-muted-foreground mt-1">
            When duplicate contacts are found, they'll appear here for review
          </p>
        </Card>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Pending Review
          </h2>
          {pending.map(mr => (
            <MergeCard
              key={mr.id}
              mr={mr}
              onMerge={() => updateStatus(mr.id, "approved")}
              onKeepSeparate={() => updateStatus(mr.id, "rejected")}
            />
          ))}
        </section>
      )}

      {/* Resolved */}
      {resolved.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Resolved
          </h2>
          {resolved.map(mr => (
            <MergeCard key={mr.id} mr={mr} resolved />
          ))}
        </section>
      )}
    </div>
  );
}

// ─── Merge card with side-by-side layout ────────────────────────
function MergeCard({
  mr,
  onMerge,
  onKeepSeparate,
  resolved,
}: {
  mr: MergeRequest;
  onMerge?: () => void;
  onKeepSeparate?: () => void;
  resolved?: boolean;
}) {
  // Highlight fields that differ
  const nameDiffers = mr.source_contact.name !== mr.target_contact.name;
  const emailDiffers = mr.source_contact.email !== mr.target_contact.email;
  const phoneDiffers = mr.source_contact.phone !== mr.target_contact.phone;

  return (
    <Card className={`overflow-hidden transition-opacity ${resolved ? "opacity-60" : ""}`}>
      {/* Confidence header */}
      <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5 bg-muted/30">
        <div className="flex items-center gap-2">
          <GitMerge className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium">{mr.reason}</span>
        </div>
        <div className="flex items-center gap-2">
          <ConfidenceBadge confidence={mr.confidence} />
          <span className="text-[10px] text-muted-foreground">
            {formatDistanceToNow(new Date(mr.created_at), { addSuffix: true })}
          </span>
          {mr.status !== "pending" && (
            <Badge
              variant={mr.status === "approved" ? "default" : "secondary"}
              className="text-[10px] gap-1"
            >
              {mr.status === "approved" ? (
                <><CheckCircle2 className="h-2.5 w-2.5" /> Merged</>
              ) : (
                <><XCircle className="h-2.5 w-2.5" /> Kept Separate</>
              )}
            </Badge>
          )}
        </div>
      </div>

      {/* Side-by-side cards */}
      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-0">
        {/* Left contact */}
        <ContactCard
          contact={mr.source_contact}
          label="Duplicate"
          nameDiffers={nameDiffers}
          emailDiffers={emailDiffers}
          phoneDiffers={phoneDiffers}
        />

        {/* Center divider */}
        <div className="hidden md:flex flex-col items-center justify-center px-2">
          <div className="h-full w-px bg-border" />
          <div className="my-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <GitMerge className="h-4 w-4 text-primary" />
          </div>
          <div className="h-full w-px bg-border" />
        </div>
        <div className="md:hidden border-t" />

        {/* Right contact */}
        <ContactCard
          contact={mr.target_contact}
          label="Primary"
          primary
          nameDiffers={nameDiffers}
          emailDiffers={emailDiffers}
          phoneDiffers={phoneDiffers}
        />
      </div>

      {/* Actions */}
      {!resolved && (
        <div className="flex items-center justify-between gap-3 border-t px-4 py-3 bg-muted/20">
          <p className="text-[11px] text-muted-foreground">
            Merging will combine conversation timelines into the primary contact
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={onKeepSeparate}
            >
              <X className="h-3.5 w-3.5" /> Keep Separate
            </Button>
            <Button
              size="sm"
              className="h-8 gap-1.5"
              onClick={onMerge}
            >
              <GitMerge className="h-3.5 w-3.5" /> Merge Contacts
            </Button>
          </div>
        </div>
      )}

      {/* Merged confirmation */}
      {resolved && mr.status === "approved" && (
        <div className="flex items-center gap-2 border-t px-4 py-2.5 bg-success/5">
          <CheckCircle2 className="h-3.5 w-3.5 text-success" />
          <p className="text-[11px] text-success font-medium">
            Contacts merged — conversation timelines combined
          </p>
        </div>
      )}
    </Card>
  );
}

// ─── Individual contact card ────────────────────────────────────
function ContactCard({
  contact,
  label,
  primary,
  nameDiffers,
  emailDiffers,
  phoneDiffers,
}: {
  contact: MergeContactInfo;
  label: string;
  primary?: boolean;
  nameDiffers: boolean;
  emailDiffers: boolean;
  phoneDiffers: boolean;
}) {
  return (
    <div className={`p-4 ${primary ? "bg-primary/[0.02]" : ""}`}>
      {/* Label */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
          primary
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        }`}>
          {label}
        </span>
        {contact.channel && <ChannelBadge channel={contact.channel} />}
      </div>

      {/* Avatar + name */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-full font-display text-sm font-bold ${
          primary
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
        }`}>
          {contact.name.split(" ").map(n => n[0]).join("")}
        </div>
        <div>
          <p className={`text-sm font-semibold ${nameDiffers ? "underline decoration-warning decoration-2 underline-offset-2" : ""}`}>
            {contact.name}
          </p>
          {contact.company && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3 w-3" /> {contact.company}
            </p>
          )}
        </div>
      </div>

      {/* Contact fields */}
      <div className="space-y-2">
        <FieldRow
          icon={<Mail className="h-3 w-3" />}
          label="Email"
          value={contact.email}
          highlighted={emailDiffers}
        />
        {contact.phone && (
          <FieldRow
            icon={<Phone className="h-3 w-3" />}
            label="Phone"
            value={contact.phone}
            highlighted={phoneDiffers}
          />
        )}
        {!contact.phone && (
          <FieldRow
            icon={<Phone className="h-3 w-3" />}
            label="Phone"
            value="—"
            muted
          />
        )}
      </div>

      {/* Last message */}
      {contact.last_message && (
        <div className="mt-3 rounded-md bg-muted/50 p-2.5">
          <p className="text-[10px] font-medium text-muted-foreground mb-0.5 flex items-center gap-1">
            <MessageSquare className="h-3 w-3" /> Last message
          </p>
          <p className="text-xs leading-relaxed line-clamp-2">"{contact.last_message}"</p>
        </div>
      )}
    </div>
  );
}

// ─── Field row ──────────────────────────────────────────────────
function FieldRow({
  icon,
  label,
  value,
  highlighted,
  muted,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlighted?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        {icon} {label}
      </span>
      <span className={`text-xs truncate max-w-[180px] text-right ${
        highlighted
          ? "font-medium underline decoration-warning decoration-1 underline-offset-2"
          : muted
            ? "text-muted-foreground"
            : ""
      }`}>
        {value}
      </span>
    </div>
  );
}

// ─── Confidence badge ───────────────────────────────────────────
function ConfidenceBadge({ confidence }: { confidence: number }) {
  const color = confidence >= 90
    ? "bg-success/10 text-success"
    : confidence >= 75
      ? "bg-warning/10 text-warning"
      : "bg-muted text-muted-foreground";

  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${color}`}>
      {confidence}% match
    </span>
  );
}
