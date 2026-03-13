import { Channel } from "@/lib/mock-data";
import { Mail, MessageCircle, Calendar } from "lucide-react";

const config: Record<Channel, { icon: typeof Mail; label: string; badgeClass: string }> = {
  gmail: { icon: Mail, label: "Gmail", badgeClass: "channel-badge-gmail" },
  whatsapp: { icon: MessageCircle, label: "WhatsApp", badgeClass: "channel-badge-whatsapp" },
  calendar: { icon: Calendar, label: "Calendar", badgeClass: "channel-badge-calendar" },
};

export function ChannelBadge({ channel, showLabel = true }: { channel: Channel; showLabel?: boolean }) {
  const c = config[channel];
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${c.badgeClass}`}>
      <Icon className="h-3 w-3" />
      {showLabel && c.label}
    </span>
  );
}
