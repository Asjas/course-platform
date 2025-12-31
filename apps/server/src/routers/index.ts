import { imagesRouter } from "./images/index.js";
import { router } from "~/router.js";
import { announcementsRouter } from "~/routers/announcements/index.js";
import { chatRouter } from "~/routers/chat/index.js";
import { chatReportsRouter } from "~/routers/chatReports/index.js";
import { couponsRouter } from "~/routers/coupons/index.js";
import { coursesRouter } from "~/routers/courses/index.js";
import { directMessagesRouter } from "~/routers/directMessages/index.js";
import { notificationsRouter } from "~/routers/notifications/index.js";
import { reviewsRouter } from "~/routers/reviews/index.js";
import { statsRouter } from "~/routers/stats/index.js";
import { supportTicketsRouter } from "~/routers/support-tickets/index.js";
import { usersRouter } from "~/routers/users/index.js";

export const appRouter = router({
  announcements: announcementsRouter,
  coupons: couponsRouter,
  courses: coursesRouter,
  images: imagesRouter,
  notifications: notificationsRouter,
  reviews: reviewsRouter,
  stats: statsRouter,
  supportTickets: supportTicketsRouter,
  chat: chatRouter,
  chatReports: chatReportsRouter,
  directMessages: directMessagesRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
