import { TRPCError } from "@trpc/server";
import * as z from "zod";
import {
  deletePlatformAnnouncementById,
  insertPlatformAnnouncement,
  insertPlatformAnnouncementRead,
  updatePlatformAnnouncementById,
} from "~/db/mutations/platformAnnouncements.js";
import {
  type AllAnnouncements,
  type AnnouncementById,
  type PublishedAnnouncements,
  type ReadAnnouncementsForUser,
  type UnreadAnnouncementsForUser,
  getAllAnnouncements,
  getAnnouncementById,
  getPublishedAnnouncements,
  getReadAnnouncementsForUser,
  getUnreadAnnouncementsForUser,
} from "~/db/queries/platformAnnouncements.js";
import {
  type EntitySyncUpdate,
  announcementsSyncConfig,
  createSyncUpdate,
  getEntityUpdatesSince,
  publishEntityChange,
  streamEntityUpdates,
} from "~/lib/sse-sync.js";
import { isAdmin, isAuthenticated, publicProcedure, router } from "~/router.js";

// Export type for frontend use
export type AnnouncementSyncUpdate = EntitySyncUpdate<
  PublishedAnnouncements[number]
>;

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
  getAll: publicProcedure.query(async (): Promise<AllAnnouncements> => {
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

  getPublished: publicProcedure.query(
    async (): Promise<PublishedAnnouncements> => {
      try {
        const announcements = await getPublishedAnnouncements();
        return announcements;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch published announcements",
        });
      }
    },
  ),

  getUnreadForUser: publicProcedure
    .input(z.string())
    .query(async ({ input }): Promise<UnreadAnnouncementsForUser> => {
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

  getReadForUser: publicProcedure
    .input(z.string())
    .query(async ({ input }): Promise<ReadAnnouncementsForUser> => {
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

  getById: publicProcedure
    .input(z.string())
    .query(async ({ input }): Promise<NonNullable<AnnouncementById>> => {
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
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await insertPlatformAnnouncement({
          newPlatformAnnouncement: {
            ...input,
            authorId: ctx.user.id,
            publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
          },
        });

        const announcement = result[0];

        // Publish to SSE stream for real-time sync
        // Only published announcements are broadcast
        if (announcement.publishedAt) {
          await publishEntityChange(
            announcementsSyncConfig,
            createSyncUpdate(
              "created",
              announcement.id,
              announcement,
              ctx.user.id,
            ),
          );
        }

        return announcement;
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
    .mutation(async ({ input, ctx }) => {
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

        const announcement = result[0];

        // Publish to SSE stream for real-time sync
        await publishEntityChange(
          announcementsSyncConfig,
          createSyncUpdate(
            "updated",
            announcement.id,
            announcement,
            ctx.user.id,
          ),
        );

        return announcement;
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
    .mutation(async ({ input, ctx }) => {
      try {
        await deletePlatformAnnouncementById(input);

        // Publish deletion to SSE stream for real-time sync
        await publishEntityChange(
          announcementsSyncConfig,
          createSyncUpdate("deleted", input, null, ctx.user.id),
        );

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

  /**
   * Subscribe to real-time announcement updates via SSE.
   * Clients receive updates when announcements are created, updated, or deleted.
   */
  subscribeToUpdates: publicProcedure
    .input(
      z.object({
        lastEventId: z.string().nullish(),
      }),
    )
    .use(isAuthenticated)
    .subscription(async function* ({ input }) {
      yield* streamEntityUpdates<PublishedAnnouncements[number]>(
        announcementsSyncConfig,
        input.lastEventId,
      );
    }),

  /**
   * Get announcement updates since a specific timestamp.
   * Useful for syncing offline clients that have been disconnected.
   *
   * @param since - Timestamp in milliseconds to fetch updates from
   * @returns Array of updates since the given timestamp
   */
  getUpdatesSince: publicProcedure
    .input(
      z.object({
        since: z.number(), // Timestamp in ms
      }),
    )
    .use(isAuthenticated)
    .query(async ({ input }) => {
      try {
        const updates = await getEntityUpdatesSince<
          PublishedAnnouncements[number]
        >(announcementsSyncConfig, input.since);
        return updates;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch announcement updates",
        });
      }
    }),
});
