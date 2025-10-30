import React from "react";
import { authClient } from "~/lib/auth.client.ts";
import { AuthContext } from "~/lib/auth.context";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const isAuthenticated = !!session;

  const hasRole = (role: string) => {
    return session?.user?.role === role;
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="sr-only">Loading authentication...</span>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        hasRole,
        session,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
