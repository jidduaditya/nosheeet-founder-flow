// API client — configure base URL here
// In development, uses mock data fallback. In production, point to your backend.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    throw new ApiError(
      `API Error: ${res.status} ${res.statusText}`,
      res.status
    );
  }

  return res.json();
}

export const api = {
  // Contacts
  getContacts: () => request<import("./mock-data").Contact[]>("/contacts"),
  getContact: (id: string) => request<import("./mock-data").Contact>(`/contacts/${id}`),
  getContactTimeline: (id: string) =>
    request<{
      messages: import("./mock-data").Message[];
      meetings: import("./mock-data").Meeting[];
      lead_summary?: import("./mock-data").LeadSummary;
    }>(`/contacts/${id}/timeline`),

  // Deals
  getDeals: () => request<import("./mock-data").Deal[]>("/deals"),
  getDeal: (id: string) => request<import("./mock-data").Deal>(`/deals/${id}`),

  // Reminders
  getReminders: () => request<import("./mock-data").Reminder[]>("/reminders"),
  snoozeReminder: (id: string, days: number) =>
    request<import("./mock-data").Reminder>(`/reminders/${id}/snooze`, {
      method: "POST",
      body: JSON.stringify({ days }),
    }),
  markReminderDone: (id: string) =>
    request<import("./mock-data").Reminder>(`/reminders/${id}/done`, {
      method: "POST",
    }),

  // Merge requests
  getMergeRequests: () => request<import("./mock-data").MergeRequest[]>("/merge_requests"),
  confirmMerge: (id: string) =>
    request<import("./mock-data").MergeRequest>(`/merge_requests/${id}/confirm`, {
      method: "POST",
    }),
  declineMerge: (id: string) =>
    request<import("./mock-data").MergeRequest>(`/merge_requests/${id}/decline`, {
      method: "POST",
    }),
};

export { ApiError };
