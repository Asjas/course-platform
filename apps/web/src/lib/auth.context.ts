import { createContext, useContext } from "react";
import type { AuthSession } from "~/lib/auth.client.ts";

export interface AuthState {
  isAuthenticated: boolean;
  session: AuthSession | null;
  hasRole: (role: string) => boolean;
}

export const defaultAuthState: AuthState = {
  isAuthenticated: false,
  session: null,
  hasRole: () => false,
};

export const AuthContext = createContext<AuthState>(defaultAuthState);

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth hook must be used within an AuthProvider");
  }

  return context;
}
