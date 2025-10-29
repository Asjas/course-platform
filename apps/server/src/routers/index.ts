import { router } from "~/router.js";
import { couponsRouter } from "~/routers/coupons/index.js";
import { coursesRouter } from "~/routers/courses/index.js";
import { profileRouter } from "~/routers/profile.ts/index.js";
import { supportTicketsRouter } from "~/routers/support-tickets/index.js";
import { usersRouter } from "~/routers/users/index.js";

export const appRouter = router({
  coupons: couponsRouter,
  courses: coursesRouter,
  profile: profileRouter,
  supportTickets: supportTicketsRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
