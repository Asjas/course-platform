import type {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions,
} from "fastify";
import { createNewTeamLicenseHandler } from "~/routes/team-licenses/handlers/createNewTeamLicense.js";
import { createNewTeamLicenseInviteHandler } from "~/routes/team-licenses/handlers/createNewTeamLicenseInvite.js";
import { deleteTeamLicenseHandler } from "~/routes/team-licenses/handlers/deleteTeamLicense.js";
import { deleteTeamLicenseInviteHandler } from "~/routes/team-licenses/handlers/deleteTeamLicenseInvite.js";
import { updateTeamLicenseHandler } from "~/routes/team-licenses/handlers/updateTeamLicense.js";
import { updateTeamLicenseInviteHandler } from "~/routes/team-licenses/handlers/updateTeamLicenseInvite.js";

export default function teamLicensesRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes,
) {
  fastify.post("/team-licenses", createNewTeamLicenseHandler);
  fastify.post("/team-licenses/invites", createNewTeamLicenseInviteHandler);
  fastify.put("/team-licenses/:licenseId", updateTeamLicenseHandler);
  fastify.put(
    "/team-licenses/:licenseId/invites/:inviteId",
    updateTeamLicenseInviteHandler,
  );
  fastify.delete("/team-licenses/:licenseId", deleteTeamLicenseHandler);
  fastify.delete(
    "/team-licenses/:licenseId/invites/:inviteId",
    deleteTeamLicenseInviteHandler,
  );

  done();
}
