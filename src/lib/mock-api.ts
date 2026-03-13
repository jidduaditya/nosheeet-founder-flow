/**
 * Mock API adapter — intercepts API calls and returns mock data
 * when no backend URL is configured. Remove this file when your
 * backend is ready and set VITE_API_BASE_URL.
 */
import {
  mockContacts,
  mockDeals,
  mockReminders,
  mockMessages,
  mockMeetings,
  mockLeadSummaries,
  mockMergeRequests,
  type Contact,
  type Deal,
  type Reminder,
  type MergeRequest,
  type Message,
  type Meeting,
  type LeadSummary,
} from "./mock-data";
import { addDays } from "date-fns";

// Simulate network latency
const delay = (ms = 300) => new Promise(r => setTimeout(r, ms + Math.random() * 200));

// Mutable state for reminders and merge requests
let remindersState = [...mockReminders];
let mergeState = [...mockMergeRequests];

export const mockApi = {
  // Contacts
  getContacts: async (): Promise<Contact[]> => {
    await delay();
    return mockContacts;
  },

  getContact: async (id: string): Promise<Contact> => {
    await delay();
    const c = mockContacts.find(c => c.id === id);
    if (!c) throw new Error("Contact not found");
    return c;
  },

  getContactTimeline: async (contactId: string): Promise<{
    messages: Message[];
    meetings: Meeting[];
    lead_summary?: LeadSummary;
  }> => {
    await delay();
    return {
      messages: mockMessages.filter(m => m.contact_id === contactId),
      meetings: mockMeetings.filter(m => m.contact_id === contactId),
      lead_summary: mockLeadSummaries.find(s => s.contact_id === contactId),
    };
  },

  // Deals
  getDeals: async (): Promise<Deal[]> => {
    await delay();
    return mockDeals;
  },

  getDeal: async (id: string): Promise<Deal> => {
    await delay();
    const d = mockDeals.find(d => d.id === id);
    if (!d) throw new Error("Deal not found");
    return d;
  },

  // Reminders
  getReminders: async (): Promise<Reminder[]> => {
    await delay();
    return remindersState;
  },

  snoozeReminder: async (id: string, days: number): Promise<Reminder> => {
    await delay(150);
    remindersState = remindersState.map(r =>
      r.id === id ? { ...r, due_at: addDays(new Date(), days).toISOString() } : r
    );
    return remindersState.find(r => r.id === id)!;
  },

  markReminderDone: async (id: string): Promise<Reminder> => {
    await delay(150);
    remindersState = remindersState.map(r =>
      r.id === id ? { ...r, is_done: true } : r
    );
    return remindersState.find(r => r.id === id)!;
  },

  // Merge requests
  getMergeRequests: async (): Promise<MergeRequest[]> => {
    await delay();
    return mergeState;
  },

  confirmMerge: async (id: string): Promise<MergeRequest> => {
    await delay(200);
    mergeState = mergeState.map(m =>
      m.id === id ? { ...m, status: "approved" as const } : m
    );
    return mergeState.find(m => m.id === id)!;
  },

  declineMerge: async (id: string): Promise<MergeRequest> => {
    await delay(200);
    mergeState = mergeState.map(m =>
      m.id === id ? { ...m, status: "rejected" as const } : m
    );
    return mergeState.find(m => m.id === id)!;
  },
};
