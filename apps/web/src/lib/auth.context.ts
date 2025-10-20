import { createContext, useContext } from "react";
import type { AuthSession } from "~/lib/auth.client.ts";

export interface AuthState {
  isAuthenticated: boolean;
  session: AuthSession | null;
  serverError: string | null;
  hasRole: (role: string) => boolean;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

export const defaultAuthState: AuthState = {
  isAuthenticated: false,
  session: null,
  serverError: null,
  hasRole: () => false,
  signUp: async () => {
    throw new Error("AuthProvider not initialized");
  },
  signIn: async () => {
    throw new Error("AuthProvider not initialized");
  },
  signOut: async () => {
    throw new Error("AuthProvider not initialized");
  },
};

export const AuthContext = createContext<AuthState>(defaultAuthState);

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth hook must be used within an AuthProvider");
  }

  return context;
}
