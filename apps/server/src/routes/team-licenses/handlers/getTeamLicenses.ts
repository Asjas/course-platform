import type { FastifyReply, FastifyRequest } from "fastify";
import { getAllTeamLicenses } from "~/db/queries/teamLicense.js";
import {
  CACHE_PRIVATE_REVALIDATE,
  ONE_HOUR,
  THIRTY_MINUTES,
} from "~/lib/constants.js";

export async function getTeamLicensesHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const log = reply.server.log.child({
    reqId: request.id,
    handler: "routes:team-licenses:get",
  });

  try {
    const teamLicenses = await getAllTeamLicenses();

    if (!teamLicenses) {
      log.warn("No team licenses found");
      return reply.status(404).send({ error: "No team licenses found" });
    }

    reply.headers(
      CACHE_PRIVATE_REVALIDATE({
        maxAge: THIRTY_MINUTES,
        staleIfError: ONE_HOUR,
      }),
    );

    log.info({ count: teamLicenses.count }, "Fetched all team licenses");

    return teamLicenses;
  } catch (error) {
    log.error(error, "Failed to fetch team licenses");
    return reply.status(500).send({ error: "Internal server error" });
  }
}
