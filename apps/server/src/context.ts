import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";

export const createContext = async ({
  req: request,
  res: reply,
}: CreateFastifyContextOptions) => {
  // Role checking helper
  const hasRole = (role: string) => {
    return request.user?.role === role;
  };

  return {
    request,
    reply,
    user: request.user,
    hasRole,
  };
};

// Context creation
export type Context = Awaited<ReturnType<typeof createContext>>;
