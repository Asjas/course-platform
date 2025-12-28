import { TRPCError } from "@trpc/server";
import * as z from "zod";
import {
  deletePlatformAnnouncementById,
  insertPlatformAnnouncement,
  insertPlatformAnnouncementRead,
  updatePlatformAnnouncementById,
} from "~/db/mutations/platformAnnouncements.js";
import {
  getAllAnnouncements,
  getAnnouncementById,
  getPublishedAnnouncements,
  getReadAnnouncementsForUser,
  getUnreadAnnouncementsForUser,
} from "~/db/queries/platformAnnouncements.js";
import { isAdmin, publicProcedure, router } from "~/router.js";

const announcementTypeEnum = z.enum([
  "platform_update",
  "platform_warning",
  "course_update",
  "new_course",
  "general",
  "warning",
]);

const createAnnouncementSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  message: z.string().min(1),
  type: announcementTypeEnum.default("general"),
  publishedAt: z.string().datetime().nullable().optional(),
  authorId: z.string().optional(),
});

const updateAnnouncementSchema = z.object({
  title: z.string().min(1).optional(),
  message: z.string().min(1).optional(),
  type: announcementTypeEnum.optional(),
  publishedAt: z.string().datetime().nullable().optional(),
});

export const announcementsRouter = router({
  getAll: publicProcedure.query(async () => {
    try {
      const result = await getAllAnnouncements();
      return result;
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch announcements",
      });
    }
  }),

  getPublished: publicProcedure.query(async () => {
    try {
      const announcements = await getPublishedAnnouncements();
      return announcements;
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch published announcements",
      });
    }
  }),

  getUnreadForUser: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      try {
        const announcements = await getUnreadAnnouncementsForUser(input);
        return announcements;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch unread announcements",
        });
      }
    }),

  getReadForUser: publicProcedure.input(z.string()).query(async ({ input }) => {
    try {
      const announcements = await getReadAnnouncementsForUser(input);
      return announcements;
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch read announcements",
      });
    }
  }),

  getById: publicProcedure.input(z.string()).query(async ({ input }) => {
    try {
      const announcement = await getAnnouncementById(input);
      if (!announcement) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Announcement not found",
        });
      }
      return announcement;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch announcement",
      });
    }
  }),

  create: publicProcedure
    .input(createAnnouncementSchema)
    .use(isAdmin)
    .mutation(async ({ input }) => {
      try {
        const result = await insertPlatformAnnouncement({
          newPlatformAnnouncement: {
            ...input,
            publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
          },
        });
        return result[0];
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create announcement",
        });
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        updates: updateAnnouncementSchema,
      }),
    )
    .use(isAdmin)
    .mutation(async ({ input }) => {
      try {
        const updates: Record<string, unknown> = { ...input.updates };
        if (input.updates.publishedAt !== undefined) {
          updates.publishedAt = input.updates.publishedAt
            ? new Date(input.updates.publishedAt)
            : null;
        }

        const result = await updatePlatformAnnouncementById({
          id: input.id,
          updates,
        });

        if (!result || result.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Announcement not found",
          });
        }
        return result[0];
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update announcement",
        });
      }
    }),

  delete: publicProcedure
    .input(z.string())
    .use(isAdmin)
    .mutation(async ({ input }) => {
    try {
      await deletePlatformAnnouncementById(input);
      return { success: true };
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete announcement",
      });
    }
  }),

  markAsRead: publicProcedure
    .input(
      z.object({
        id: z.string(),
        announcementId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const result = await insertPlatformAnnouncementRead(input.id, {
          announcementId: input.announcementId,
          userId: input.userId,
        });
        return result[0];
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark announcement as read",
        });
      }
    }),
});
