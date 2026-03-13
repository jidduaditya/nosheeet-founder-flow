import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockApi } from "@/lib/mock-api";

// ─── When VITE_API_BASE_URL is set, use real api; otherwise mock ───
// To switch to real API, import { api } from "@/lib/api" and replace mockApi below.
const client = mockApi;

// ─── Query keys ─────────────────────────────────────────────────
export const queryKeys = {
  contacts: ["contacts"] as const,
  contact: (id: string) => ["contacts", id] as const,
  contactTimeline: (id: string) => ["contacts", id, "timeline"] as const,
  deals: ["deals"] as const,
  deal: (id: string) => ["deals", id] as const,
  reminders: ["reminders"] as const,
  mergeRequests: ["mergeRequests"] as const,
};

// ─── Contacts ───────────────────────────────────────────────────
export function useContacts() {
  return useQuery({
    queryKey: queryKeys.contacts,
    queryFn: () => client.getContacts(),
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: queryKeys.contact(id),
    queryFn: () => client.getContact(id),
    enabled: !!id,
  });
}

export function useContactTimeline(contactId: string) {
  return useQuery({
    queryKey: queryKeys.contactTimeline(contactId),
    queryFn: () => client.getContactTimeline(contactId),
    enabled: !!contactId,
  });
}

// ─── Deals ──────────────────────────────────────────────────────
export function useDeals() {
  return useQuery({
    queryKey: queryKeys.deals,
    queryFn: () => client.getDeals(),
  });
}

export function useDeal(id: string) {
  return useQuery({
    queryKey: queryKeys.deal(id),
    queryFn: () => client.getDeal(id),
    enabled: !!id,
  });
}

// ─── Reminders ──────────────────────────────────────────────────
export function useReminders() {
  return useQuery({
    queryKey: queryKeys.reminders,
    queryFn: () => client.getReminders(),
  });
}

export function useSnoozeReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, days }: { id: string; days: number }) =>
      client.snoozeReminder(id, days),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.reminders });
    },
  });
}

export function useMarkReminderDone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.markReminderDone(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.reminders });
    },
  });
}

// ─── Merge Requests ─────────────────────────────────────────────
export function useMergeRequests() {
  return useQuery({
    queryKey: queryKeys.mergeRequests,
    queryFn: () => client.getMergeRequests(),
  });
}

export function useConfirmMerge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.confirmMerge(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.mergeRequests });
    },
  });
}

export function useDeclineMerge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.declineMerge(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.mergeRequests });
    },
  });
}
