/**
 * Mock implementations for auth/onboarding APIs.
 * Drop-in until real backend is ready.
 */
const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms + Math.random() * 300));

let scanProgress = 0;
let scanRunning = false;

export const mockAuthApi = {
  sendOtp: async (_phone: string) => {
    await delay();
    return { success: true };
  },
  verifyOtp: async (phone: string, _code: string) => {
    await delay();
    return { token: "mock-session-token-" + Date.now(), user: { id: "usr_1", phone } };
  },
  magicLink: async (_email: string) => {
    await delay();
    return { success: true };
  },
  getSession: async () => {
    await delay(300);
    return { user: { id: "usr_1", name: "Demo User" } };
  },
};

export const mockPermissionsApi = {
  update: async (_perms: { mic: boolean; calendar: boolean; location: boolean }) => {
    await delay(400);
    return { success: true };
  },
};

export const mockIntegrationsApi = {
  connect: async (_channel: string) => {
    await delay(1200);
    return { status: "connected" };
  },
  getWhatsAppQr: async () => {
    await delay(400);
    return { qr_url: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=whatsapp-mock-link" };
  },
};

export const mockScanApi = {
  startScan: async () => {
    scanProgress = 0;
    scanRunning = true;
    // Simulate progress in background
    const tick = () => {
      if (!scanRunning) return;
      scanProgress = Math.min(100, scanProgress + Math.floor(Math.random() * 12) + 5);
      if (scanProgress >= 100) { scanRunning = false; return; }
      setTimeout(tick, 800 + Math.random() * 600);
    };
    setTimeout(tick, 500);
    await delay(300);
    return { scan_id: "scan_1" };
  },
  getScanStatus: async () => {
    await delay(200);
    return {
      status: scanProgress >= 100 ? ("complete" as const) : ("scanning" as const),
      progress: scanProgress,
      contacts_found: Math.floor(scanProgress * 1.7),
    };
  },
};
