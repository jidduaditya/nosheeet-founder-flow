import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";

/** Redirects to /login if not authenticated, or to onboarding if not complete */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, onboardingComplete } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (!onboardingComplete) return <Navigate to="/profile-setup" replace />;
  return <>{children}</>;
}

/** Redirects to /dashboard if already authenticated & onboarded */
export function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const { user, onboardingComplete } = useAuthStore();
  if (user && onboardingComplete) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

/** Requires auth but allows incomplete onboarding */
export function RequireAuthOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
