import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, User, Bell, Shield } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-primary" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Card className="p-5 space-y-4">
        <h2 className="font-display text-sm font-semibold flex items-center gap-1.5">
          <User className="h-4 w-4 text-primary" /> Profile
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs">Full Name</Label>
            <Input id="name" defaultValue="Founder" className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs">Email</Label>
            <Input id="email" defaultValue="founder@nosheeet.com" className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="company" className="text-xs">Company</Label>
            <Input id="company" defaultValue="NoSheeet" className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="timezone" className="text-xs">Timezone</Label>
            <Input id="timezone" defaultValue="UTC+5:30" className="h-9" />
          </div>
        </div>
        <Button size="sm">Save changes</Button>
      </Card>

      {/* Notifications */}
      <Card className="p-5 space-y-4">
        <h2 className="font-display text-sm font-semibold flex items-center gap-1.5">
          <Bell className="h-4 w-4 text-primary" /> Notifications
        </h2>
        <div className="space-y-3">
          <SettingToggle label="AI-generated reminders" description="Get auto-reminders based on conversation analysis" defaultChecked />
          <Separator />
          <SettingToggle label="Email digest" description="Daily summary of conversations and deals" defaultChecked />
          <Separator />
          <SettingToggle label="Merge request alerts" description="Notify when duplicate contacts are detected" defaultChecked />
          <Separator />
          <SettingToggle label="Deal stage changes" description="Alerts when deals move between stages" />
        </div>
      </Card>

      {/* Privacy */}
      <Card className="p-5 space-y-4">
        <h2 className="font-display text-sm font-semibold flex items-center gap-1.5">
          <Shield className="h-4 w-4 text-primary" /> Privacy & Data
        </h2>
        <div className="space-y-3">
          <SettingToggle label="AI conversation analysis" description="Allow AI to analyze conversations for insights and reminders" defaultChecked />
          <Separator />
          <SettingToggle label="Auto-capture messages" description="Automatically import messages from connected channels" defaultChecked />
        </div>
      </Card>

      <div className="pb-4">
        <Button variant="destructive" size="sm">Delete Account</Button>
        <p className="mt-1 text-[10px] text-muted-foreground">This action cannot be undone</p>
      </div>
    </div>
  );
}

function SettingToggle({ label, description, defaultChecked }: { label: string; description: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
