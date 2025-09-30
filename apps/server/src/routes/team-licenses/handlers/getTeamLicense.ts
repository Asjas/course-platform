import type { FastifyReply, FastifyRequest } from "fastify";
import { getTeamLicenseById } from "~/db/queries/teamLicense.js";
import {
  CACHE_PRIVATE_REVALIDATE,
  ONE_HOUR,
  THIRTY_MINUTES,
} from "~/lib/constants.js";

export async function getTeamLicenseHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const log = reply.server.log.child({
    reqId: request.id,
    handler: "routes:team-licenses:single",
  });

  const { id: teamLicenseId } = request.params;

  try {
    const teamLicense = await getTeamLicenseById(teamLicenseId);

    if (!teamLicense) {
      log.warn({ teamLicenseId }, "Team license not found");
      return reply.status(404).send({ error: "Team license not found" });
    }

    reply.headers(
      CACHE_PRIVATE_REVALIDATE({
        maxAge: THIRTY_MINUTES,
        staleIfError: ONE_HOUR,
      }),
    );

    log.info({ teamLicenseId }, "Fetched team license successfully");

    return teamLicense;
  } catch (err) {
    log.error({ err, teamLicenseId }, "Failed to fetch team license");
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}
