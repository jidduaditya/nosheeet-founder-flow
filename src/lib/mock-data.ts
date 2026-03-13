// Mock data for the CRM - will be replaced with API calls
import { format, subDays, subHours, addDays } from "date-fns";

export type Channel = "gmail" | "whatsapp" | "calendar";
export type DealStage = "lead" | "qualified" | "proposal" | "negotiation" | "closed_won" | "closed_lost";

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  avatar_url?: string;
  last_contacted: string;
  channel: Channel;
  lead_score: number;
}

export interface Deal {
  id: string;
  title: string;
  contact_id: string;
  contact_name: string;
  value: number;
  stage: DealStage;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  contact_id: string;
  contact_name: string;
  channel: Channel;
  direction: "inbound" | "outbound";
  body: string;
  timestamp: string;
}

export interface Meeting {
  id: string;
  contact_id: string;
  contact_name: string;
  title: string;
  start_time: string;
  end_time: string;
  location?: string;
}

export interface Reminder {
  id: string;
  contact_id: string;
  contact_name: string;
  text: string;
  due_at: string;
  is_done: boolean;
  auto_generated: boolean;
}

export interface LeadSummary {
  id: string;
  contact_id: string;
  contact_name: string;
  summary: string;
  generated_at: string;
}

export interface MergeRequest {
  id: string;
  source_contact: { id: string; name: string; email: string; company?: string };
  target_contact: { id: string; name: string; email: string; company?: string };
  confidence: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface Integration {
  id: string;
  name: string;
  type: Channel;
  status: "connected" | "disconnected" | "error";
  last_sync?: string;
  account?: string;
}

const now = new Date();

export const mockContacts: Contact[] = [
  { id: "1", name: "Priya Sharma", email: "priya@acmecorp.com", phone: "+91 98765 43210", company: "Acme Corp", last_contacted: subHours(now, 2).toISOString(), channel: "whatsapp", lead_score: 85 },
  { id: "2", name: "James Chen", email: "james@startupxyz.io", company: "StartupXYZ", last_contacted: subHours(now, 6).toISOString(), channel: "gmail", lead_score: 72 },
  { id: "3", name: "Sarah Miller", email: "sarah@bigco.com", phone: "+1 555 0123", company: "BigCo", last_contacted: subDays(now, 1).toISOString(), channel: "calendar", lead_score: 91 },
  { id: "4", name: "Raj Patel", email: "raj@techfirm.in", company: "TechFirm", last_contacted: subDays(now, 2).toISOString(), channel: "whatsapp", lead_score: 64 },
  { id: "5", name: "Emma Wilson", email: "emma@designlab.co", phone: "+44 7700 900000", company: "DesignLab", last_contacted: subDays(now, 3).toISOString(), channel: "gmail", lead_score: 78 },
  { id: "6", name: "Carlos Rodriguez", email: "carlos@latamvc.com", company: "LatAm VC", last_contacted: subDays(now, 5).toISOString(), channel: "gmail", lead_score: 55 },
];

export const mockDeals: Deal[] = [
  { id: "d1", title: "Acme Annual License", contact_id: "1", contact_name: "Priya Sharma", value: 24000, stage: "negotiation", created_at: subDays(now, 14).toISOString(), updated_at: subHours(now, 3).toISOString() },
  { id: "d2", title: "StartupXYZ Pilot", contact_id: "2", contact_name: "James Chen", value: 5000, stage: "proposal", created_at: subDays(now, 7).toISOString(), updated_at: subDays(now, 1).toISOString() },
  { id: "d3", title: "BigCo Enterprise", contact_id: "3", contact_name: "Sarah Miller", value: 120000, stage: "qualified", created_at: subDays(now, 3).toISOString(), updated_at: subDays(now, 1).toISOString() },
  { id: "d4", title: "TechFirm Integration", contact_id: "4", contact_name: "Raj Patel", value: 8500, stage: "lead", created_at: subDays(now, 10).toISOString(), updated_at: subDays(now, 2).toISOString() },
  { id: "d5", title: "DesignLab Retainer", contact_id: "5", contact_name: "Emma Wilson", value: 36000, stage: "closed_won", created_at: subDays(now, 30).toISOString(), updated_at: subDays(now, 5).toISOString() },
  { id: "d6", title: "LatAm Fund Tools", contact_id: "6", contact_name: "Carlos Rodriguez", value: 15000, stage: "lead", created_at: subDays(now, 2).toISOString(), updated_at: subDays(now, 1).toISOString() },
];

export const mockMessages: Message[] = [
  { id: "m1", contact_id: "1", contact_name: "Priya Sharma", channel: "whatsapp", direction: "inbound", body: "Hi! Just checked the proposal. The pricing looks good but we need to discuss the support SLA.", timestamp: subHours(now, 2).toISOString() },
  { id: "m2", contact_id: "1", contact_name: "Priya Sharma", channel: "whatsapp", direction: "outbound", body: "Thanks Priya! I can offer 24/7 support for the first year. Want to hop on a call tomorrow?", timestamp: subHours(now, 1.5).toISOString() },
  { id: "m3", contact_id: "2", contact_name: "James Chen", channel: "gmail", direction: "inbound", body: "Following up on our conversation. The team loved the demo. Can you send over the pilot agreement?", timestamp: subHours(now, 6).toISOString() },
  { id: "m4", contact_id: "3", contact_name: "Sarah Miller", channel: "gmail", direction: "outbound", body: "Great meeting today Sarah. Attached is the enterprise proposal as discussed. Looking forward to your feedback.", timestamp: subDays(now, 1).toISOString() },
  { id: "m5", contact_id: "4", contact_name: "Raj Patel", channel: "whatsapp", direction: "inbound", body: "Can we reschedule Thursday's call to Friday? Something came up.", timestamp: subDays(now, 2).toISOString() },
  { id: "m6", contact_id: "5", contact_name: "Emma Wilson", channel: "gmail", direction: "inbound", body: "The contract is signed! Looking forward to working together. When can we kick off?", timestamp: subDays(now, 3).toISOString() },
  { id: "m7", contact_id: "1", contact_name: "Priya Sharma", channel: "whatsapp", direction: "inbound", body: "Yes, 3pm works. Talk then!", timestamp: subHours(now, 1).toISOString() },
];

export const mockMeetings: Meeting[] = [
  { id: "mt1", contact_id: "1", contact_name: "Priya Sharma", title: "SLA Discussion", start_time: addDays(now, 1).toISOString(), end_time: addDays(now, 1).toISOString(), location: "Google Meet" },
  { id: "mt2", contact_id: "3", contact_name: "Sarah Miller", title: "Enterprise Proposal Review", start_time: addDays(now, 2).toISOString(), end_time: addDays(now, 2).toISOString(), location: "Zoom" },
  { id: "mt3", contact_id: "4", contact_name: "Raj Patel", title: "Integration Deep-dive", start_time: addDays(now, 3).toISOString(), end_time: addDays(now, 3).toISOString() },
];

export const mockReminders: Reminder[] = [
  { id: "r1", contact_id: "1", contact_name: "Priya Sharma", text: "Follow up on SLA terms after tomorrow's call", due_at: addDays(now, 1).toISOString(), is_done: false, auto_generated: true },
  { id: "r2", contact_id: "2", contact_name: "James Chen", text: "Send pilot agreement document", due_at: now.toISOString(), is_done: false, auto_generated: true },
  { id: "r3", contact_id: "3", contact_name: "Sarah Miller", text: "Check if Sarah reviewed the enterprise proposal", due_at: addDays(now, 3).toISOString(), is_done: false, auto_generated: true },
  { id: "r4", contact_id: "5", contact_name: "Emma Wilson", text: "Schedule kickoff meeting with DesignLab", due_at: subDays(now, 1).toISOString(), is_done: false, auto_generated: false },
  { id: "r5", contact_id: "6", contact_name: "Carlos Rodriguez", text: "Prepare pricing deck for LatAm VC", due_at: addDays(now, 2).toISOString(), is_done: false, auto_generated: true },
];

export const mockLeadSummaries: LeadSummary[] = [
  { id: "ls1", contact_id: "1", contact_name: "Priya Sharma", summary: "Hot lead. Actively negotiating annual license. Interested in premium support. Decision expected this week.", generated_at: subHours(now, 1).toISOString() },
  { id: "ls2", contact_id: "3", contact_name: "Sarah Miller", summary: "Enterprise deal with high ACV. Proposal sent, awaiting review. Champion identified internally.", generated_at: subDays(now, 1).toISOString() },
];

export const DEAL_STAGES: { key: DealStage; label: string }[] = [
  { key: "lead", label: "Lead" },
  { key: "qualified", label: "Qualified" },
  { key: "proposal", label: "Proposal" },
  { key: "negotiation", label: "Negotiation" },
  { key: "closed_won", label: "Won" },
  { key: "closed_lost", label: "Lost" },
];
