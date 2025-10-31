import { router } from "../router.ts";
import { couponsRouter } from "./coupons/index.ts";
import { coursesRouter } from "./courses/index.ts";
import { imagesRouter } from "./images/index.ts";
import { supportTicketsRouter } from "./support-tickets/index.ts";

export const appRouter = router({
  coupons: couponsRouter,
  courses: coursesRouter,
  images: imagesRouter,
  supportTickets: supportTicketsRouter,
});

export type AppRouter = typeof appRouter;
