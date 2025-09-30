import type { FastifyReply, FastifyRequest } from "fastify";
import { ulid } from "ulid";
import {
  type NewTeamLicenseInvite,
  insertTeamLicenseInvite,
} from "~/db/mutations/teamLicenseInvite.js";
import {
  CACHE_PRIVATE_REVALIDATE,
  ONE_HOUR,
  THIRTY_MINUTES,
} from "~/lib/constants.js";

export async function createNewTeamLicenseInviteHandler(
  request: FastifyRequest<{
    Body: { id: string; inviteEmail: string };
  }>,
  reply: FastifyReply,
) {
  const log = reply.server.log.child({
    reqId: request.id,
    handler: "routes:team-licenses:invites:create",
  });

  // TODO: Check if the user has permission

  const { id: invitedByUserId, inviteEmail } = request.body;

  const newTeamLicenseInvite: NewTeamLicenseInvite = {
    id: `ilic:${ulid()}`,
    licenseId: `lic:${ulid()}`,
    inviteCode: `icode:${ulid()}`,
    invitedByUserId,
    inviteEmail,
  };

  try {
    const result = await insertTeamLicenseInvite(newTeamLicenseInvite);

    if (!result) {
      log.error(
        `Failed to create team license invite for invitedByUserId ${invitedByUserId} with email ${inviteEmail}`,
      );
      return reply
        .status(500)
        .send({ error: "Failed to create team license invite" });
    }

    // TODO: Send invite email here

    reply.headers(
      CACHE_PRIVATE_REVALIDATE({
        maxAge: THIRTY_MINUTES,
        staleIfError: ONE_HOUR,
      }),
    );

    log.info(`Team license invite created successfully for ${inviteEmail}`);

    return reply.status(201).send(result[0]);
  } catch (err) {
    log.error(
      err,
      `Failed to create team license invite for invitedByUserId ${invitedByUserId} with email ${inviteEmail}`,
    );
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}
