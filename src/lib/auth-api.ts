const API_BASE_URL = import.meta.env.VITE_API_URL || "https://https-github-com-your-org-nosheeet-production.up.railway.app";

async function post<T>(endpoint: string, body?: unknown): Promise<T> {
  const token = localStorage.getItem("nosheeet-auth")
    ? JSON.parse(localStorage.getItem("nosheeet-auth")!).state?.sessionToken
    : null;
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function get<T>(endpoint: string): Promise<T> {
  const token = localStorage.getItem("nosheeet-auth")
    ? JSON.parse(localStorage.getItem("nosheeet-auth")!).state?.sessionToken
    : null;
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

// ─── Auth ───
export const authApi = {
  sendOtp: (phone: string) => post<{ success: boolean }>("/auth/send-otp", { phone }),
  verifyOtp: (phone: string, code: string) =>
    post<{ token: string; user: { id: string; phone: string } }>("/auth/verify-otp", { phone, code }),
  magicLink: (email: string) => post<{ success: boolean }>("/auth/magic-link", { email }),
  getSession: () => get<{ user: { id: string; email?: string; phone?: string; name?: string } }>("/auth/session"),
};

// ─── Permissions ───
export const permissionsApi = {
  update: (perms: { mic: boolean; calendar: boolean; location: boolean }) =>
    post<{ success: boolean }>("/permissions/update", perms),
};

// ─── Integrations ───
export const integrationsApi = {
  connect: (channel: string) => post<{ status: string }>(`/integrations/${channel}/connect`),
  getWhatsAppQr: () => get<{ qr_url: string }>("/integrations/whatsapp/qr"),
};

// ─── AI Scanning ───
export const scanApi = {
  startScan: () => post<{ scan_id: string }>("/ai/start-scan"),
  getScanStatus: () =>
    get<{ status: "scanning" | "complete" | "error"; progress: number; contacts_found?: number }>("/ai/scan-status"),
};
