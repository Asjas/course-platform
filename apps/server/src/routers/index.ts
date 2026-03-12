import { imagesRouter } from "./images/index.js";
import { mentionsRouter } from "./mentions/index.js";
import { router } from "~/router.js";
import { announcementsRouter } from "~/routers/announcements/index.js";
import { auditRouter } from "~/routers/audit/index.js";
import { chatRouter } from "~/routers/chat/index.js";
import { chatReportsRouter } from "~/routers/chatReports/index.js";
import { couponsRouter } from "~/routers/coupons/index.js";
import { courseWishlistRouter } from "~/routers/courseWishlist/index.js";
import { coursesRouter } from "~/routers/courses/index.js";
import { dataExportRouter } from "~/routers/dataExport/index.js";
import { directMessagesRouter } from "~/routers/directMessages/index.js";
import { earlySignupsRouter } from "~/routers/earlySignups/index.js";
import { enrollmentsRouter } from "~/routers/enrollments/index.js";
import { notificationsRouter } from "~/routers/notifications/index.js";
import { purchasesRouter } from "~/routers/purchases/index.js";
import { reviewsRouter } from "~/routers/reviews/index.js";
import { statsRouter } from "~/routers/stats/index.js";
import { supportTicketsRouter } from "~/routers/support-tickets/index.js";
import { supportStatusRouter } from "~/routers/supportStatus/index.js";
import { syncStatusRouter } from "~/routers/syncStatus/index.js";
import { usersRouter } from "~/routers/users/index.js";

export const appRouter = router({
  announcements: announcementsRouter,
  audit: auditRouter,
  coupons: couponsRouter,
  courses: coursesRouter,
  courseWishlist: courseWishlistRouter,
  dataExport: dataExportRouter,
  earlySignups: earlySignupsRouter,
  enrollments: enrollmentsRouter,
  images: imagesRouter,
  mentions: mentionsRouter,
  notifications: notificationsRouter,
  purchases: purchasesRouter,
  reviews: reviewsRouter,
  stats: statsRouter,
  supportStatus: supportStatusRouter,
  supportTickets: supportTicketsRouter,
  syncStatus: syncStatusRouter,
  chat: chatRouter,
  chatReports: chatReportsRouter,
  directMessages: directMessagesRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
