import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/services/api";
import { toast } from "@/hooks/use-toast";

// ─── Global error handler ───────────────────────────────────────
function onError(error: Error) {
  toast({
    title: "Unable to reach server",
    description: error.message || "Please check your connection.",
    variant: "destructive",
  });
}

// ─── Shared query config with polling every 20s ─────────────────
const POLL_INTERVAL = 20_000;
const RETRY_DELAY = 5_000;

const defaultQueryOptions = {
  refetchInterval: POLL_INTERVAL,
  retry: 3,
  retryDelay: RETRY_DELAY,
};

// ─── Query keys ─────────────────────────────────────────────────
export const queryKeys = {
  contacts: ["contacts"] as const,
  contact: (id: string) => ["contacts", id] as const,
  contactTimeline: (id: string) => ["contacts", id, "timeline"] as const,
  deals: ["deals"] as const,
  deal: (id: string) => ["deals", id] as const,
  dashboard: ["dashboard"] as const,
  reminders: ["reminders"] as const,
  mergeRequests: ["mergeRequests"] as const,
};

// ─── Dashboard ──────────────────────────────────────────────────
export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => api.getDashboardSummary(),
    ...defaultQueryOptions,
    meta: { onError },
  });
}

// ─── Contacts ───────────────────────────────────────────────────
export function useContacts() {
  return useQuery({
    queryKey: queryKeys.contacts,
    queryFn: () => api.getContacts(),
    ...defaultQueryOptions,
    meta: { onError },
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: queryKeys.contact(id),
    queryFn: () => api.getContact(id),
    enabled: !!id,
    ...defaultQueryOptions,
    meta: { onError },
  });
}

export function useContactTimeline(contactId: string) {
  return useQuery({
    queryKey: queryKeys.contactTimeline(contactId),
    queryFn: () => api.getContactTimeline(contactId),
    enabled: !!contactId,
    ...defaultQueryOptions,
    meta: { onError },
  });
}

// ─── Deals ──────────────────────────────────────────────────────
export function useDeals() {
  return useQuery({
    queryKey: queryKeys.deals,
    queryFn: () => api.getDeals(),
    ...defaultQueryOptions,
    meta: { onError },
  });
}

export function useDeal(id: string) {
  return useQuery({
    queryKey: queryKeys.deal(id),
    queryFn: () => api.getDeal(id),
    enabled: !!id,
    ...defaultQueryOptions,
    meta: { onError },
  });
}

// ─── Reminders ──────────────────────────────────────────────────
export function useReminders() {
  return useQuery({
    queryKey: queryKeys.reminders,
    queryFn: () => api.getReminders(),
    ...defaultQueryOptions,
    meta: { onError },
  });
}

export function useSnoozeReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, days }: { id: string; days: number }) =>
      api.snoozeReminder(id, days),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.reminders });
    },
    onError,
  });
}

export function useMarkReminderDone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.markReminderDone(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.reminders });
    },
    onError,
  });
}

// ─── Merge Requests ─────────────────────────────────────────────
export function useMergeRequests() {
  return useQuery({
    queryKey: queryKeys.mergeRequests,
    queryFn: () => api.getMergeRequests(),
    ...defaultQueryOptions,
    meta: { onError },
  });
}

export function useConfirmMerge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.confirmMerge(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.mergeRequests });
    },
    onError,
  });
}

export function useDeclineMerge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.declineMerge(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.mergeRequests });
    },
    onError,
  });
}
