import { router } from "~/router.js";
import { usersRouter } from "~/routers/users/index.js";

export const appRouter = router({
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
