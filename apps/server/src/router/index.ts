import { initTRPC } from "@trpc/server";
import * as z from "zod";

const t = initTRPC.create();
export const appRouter = t.router({
  hello: t.procedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => `Hello, ${input.name}!`),
});
export type AppRouter = typeof appRouter;
