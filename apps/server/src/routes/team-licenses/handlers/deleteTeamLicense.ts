import type { FastifyReply, FastifyRequest } from "fastify";
import { deleteTeamLicenseById } from "~/db/mutations/teamLicense.js";
import {
  CACHE_PRIVATE_REVALIDATE,
  ONE_HOUR,
  THIRTY_MINUTES,
} from "~/lib/constants.js";

export async function deleteTeamLicenseHandler(
  request: FastifyRequest<{ Params: { licenseId: string } }>,
  reply: FastifyReply,
) {
  const log = reply.server.log.child({
    reqId: request.id,
    handler: "routes:team-licenses:delete",
  });

  // TODO: Check if the user has permission

  const { licenseId } = request.params;

  try {
    const deleted = await deleteTeamLicenseById(licenseId);

    if (!deleted) {
      log.error(`Failed to delete team license with id ${licenseId}`);
      return reply.status(500).send({ error: "Failed to delete team license" });
    }

    log.info(`Team license with id ${licenseId} deleted successfully`);

    reply.headers(
      CACHE_PRIVATE_REVALIDATE({
        maxAge: THIRTY_MINUTES,
        staleIfError: ONE_HOUR,
      }),
    );

    return { message: "Team license deleted successfully" };
  } catch (error) {
    log.error(error, `Failed to delete team license with id ${licenseId}`);
    return reply.status(500).send({ error: "Internal server error" });
  }
}
