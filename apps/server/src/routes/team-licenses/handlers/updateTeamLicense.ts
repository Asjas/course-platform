import type { FastifyReply, FastifyRequest } from "fastify";
import {
  type TeamLicense,
  updateTeamLicenseById,
} from "~/db/mutations/teamLicense.js";
import {
  CACHE_PRIVATE_REVALIDATE,
  ONE_HOUR,
  THIRTY_MINUTES,
} from "~/lib/constants.js";

export async function updateTeamLicenseHandler(
  request: FastifyRequest<{
    Params: { licenseId: string };
    Body: Partial<TeamLicense>;
  }>,
  reply: FastifyReply,
) {
  const log = reply.server.log.child({
    reqId: request.id,
    handler: "routes:team-licenses:update",
  });

  // TODO: Check if the user has permission

  const { licenseId } = request.params;
  const updates = request.body;

  try {
    const updatedLicense = await updateTeamLicenseById({
      teamLicenseId: licenseId,
      updates,
    });

    if (!updatedLicense) {
      log.error(`Failed to update team license with id ${licenseId}`);
      return reply.status(500).send({ error: "Failed to update team license" });
    }

    log.info(`Team license with id ${licenseId} updated successfully`);

    reply.headers(
      CACHE_PRIVATE_REVALIDATE({
        maxAge: THIRTY_MINUTES,
        staleIfError: ONE_HOUR,
      }),
    );

    reply.statusCode = 201;

    return updatedLicense;
  } catch (error) {
    log.error(error, `Failed to update team license with id ${licenseId}`);
    return reply.status(500).send({ error: "Internal server error" });
  }
}
