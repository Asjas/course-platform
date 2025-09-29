import type {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
} from "fastify";
import {
  type NewTeamLicense,
  type NewTeamLicenseInvite,
  insertTeamLicense,
  insertTeamLicenseInvite,
} from "~/db/mutations/teamLicense.js";
import {
  getAllTeamLicenses,
  getTeamLicenseById,
} from "~/db/queries/teamLicense.js";
import {
  CACHE_PRIVATE_REVALIDATE,
  FIVE_MINUTES,
  ONE_DAY,
} from "~/lib/constants.js";

export default function teamLicensesRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes,
) {
  const log = fastify.log.child({ module: "routes:team-licenses" });

  fastify.get("/team-licenses", async (_request, reply) => {
    const teamLicenses = await getAllTeamLicenses();

    if (!teamLicenses) {
      log.warn("No team licenses found");
      return reply.status(404).send({ error: "No team licenses found" });
    }

    reply.headers(
      CACHE_PRIVATE_REVALIDATE({
        maxAge: FIVE_MINUTES,
        staleIfError: ONE_DAY * 2,
      }),
    );

    log.info(
      { count: teamLicenses.count },
      "Fetched all team licenses with private caching",
    );

    return teamLicenses;
  });

  fastify.get(
    "/team-licenses/:id",
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      const { id } = request.params;

      try {
        const teamLicense = await getTeamLicenseById(id);

        if (!teamLicense) {
          log.warn({ id }, "Team license not found");
          return reply.status(404).send({ error: "Team license not found" });
        }

        reply.headers(
          CACHE_PRIVATE_REVALIDATE({
            maxAge: ONE_DAY,
            staleIfError: ONE_DAY * 2,
          }),
        );

        log.info({ id }, "Fetched team license by id with private caching");

        return teamLicense;
      } catch (error) {
        const code = (error as { code?: string }).code || "UNKNOWN_ERROR";
        log.error(
          { err: error, code, id },
          "Error fetching team license by id",
        );
        return reply.status(500).send({ error: "Internal Server Error" });
      }
    },
  );

  fastify.post(
    "/team-licenses",
    async (
      request: FastifyRequest<{
        Body: { newTeamLicense: NewTeamLicense };
      }>,
      reply,
    ) => {
      const { newTeamLicense } = request.body;

      try {
        const result = await insertTeamLicense({ newTeamLicense });

        if (!result) {
          log.error({ newTeamLicense }, "Failed to create team license");
          return reply
            .status(500)
            .send({ error: "Failed to create team license" });
        }

        log.info({ id: result[0].id }, "Team license created successfully");

        return reply.status(201).send(result[0]);
      } catch (error) {
        const code = (error as { code?: string }).code || "UNKNOWN_ERROR";
        log.error(
          { err: error, code, newTeamLicense },
          "Error creating team license",
        );
        return reply.status(500).send({ error: "Internal Server Error" });
      }
    },
  );

  fastify.post(
    "/team-licenses/invites",
    async (
      request: FastifyRequest<{
        Body: { newTeamLicenseInvite: NewTeamLicenseInvite };
      }>,
      reply,
    ) => {
      const { newTeamLicenseInvite } = request.body;

      try {
        const result = await insertTeamLicenseInvite({ newTeamLicenseInvite });

        if (!result) {
          log.error(
            { newTeamLicenseInvite },
            "Failed to create team license invite",
          );
          return reply
            .status(500)
            .send({ error: "Failed to create team license invite" });
        }

        log.info(
          { id: result[0].id },
          "Team license invite created successfully",
        );

        return reply.status(201).send(result[0]);
      } catch (error) {
        const code = (error as { code?: string }).code || "UNKNOWN_ERROR";
        log.error(
          { err: error, code, newTeamLicenseInvite },
          "Error creating team license invite",
        );
        return reply.status(500).send({ error: "Internal Server Error" });
      }
    },
  );

  done();
}
