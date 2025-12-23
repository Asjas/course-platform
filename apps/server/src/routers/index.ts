import { imagesRouter } from "./images/index.js";
import { router } from "~/router.js";
import { chatRouter } from "~/routers/chat/index.js";
import { couponsRouter } from "~/routers/coupons/index.js";
import { coursesRouter } from "~/routers/courses/index.js";
import { statsRouter } from "~/routers/stats/index.js";
import { supportTicketsRouter } from "~/routers/support-tickets/index.js";

export const appRouter = router({
  coupons: couponsRouter,
  courses: coursesRouter,
  images: imagesRouter,
  stats: statsRouter,
  supportTickets: supportTicketsRouter,
  chat: chatRouter,
});

export type AppRouter = typeof appRouter;
