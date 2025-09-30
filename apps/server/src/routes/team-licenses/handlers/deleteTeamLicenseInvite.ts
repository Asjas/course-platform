import type { FastifyReply, FastifyRequest } from "fastify";
import { deleteTeamLicenseInviteById } from "~/db/mutations/teamLicenseInvite.js";
import {
  CACHE_PRIVATE_REVALIDATE,
  ONE_HOUR,
  THIRTY_MINUTES,
} from "~/lib/constants.js";

export async function deleteTeamLicenseInviteHandler(
  request: FastifyRequest<{ Params: { licenseId: string; inviteId: string } }>,
  reply: FastifyReply,
) {
  const log = reply.server.log.child({
    reqId: request.id,
    handler: "routes:team-licenses:invites:delete",
  });

  // TODO: Check if the user has permission

  const { licenseId, inviteId } = request.params;

  try {
    const deleted = await deleteTeamLicenseInviteById({
      teamLicenseId: licenseId,
      teamLicenseInviteId: inviteId,
    });

    if (!deleted) {
      log.error(
        `Failed to delete team license invite with id ${inviteId} for license ${licenseId}`,
      );
      return reply
        .status(500)
        .send({ error: "Failed to delete team license invite" });
    }

    log.info(
      `Team license invite with id ${inviteId} for license ${licenseId} deleted successfully`,
    );

    reply.headers(
      CACHE_PRIVATE_REVALIDATE({
        maxAge: THIRTY_MINUTES,
        staleIfError: ONE_HOUR,
      }),
    );

    return { message: "Team license invite deleted successfully" };
  } catch (error) {
    log.error(
      error,
      `Failed to delete team license invite with id ${inviteId} for license ${licenseId}`,
    );
    return reply.status(500).send({ error: "Internal server error" });
  }
}
