import type {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
} from "fastify";
import {
  type NewPlatformAnnouncement,
  deletePlatformAnnouncementById,
  insertPlatformAnnouncement,
  insertPlatformAnnouncementRead,
  updatePlatformAnnouncementById,
} from "~/db/mutations/platformAnnouncements.js";
import {
  getAllAnnouncements,
  getAnnouncementById,
} from "~/db/queries/platformAnnouncements.js";
import {
  CACHE_PRIVATE_REVALIDATE,
  CACHE_PUBLIC_REVALIDATE,
  ONE_DAY,
  THIRTY_MINUTES,
} from "~/lib/constants.js";

export default function platformAnnouncementsRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes,
) {
  const log = fastify.log.child({
    module: "routes:platform-announcements",
  });

  fastify.get("/platform-announcements", async (request, reply) => {
    try {
      const announcements = await getAllAnnouncements();

      if (!announcements) {
        log.warn({ reqId: request.id }, "No platform announcements found");
        return reply
          .status(404)
          .send({ error: "No platform announcements found" });
      }

      reply.headers(
        CACHE_PUBLIC_REVALIDATE({
          maxAge: THIRTY_MINUTES,
          cdnMaxAge: ONE_DAY,
          staleIfError: ONE_DAY * 2,
        }),
      );

      log.info(
        { reqId: request.id, count: announcements.count },
        "Fetched all platform announcements",
      );

      return announcements;
    } catch (error) {
      log.error(
        { reqId: request.id, err: error },
        "Error fetching platform announcements",
      );

      return reply
        .status(500)
        .send({ error: "Error fetching platform announcements" });
    }
  });

  fastify.get(
    "/platform-announcements/:id",
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      const { id } = request.params;

      try {
        const announcement = await getAnnouncementById(id);

        if (!announcement) {
          log.warn(
            { reqId: request.id, announcementId: id },
            "Platform announcement not found",
          );
          return reply
            .status(404)
            .send({ error: "Platform announcement not found" });
        }

        reply.headers(
          CACHE_PRIVATE_REVALIDATE({
            maxAge: ONE_DAY,
            staleIfError: ONE_DAY * 2,
          }),
        );

        log.info(
          { reqId: request.id, announcementId: id },
          "Fetched platform announcement with private caching",
        );

        return announcement;
      } catch (error) {
        log.error(
          { reqId: request.id, err: error, announcementId: id },
          "Error fetching platform announcement",
        );

        return reply
          .status(500)
          .send({ error: "Error fetching platform announcement" });
      }
    },
  );

  fastify.post(
    "/platform-announcements",
    async (
      request: FastifyRequest<{ Body: NewPlatformAnnouncement }>,
      reply,
    ) => {
      try {
        const newAnnouncement = await insertPlatformAnnouncement({
          newPlatformAnnouncement: request.body,
        });

        if (!newAnnouncement) {
          log.warn(
            { reqId: request.id },
            "Failed to create platform announcement",
          );

          return reply
            .status(500)
            .send({ error: "Failed to create platform announcement" });
        }

        log.info(
          { reqId: request.id, announcementId: newAnnouncement[0].id },
          "Created new platform announcement",
        );

        return reply.status(201).send(newAnnouncement);
      } catch (error) {
        log.error(
          { err: error, reqId: request.id },
          "Error creating platform announcement",
        );

        return reply
          .status(500)
          .send({ error: "Error creating platform announcement" });
      }
    },
  );

  fastify.put(
    "/platform-announcements/:id",
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Body: Partial<NewPlatformAnnouncement>;
      }>,
      reply,
    ) => {
      const { id } = request.params;

      try {
        const updatedAnnouncement = await updatePlatformAnnouncementById({
          id,
          updates: request.body,
        });

        if (!updatedAnnouncement) {
          log.warn(
            { reqId: request.id, announcementId: id },
            "Platform announcement not found for update",
          );

          return reply
            .status(404)
            .send({ error: "Platform announcement not found" });
        }

        log.info(
          { reqId: request.id, announcementId: id },
          "Updated platform announcement",
        );

        return updatedAnnouncement;
      } catch (error) {
        log.error(
          { err: error, reqId: request.id, announcementId: id },
          "Error updating platform announcement",
        );

        return reply
          .status(500)
          .send({ error: "Error updating platform announcement" });
      }
    },
  );

  fastify.delete(
    "/platform-announcements/:id",
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      const { id } = request.params;

      try {
        const deleted = await deletePlatformAnnouncementById(id);

        if (!deleted) {
          log.warn(
            { reqId: request.id, announcementId: id },
            "Platform announcement not found for deletion",
          );

          return reply
            .status(404)
            .send({ error: "Platform announcement not found" });
        }

        log.info(
          { reqId: request.id, announcementId: id },
          "Deleted platform announcement",
        );

        return reply.status(204).send();
      } catch (error) {
        log.error(
          { err: error, reqId: request.id, announcementId: id },
          "Error deleting platform announcement",
        );

        return reply
          .status(500)
          .send({ error: "Error deleting platform announcement" });
      }
    },
  );

  fastify.post(
    "/platform-announcements/:id/read",
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Body: { announcementId: string; userId: string };
      }>,
      reply,
    ) => {
      const { id } = request.params;
      const { announcementId, userId } = request.body;

      try {
        const readRecord = await insertPlatformAnnouncementRead(id, {
          announcementId,
          userId,
        });

        log.info(
          { reqId: request.id, announcementId: announcementId, userId },
          "Recorded platform announcement as read for user",
        );

        return reply.status(201).send(readRecord);
      } catch (error) {
        log.error(
          { err: error, reqId: request.id, announcementId, userId },
          "Error recording platform announcement as read",
        );

        return reply
          .status(500)
          .send({ error: "Error recording platform announcement as read" });
      }
    },
  );

  done();
}
