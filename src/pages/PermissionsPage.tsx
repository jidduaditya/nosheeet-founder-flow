import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, type Permissions } from "@/stores/auth-store";
import { mockPermissionsApi } from "@/lib/mock-auth-api";
import { OnboardingHeader } from "@/pages/ProfileSetup";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Mic, CalendarDays, MapPin, ArrowRight, Loader2, ShieldCheck } from "lucide-react";

const permItems: { key: keyof Permissions; label: string; desc: string; icon: React.ReactNode }[] = [
  { key: "microphone", label: "Microphone", desc: "Record and transcribe meetings", icon: <Mic className="h-5 w-5" /> },
  { key: "calendar", label: "Calendar", desc: "Auto-detect upcoming meetings", icon: <CalendarDays className="h-5 w-5" /> },
  { key: "location", label: "Location", desc: "Context-aware reminders", icon: <MapPin className="h-5 w-5" /> },
];

export default function PermissionsPage() {
  const navigate = useNavigate();
  const { permissions, setPermission, setOnboardingStep } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setLoading(true);
    try {
      await mockPermissionsApi.update({
        mic: permissions.microphone,
        calendar: permissions.calendar,
        location: permissions.location,
      });
    } catch { /* proceed anyway */ }
    setOnboardingStep(3);
    navigate("/connect-channels");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6 animate-fade-in">
        <OnboardingHeader step={2} title="Permissions" subtitle="Enable features to get the most out of NoSheeet" />

        <Card className="p-5 space-y-1">
          {permItems.map(({ key, label, desc, icon }) => (
            <div key={key} className="flex items-center justify-between gap-3 py-3 border-b last:border-0">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">{icon}</div>
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
              <Switch checked={permissions[key]} onCheckedChange={(v) => setPermission(key, v)} />
            </div>
          ))}
        </Card>

        <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Permissions can be changed anytime in Settings. Your data stays on your device.
          </p>
        </div>

        <Button className="w-full gap-2" onClick={handleNext} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          Continue
        </Button>
      </div>
    </div>
  );
}
