import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User, ArrowRight, Loader2 } from "lucide-react";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { user, setUser, setOnboardingStep } = useAuthStore();
  const [name, setName] = useState(user?.name ?? "");
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!name.trim()) return;
    setLoading(true);
    // Simulate save
    await new Promise((r) => setTimeout(r, 400));
    setUser({ ...user!, name: name.trim() });
    setOnboardingStep(2);
    navigate("/permissions");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6 animate-fade-in">
        <OnboardingHeader step={1} title="Set up your profile" subtitle="Tell us a bit about yourself" />

        <Card className="p-5 space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" placeholder="Jane Smith" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <Button className="w-full gap-2" onClick={handleNext} disabled={loading || !name.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            Continue
          </Button>
        </Card>
      </div>
    </div>
  );
}

export function OnboardingHeader({ step, title, subtitle }: { step: number; title: string; subtitle: string }) {
  const steps = ["Profile", "Permissions", "Channels", "Scan"];
  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${i + 1 <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {i + 1}
            </div>
            {i < steps.length - 1 && <div className={`h-px w-6 ${i + 1 < step ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>
      <div>
        <h1 className="font-display text-xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
