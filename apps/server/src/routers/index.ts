import { router } from "~/router.js";
import { couponsRouter } from "~/routers/coupons/index.js";
import { usersRouter } from "~/routers/users/index.js";

export const appRouter = router({
  users: usersRouter,
  coupons: couponsRouter,
});

export type AppRouter = typeof appRouter;
