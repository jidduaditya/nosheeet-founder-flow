import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, type ChannelKey, type ChannelStatus } from "@/stores/auth-store";
import { mockIntegrationsApi } from "@/lib/mock-auth-api";
import { OnboardingHeader } from "@/pages/ProfileSetup";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Loader2, CheckCircle2, Mail, Calendar,
  MessageCircle, FileText, Table, MailOpen,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

const channels: { key: ChannelKey; label: string; icon: React.ReactNode }[] = [
  { key: "gmail", label: "Gmail", icon: <Mail className="h-5 w-5" /> },
  { key: "outlook", label: "Outlook", icon: <MailOpen className="h-5 w-5" /> },
  { key: "whatsapp", label: "WhatsApp", icon: <MessageCircle className="h-5 w-5" /> },
  { key: "google-calendar", label: "Google Calendar", icon: <Calendar className="h-5 w-5" /> },
  { key: "notion", label: "Notion", icon: <FileText className="h-5 w-5" /> },
  { key: "sheets", label: "Google Sheets", icon: <Table className="h-5 w-5" /> },
];

export default function ConnectChannels() {
  const navigate = useNavigate();
  const { connectedChannels, setChannelStatus, setOnboardingStep } = useAuthStore();
  const [connecting, setConnecting] = useState<ChannelKey | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const hasAnyConnected = Object.values(connectedChannels).some((s) => s === "connected");

  const handleConnect = async (key: ChannelKey) => {
    if (key === "whatsapp") {
      setConnecting("whatsapp");
      setChannelStatus("whatsapp", "connecting");
      try {
        const { qr_url } = await mockIntegrationsApi.getWhatsAppQr();
        setQrUrl(qr_url);
        setQrOpen(true);
        // Poll for connection
        pollRef.current = setInterval(async () => {
          // In mock, auto-connect after ~5s
          setChannelStatus("whatsapp", "connected");
          setQrOpen(false);
          setConnecting(null);
          clearInterval(pollRef.current!);
        }, 5000);
      } catch {
        setChannelStatus("whatsapp", "not_connected");
        setConnecting(null);
      }
      return;
    }

    setConnecting(key);
    setChannelStatus(key, "connecting");
    try {
      await mockIntegrationsApi.connect(key);
      setChannelStatus(key, "connected");
    } catch {
      setChannelStatus(key, "not_connected");
    }
    setConnecting(null);
  };

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const handleNext = () => {
    setOnboardingStep(4);
    navigate("/ai-scanning");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6 animate-fade-in">
        <OnboardingHeader step={3} title="Connect channels" subtitle="Link your communication tools" />

        <Card className="divide-y">
          {channels.map(({ key, label, icon }) => {
            const status = connectedChannels[key];
            const isThisConnecting = connecting === key;
            return (
              <div key={key} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">{icon}</div>
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <StatusLabel status={status} />
                  </div>
                </div>
                {status === "connected" ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8"
                    disabled={!!connecting}
                    onClick={() => handleConnect(key)}
                  >
                    {isThisConnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Connect"}
                  </Button>
                )}
              </div>
            );
          })}
        </Card>

        <Button className="w-full gap-2" onClick={handleNext} disabled={!hasAnyConnected}>
          <ArrowRight className="h-4 w-4" />
          {hasAnyConnected ? "Continue" : "Connect at least one channel"}
        </Button>

        <button className="w-full text-xs text-muted-foreground hover:text-foreground" onClick={handleNext}>
          Skip for now
        </button>
      </div>

      {/* WhatsApp QR Dialog */}
      <Dialog open={qrOpen} onOpenChange={(v) => { if (!v) { setQrOpen(false); if (pollRef.current) clearInterval(pollRef.current); setConnecting(null); setChannelStatus("whatsapp", "not_connected"); } }}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-success" /> Connect WhatsApp
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {qrUrl ? (
              <img src={qrUrl} alt="WhatsApp QR Code" className="h-48 w-48 rounded-lg border" />
            ) : (
              <div className="flex h-48 w-48 items-center justify-center rounded-lg border">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
            <div className="text-center">
              <p className="text-sm font-medium">Scan with WhatsApp</p>
              <p className="text-xs text-muted-foreground mt-1">Open WhatsApp → Settings → Linked Devices → Link a Device</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Waiting for connection…
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusLabel({ status }: { status: ChannelStatus }) {
  if (status === "connected") return <p className="text-[11px] text-success font-medium">Connected</p>;
  if (status === "connecting") return <p className="text-[11px] text-warning font-medium">Connecting…</p>;
  return <p className="text-[11px] text-muted-foreground">Not connected</p>;
}
