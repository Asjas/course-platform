import { router } from "~/router.js";
import { couponsRouter } from "~/routers/coupons/index.js";
import { coursesRouter } from "~/routers/courses/index.js";
import { imagesRouter } from "~/routers/images/index.js";
import { supportTicketsRouter } from "~/routers/support-tickets/index.js";

export const appRouter = router({
  coupons: couponsRouter,
  courses: coursesRouter,
  images: imagesRouter,
  supportTickets: supportTicketsRouter,
});

export type AppRouter = typeof appRouter;
