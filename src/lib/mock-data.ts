// Mock data for the CRM - will be replaced with API calls
import { subDays, subHours, addDays } from "date-fns";

export type Channel = "gmail" | "whatsapp" | "calendar";
export type DealStage = "discovery" | "demo" | "proposal" | "won" | "lost" | "cold";

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
  last_message?: string;
  last_activity?: string;
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
  pain_points: string[];
  recommended_action: string;
  generated_at: string;
}

export interface MergeContactInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  channel?: Channel;
  last_message?: string;
}

export interface MergeRequest {
  id: string;
  source_contact: MergeContactInfo;
  target_contact: MergeContactInfo;
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
  { id: "7", name: "Anika Gupta", email: "anika@novafin.io", company: "NovaFin", last_contacted: subDays(now, 12).toISOString(), channel: "gmail", lead_score: 40 },
  { id: "8", name: "Tom Bradley", email: "tom@cloudstack.dev", company: "CloudStack", last_contacted: subDays(now, 9).toISOString(), channel: "whatsapp", lead_score: 33 },
];

export const mockDeals: Deal[] = [
  { id: "d1", title: "Acme Annual License", contact_id: "1", contact_name: "Priya Sharma", value: 24000, stage: "proposal", created_at: subDays(now, 14).toISOString(), updated_at: subHours(now, 3).toISOString(), last_message: "Pricing looks good, need to discuss SLA", last_activity: subHours(now, 2).toISOString() },
  { id: "d2", title: "StartupXYZ Pilot", contact_id: "2", contact_name: "James Chen", value: 5000, stage: "demo", created_at: subDays(now, 7).toISOString(), updated_at: subDays(now, 1).toISOString(), last_message: "Team loved the demo, send pilot agreement", last_activity: subHours(now, 6).toISOString() },
  { id: "d3", title: "BigCo Enterprise", contact_id: "3", contact_name: "Sarah Miller", value: 120000, stage: "discovery", created_at: subDays(now, 3).toISOString(), updated_at: subDays(now, 1).toISOString(), last_message: "Enterprise proposal attached, awaiting feedback", last_activity: subDays(now, 1).toISOString() },
  { id: "d4", title: "TechFirm Integration", contact_id: "4", contact_name: "Raj Patel", value: 8500, stage: "discovery", created_at: subDays(now, 10).toISOString(), updated_at: subDays(now, 2).toISOString(), last_message: "Can we reschedule Thursday's call?", last_activity: subDays(now, 2).toISOString() },
  { id: "d5", title: "DesignLab Retainer", contact_id: "5", contact_name: "Emma Wilson", value: 36000, stage: "won", created_at: subDays(now, 30).toISOString(), updated_at: subDays(now, 5).toISOString(), last_message: "Contract signed! When can we kick off?", last_activity: subDays(now, 3).toISOString() },
  { id: "d6", title: "LatAm Fund Tools", contact_id: "6", contact_name: "Carlos Rodriguez", value: 15000, stage: "discovery", created_at: subDays(now, 2).toISOString(), updated_at: subDays(now, 1).toISOString(), last_message: "Interested in learning more about your platform", last_activity: subDays(now, 5).toISOString() },
  { id: "d7", title: "NovaFin Analytics", contact_id: "7", contact_name: "Anika Gupta", value: 18000, stage: "cold", created_at: subDays(now, 25).toISOString(), updated_at: subDays(now, 12).toISOString(), last_message: "Will circle back next quarter", last_activity: subDays(now, 12).toISOString() },
  { id: "d8", title: "CloudStack DevTools", contact_id: "8", contact_name: "Tom Bradley", value: 9500, stage: "cold", created_at: subDays(now, 20).toISOString(), updated_at: subDays(now, 9).toISOString(), last_message: "Budget review in progress, will update", last_activity: subDays(now, 9).toISOString() },
  { id: "d9", title: "MegaTech Platform", contact_id: "3", contact_name: "Sarah Miller", value: 45000, stage: "lost", created_at: subDays(now, 40).toISOString(), updated_at: subDays(now, 15).toISOString(), last_message: "Going with a different vendor this time", last_activity: subDays(now, 15).toISOString() },
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
  { id: "r6", contact_id: "7", contact_name: "Anika Gupta", text: "Re-engage — no reply in 12 days", due_at: subDays(now, 2).toISOString(), is_done: false, auto_generated: true },
  { id: "r7", contact_id: "8", contact_name: "Tom Bradley", text: "Check on budget review status", due_at: subDays(now, 3).toISOString(), is_done: false, auto_generated: true },
];

export const mockLeadSummaries: LeadSummary[] = [
  { id: "ls1", contact_id: "1", contact_name: "Priya Sharma", summary: "Hot lead. Actively negotiating annual license. Interested in premium support. Decision expected this week.", pain_points: ["Needs 24/7 support SLA guarantee", "Concerned about onboarding timeline", "Comparing with competitor pricing"], recommended_action: "Send revised SLA document before tomorrow's call. Emphasize first-year premium support inclusion.", generated_at: subHours(now, 1).toISOString() },
  { id: "ls2", contact_id: "3", contact_name: "Sarah Miller", summary: "Enterprise deal with high ACV. Proposal sent, awaiting review. Champion identified internally.", pain_points: ["Complex procurement process", "Needs SOC 2 compliance documentation", "Multiple stakeholders involved in decision"], recommended_action: "Follow up with Sarah's internal champion. Prepare compliance documentation package.", generated_at: subDays(now, 1).toISOString() },
  { id: "ls3", contact_id: "2", contact_name: "James Chen", summary: "Small pilot deal. Team is enthusiastic after demo. Quick close potential if agreement sent promptly.", pain_points: ["Limited budget for Q1", "Needs fast integration with existing tools"], recommended_action: "Send pilot agreement today. Offer 30-day trial with dedicated onboarding support.", generated_at: subHours(now, 4).toISOString() },
  { id: "ls4", contact_id: "4", contact_name: "Raj Patel", summary: "Technical buyer exploring integration options. Needs hands-on demo of API capabilities.", pain_points: ["Requires REST API documentation", "Concerned about data migration effort"], recommended_action: "Schedule technical deep-dive. Share API documentation and migration guide.", generated_at: subDays(now, 1).toISOString() },
  { id: "ls5", contact_id: "7", contact_name: "Anika Gupta", summary: "Deal going cold. Last engagement 12 days ago. Mentioned revisiting next quarter.", pain_points: ["Budget freeze until Q2", "Internal reorganization affecting priorities"], recommended_action: "Send a brief check-in email. Offer a no-commitment Q2 planning call.", generated_at: subDays(now, 5).toISOString() },
];

export const mockMergeRequests: MergeRequest[] = [
  {
    id: "mr1",
    source_contact: { id: "temp1", name: "P. Sharma", email: "priya.s@acmecorp.com", phone: "+91 98765 43211", company: "Acme Corp", channel: "gmail", last_message: "Hi, following up on the SLA discussion from last week." },
    target_contact: { id: "1", name: "Priya Sharma", email: "priya@acmecorp.com", phone: "+91 98765 43210", company: "Acme Corp", channel: "whatsapp", last_message: "Pricing looks good, need to discuss SLA" },
    confidence: 92,
    reason: "Same company, similar name pattern, overlapping email domain",
    status: "pending",
    created_at: subDays(now, 1).toISOString(),
  },
  {
    id: "mr2",
    source_contact: { id: "temp2", name: "James C.", email: "j.chen@startupxyz.io", channel: "gmail", last_message: "Can you resend the demo recording link?" },
    target_contact: { id: "2", name: "James Chen", email: "james@startupxyz.io", phone: "+1 555 0142", company: "StartupXYZ", channel: "whatsapp", last_message: "Team loved the demo, send pilot agreement" },
    confidence: 87,
    reason: "Same email domain, matching first name, conversation overlap",
    status: "pending",
    created_at: subDays(now, 2).toISOString(),
  },
  {
    id: "mr3",
    source_contact: { id: "temp3", name: "E. Wilson", email: "emma.w@designlab.co", company: "DesignLab", channel: "gmail", last_message: "Invoice for Q4 attached." },
    target_contact: { id: "5", name: "Emma Wilson", email: "emma@designlab.co", phone: "+44 7700 900000", company: "DesignLab", channel: "whatsapp", last_message: "Contract signed! When can we kick off?" },
    confidence: 95,
    reason: "Same company, name match, WhatsApp number linked to same contact",
    status: "approved",
    created_at: subDays(now, 5).toISOString(),
  },
  {
    id: "mr4",
    source_contact: { id: "temp4", name: "C. Rodriguez", email: "c.rodriguez@latamvc.com", channel: "calendar", last_message: "Meeting scheduled: LatAm Fund intro call" },
    target_contact: { id: "6", name: "Carlos Rodriguez", email: "carlos@latamvc.com", company: "LatAm VC", channel: "gmail", last_message: "Interested in learning more about your platform" },
    confidence: 79,
    reason: "Same surname, overlapping company domain, calendar invite match",
    status: "pending",
    created_at: subDays(now, 3).toISOString(),
  },
];

export const mockIntegrations: Integration[] = [
  { id: "int1", name: "Gmail", type: "gmail", status: "connected", last_sync: subHours(now, 0.5).toISOString(), account: "founder@nosheeet.com" },
  { id: "int2", name: "WhatsApp Business", type: "whatsapp", status: "connected", last_sync: subHours(now, 1).toISOString(), account: "+1 555 0199" },
  { id: "int3", name: "Google Calendar", type: "calendar", status: "disconnected" },
];

export const DEAL_STAGES: { key: DealStage; label: string }[] = [
  { key: "discovery", label: "Discovery" },
  { key: "demo", label: "Demo" },
  { key: "proposal", label: "Proposal" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
  { key: "cold", label: "Cold" },
];
