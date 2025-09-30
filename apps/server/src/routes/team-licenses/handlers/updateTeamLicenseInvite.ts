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

export async function updateTeamLicenseInviteHandler(
  request: FastifyRequest<{
    Params: { licenseId: string; inviteId: string };
    Body: { accepted: boolean };
  }>,
  reply: FastifyReply,
) {
  const log = reply.server.log.child({
    reqId: request.id,
    handler: "routes:team-licenses:update-invite",
  });

  // TODO: Check if the user has permission

  const { licenseId, inviteId } = request.params;
  const { accepted } = request.body;

  try {
    const updates: Partial<TeamLicense> = {};

    if (accepted) {
      updates.claimedSeats = (updates.claimedSeats || 0) + 1;
    }

    const updatedLicense = await updateTeamLicenseById({
      teamLicenseId: licenseId,
      updates,
    });

    // TODO: Check if the invite exists and is valid
    // TODO: Check if seats aren't full

    if (!updatedLicense) {
      log.error(
        `Failed to update team license invite with id ${inviteId} for license ${licenseId}`,
      );
      return reply
        .status(500)
        .send({ error: "Failed to update team license invite" });
    }

    log.info(
      `Team license invite with id ${inviteId} for license ${licenseId} updated successfully`,
    );

    reply.headers(
      CACHE_PRIVATE_REVALIDATE({
        maxAge: THIRTY_MINUTES,
        staleIfError: ONE_HOUR,
      }),
    );

    reply.statusCode = 201;

    return updatedLicense;
  } catch (error) {
    log.error(
      error,
      `Failed to update team license invite with id ${inviteId} for license ${licenseId}`,
    );
    return reply.status(500).send({ error: "Internal server error" });
  }
}
