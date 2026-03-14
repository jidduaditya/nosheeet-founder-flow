/**
 * Centralized API service — all backend requests go through here.
 * Uses VITE_API_URL env variable for the base URL.
 */

const API = import.meta.env.VITE_API_URL || "https://https-github-com-your-org-nosheeet-production.up.railway.app";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function getToken(): string | null {
  try {
    const raw = localStorage.getItem("nosheeet-auth");
    if (raw) return JSON.parse(raw).state?.sessionToken ?? null;
  } catch {}
  return null;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API}${endpoint}`;
  const token = getToken();
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    throw new ApiError(`API Error: ${res.status} ${res.statusText}`, res.status);
  }

  return res.json();
}

// ─── Contacts ───────────────────────────────────────────────────
export const getContacts = () =>
  request<import("@/lib/mock-data").Contact[]>("/contacts");

export const getContact = (id: string) =>
  request<import("@/lib/mock-data").Contact>(`/contacts/${id}`);

export const getContactTimeline = (id: string) =>
  request<{
    messages: import("@/lib/mock-data").Message[];
    meetings: import("@/lib/mock-data").Meeting[];
    lead_summary?: import("@/lib/mock-data").LeadSummary;
  }>(`/contacts/${id}/timeline`);

// ─── Deals ──────────────────────────────────────────────────────
export const getDeals = () =>
  request<import("@/lib/mock-data").Deal[]>("/deals");

export const getDeal = (id: string) =>
  request<import("@/lib/mock-data").Deal>(`/deals/${id}`);

// ─── Dashboard ──────────────────────────────────────────────────
export const getDashboardSummary = () =>
  request<any>("/dashboard/summary");

// ─── Reminders ──────────────────────────────────────────────────
export const getReminders = () =>
  request<import("@/lib/mock-data").Reminder[]>("/reminders");

export const snoozeReminder = (id: string, days: number) =>
  request<import("@/lib/mock-data").Reminder>(`/reminders/${id}/snooze`, {
    method: "POST",
    body: JSON.stringify({ days }),
  });

export const markReminderDone = (id: string) =>
  request<import("@/lib/mock-data").Reminder>(`/reminders/${id}/done`, {
    method: "POST",
  });

// ─── Merge Requests ─────────────────────────────────────────────
export const getMergeRequests = () =>
  request<import("@/lib/mock-data").MergeRequest[]>("/merge_requests");

export const confirmMerge = (id: string) =>
  request<import("@/lib/mock-data").MergeRequest>(`/merge_requests/${id}/confirm`, {
    method: "POST",
  });

export const declineMerge = (id: string) =>
  request<import("@/lib/mock-data").MergeRequest>(`/merge_requests/${id}/decline`, {
    method: "POST",
  });

// ─── Permissions ────────────────────────────────────────────────
export const updatePermissions = (perms: { mic: boolean; calendar: boolean; location: boolean }) =>
  request<{ success: boolean }>("/permissions/update", {
    method: "POST",
    body: JSON.stringify(perms),
  });

// ─── Integrations ───────────────────────────────────────────────
export const connectIntegration = (provider: string) =>
  request<{ status: string }>(`/integrations/${provider}/connect`, { method: "POST" });

export const getWhatsAppQR = () =>
  request<{ qr: string }>("/integrations/whatsapp/qr");

// ─── AI Scanning ────────────────────────────────────────────────
export const startAiScan = () =>
  request<{ scan_id: string }>("/ai/start-scan", { method: "POST" });

export const getAiScanStatus = () =>
  request<{ status: string; progress: number; contacts_found?: number; messages_scanned?: number }>("/ai/scan-status");

export { ApiError };
