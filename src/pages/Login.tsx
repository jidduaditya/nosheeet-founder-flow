import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";
import { authApi } from "@/lib/auth-api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Mail, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { setUser, setSessionToken, onboardingComplete } = useAuthStore();
  const [tab, setTab] = useState<"phone" | "email">("phone");

  // Phone state
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  // Email state
  const [email, setEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    setError("");
    try {
      await mockAuthApi.sendOtp(phone);
      setOtpSent(true);
    } catch { setError("Failed to send OTP"); }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await mockAuthApi.verifyOtp(phone, otp);
      setSessionToken(res.token);
      setUser({ id: res.user.id, phone: res.user.phone });
      navigate(onboardingComplete ? "/dashboard" : "/profile-setup");
    } catch { setError("Invalid OTP"); }
    setLoading(false);
  };

  const handleMagicLink = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      await mockAuthApi.magicLink(email);
      setMagicLinkSent(true);
    } catch { setError("Failed to send magic link"); }
    setLoading(false);
  };

  // For demo: simulate magic link verification
  const handleSimulateMagicLink = async () => {
    setLoading(true);
    try {
      const session = await mockAuthApi.getSession();
      setSessionToken("mock-magic-token-" + Date.now());
      setUser({ id: session.user.id, email, name: session.user.name });
      navigate(onboardingComplete ? "/dashboard" : "/profile-setup");
    } catch { setError("Verification failed"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6 animate-fade-in">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary font-display text-xl font-bold text-primary-foreground">
            N
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Welcome to NoSheeet</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to get started</p>
        </div>

        <Card className="p-5">
          <Tabs value={tab} onValueChange={(v) => { setTab(v as "phone" | "email"); setError(""); }}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="phone" className="gap-1.5"><Phone className="h-3.5 w-3.5" /> Phone</TabsTrigger>
              <TabsTrigger value="email" className="gap-1.5"><Mail className="h-3.5 w-3.5" /> Email</TabsTrigger>
            </TabsList>

            <TabsContent value="phone" className="space-y-3">
              {!otpSent ? (
                <>
                  <Input placeholder="+1 (555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" />
                  <Button className="w-full gap-2" onClick={handleSendOtp} disabled={loading || !phone.trim()}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    Send OTP
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground">Enter the 6-digit code sent to <span className="font-medium text-foreground">{phone}</span></p>
                  <Input placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} className="text-center tracking-[0.3em] text-lg font-mono" />
                  <Button className="w-full gap-2" onClick={handleVerifyOtp} disabled={loading || otp.length < 4}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Verify
                  </Button>
                  <button className="w-full text-xs text-muted-foreground hover:text-foreground" onClick={() => { setOtpSent(false); setOtp(""); }}>
                    Use a different number
                  </button>
                </>
              )}
            </TabsContent>

            <TabsContent value="email" className="space-y-3">
              {!magicLinkSent ? (
                <>
                  <Input placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
                  <Button className="w-full gap-2" onClick={handleMagicLink} disabled={loading || !email.trim()}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                    Send Magic Link
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-center py-3">
                    <Mail className="mx-auto h-8 w-8 text-primary/60 mb-2" />
                    <p className="text-sm font-medium">Check your inbox</p>
                    <p className="text-xs text-muted-foreground mt-1">We sent a link to <span className="font-medium text-foreground">{email}</span></p>
                  </div>
                  <Button variant="outline" className="w-full gap-2" onClick={handleSimulateMagicLink} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    Simulate verification (demo)
                  </Button>
                  <button className="w-full text-xs text-muted-foreground hover:text-foreground" onClick={() => { setMagicLinkSent(false); setEmail(""); }}>
                    Use a different email
                  </button>
                </>
              )}
            </TabsContent>
          </Tabs>

          {error && <p className="mt-3 text-center text-xs text-destructive">{error}</p>}
        </Card>

        <p className="text-center text-[11px] text-muted-foreground">
          By signing in you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
