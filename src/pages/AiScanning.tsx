import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";
import { mockScanApi } from "@/lib/mock-auth-api";
import { OnboardingHeader } from "@/pages/ProfileSetup";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, CheckCircle2, Users, ArrowRight, Loader2 } from "lucide-react";

export default function AiScanning() {
  const navigate = useNavigate();
  const { setOnboardingComplete, setOnboardingStep } = useAuthStore();
  const [status, setStatus] = useState<"idle" | "scanning" | "complete" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [contactsFound, setContactsFound] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const startScan = async () => {
    setStatus("scanning");
    try {
      await mockScanApi.startScan();
      pollRef.current = setInterval(async () => {
        try {
          const res = await mockScanApi.getScanStatus();
          setProgress(res.progress);
          setContactsFound(res.contacts_found ?? 0);
          if (res.status === "complete") {
            setStatus("complete");
            clearInterval(pollRef.current!);
          } else if (res.status === "error") {
            setStatus("error");
            clearInterval(pollRef.current!);
          }
        } catch {
          setStatus("error");
          clearInterval(pollRef.current!);
        }
      }, 1500);
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    startScan();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const handleFinish = () => {
    setOnboardingComplete(true);
    setOnboardingStep(5);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6 animate-fade-in">
        <OnboardingHeader step={4} title="AI Scanning" subtitle="Analyzing your conversations" />

        <Card className="p-6 text-center space-y-5">
          {status === "scanning" && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-7 w-7 text-primary animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-medium">Scanning your channels…</p>
                <p className="text-xs text-muted-foreground mt-1">This usually takes a minute or two</p>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="font-mono">{progress}%</span>
                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {contactsFound} contacts found</span>
              </div>
            </>
          )}

          {status === "complete" && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <div>
                <p className="text-lg font-display font-bold">Scan Complete!</p>
                <p className="text-sm text-muted-foreground mt-1">Found <span className="font-semibold text-foreground">{contactsFound}</span> contacts across your channels</p>
              </div>
              <Button className="w-full gap-2" onClick={handleFinish}>
                <ArrowRight className="h-4 w-4" /> Go to Dashboard
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <p className="text-sm text-destructive">Something went wrong during scanning</p>
              <Button variant="outline" onClick={() => { setStatus("idle"); startScan(); }}>
                <Loader2 className="h-4 w-4 mr-2" /> Retry
              </Button>
            </>
          )}

          {status === "idle" && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </Card>

        {status === "scanning" && (
          <button className="w-full text-xs text-muted-foreground hover:text-foreground" onClick={handleFinish}>
            Skip and set up later
          </button>
        )}
      </div>
    </div>
  );
}
