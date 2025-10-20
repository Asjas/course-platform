import React, { useState } from "react";
import { toast } from "sonner";
import { authClient } from "~/lib/auth.client.ts";
import { AuthContext } from "~/lib/auth.context";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const [serverError, setServerError] = useState<string | null>(null);

  const isAuthenticated = !!session;

  const hasRole = (role: string) => {
    return session?.user?.role === role;
  };

  const signUp = async (name: string, email: string, password: string) => {
    const { data, error } = await authClient.signUp.email({
      name,
      email,
      password,
    });

    if (data?.user) {
      toast.success("Signed up successfully");
      setServerError(null);
    }

    if (error?.message) {
      toast.error(error.message);
      setServerError(error.message);

      return error.message;
    }
  };

  const signIn = async (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => {
    const { data, error } = await authClient.signIn.email({
      email,
      password,
      rememberMe,
    });

    if (data?.user) {
      toast.success("Signed in successfully");
      setServerError(null);
    }

    if (error?.message) {
      toast.error(error.message);
      setServerError(error.message);

      return error.message;
    }
  };

  const signOut = async () => {
    const { data, error } = await authClient.signOut();

    if (data?.success) {
      toast.success("Signed out successfully");
    }

    if (error?.message) {
      toast.error(error.message);

      return error.message;
    }
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
        signUp,
        signIn,
        signOut,
        session,
        serverError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
