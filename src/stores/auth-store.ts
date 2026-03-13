import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ChannelKey = "gmail" | "outlook" | "whatsapp" | "google-calendar" | "notion" | "sheets";
export type ChannelStatus = "not_connected" | "connecting" | "connected";

export interface AuthUser {
  id: string;
  phone?: string;
  email?: string;
  name?: string;
  avatar?: string;
}

export interface Permissions {
  microphone: boolean;
  calendar: boolean;
  location: boolean;
}

export interface AuthState {
  // Auth
  user: AuthUser | null;
  sessionToken: string | null;
  setUser: (user: AuthUser | null) => void;
  setSessionToken: (token: string | null) => void;

  // Onboarding
  onboardingComplete: boolean;
  onboardingStep: number;
  setOnboardingComplete: (v: boolean) => void;
  setOnboardingStep: (step: number) => void;

  // Permissions
  permissions: Permissions;
  setPermission: (key: keyof Permissions, value: boolean) => void;

  // Channels
  connectedChannels: Record<ChannelKey, ChannelStatus>;
  setChannelStatus: (key: ChannelKey, status: ChannelStatus) => void;

  // Reset
  logout: () => void;
}

const initialPermissions: Permissions = { microphone: false, calendar: false, location: false };
const initialChannels: Record<ChannelKey, ChannelStatus> = {
  gmail: "not_connected",
  outlook: "not_connected",
  whatsapp: "not_connected",
  "google-calendar": "not_connected",
  notion: "not_connected",
  sheets: "not_connected",
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      sessionToken: null,
      setUser: (user) => set({ user }),
      setSessionToken: (token) => set({ sessionToken: token }),

      onboardingComplete: false,
      onboardingStep: 0,
      setOnboardingComplete: (v) => set({ onboardingComplete: v }),
      setOnboardingStep: (step) => set({ onboardingStep: step }),

      permissions: initialPermissions,
      setPermission: (key, value) =>
        set((s) => ({ permissions: { ...s.permissions, [key]: value } })),

      connectedChannels: initialChannels,
      setChannelStatus: (key, status) =>
        set((s) => ({ connectedChannels: { ...s.connectedChannels, [key]: status } })),

      logout: () =>
        set({
          user: null,
          sessionToken: null,
          onboardingComplete: false,
          onboardingStep: 0,
          permissions: initialPermissions,
          connectedChannels: initialChannels,
        }),
    }),
    { name: "nosheeet-auth" }
  )
);
