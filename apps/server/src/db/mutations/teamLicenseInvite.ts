import { and, eq } from "drizzle-orm";
import { db } from "~/db/index.js";
import { teamLicenseInvite } from "~/db/schema/teamLicense.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ module: "db:mutations:team-license-invite" });

export type TeamLicenseInvite = typeof teamLicenseInvite.$inferSelect;
export type NewTeamLicenseInvite = typeof teamLicenseInvite.$inferInsert;

export async function insertTeamLicenseInvite(
  newTeamLicenseInvite: NewTeamLicenseInvite,
) {
  try {
    const result = await db
      .insert(teamLicenseInvite)
      .values(newTeamLicenseInvite)
      .returning();

    return result;
  } catch (err) {
    log.error(err, "Failed to insert team license invite");

    throw err;
  }
}

export async function updateTeamLicenseInviteById({
  teamLicenseId,
  updates,
}: {
  teamLicenseId: string;
  updates: Partial<TeamLicenseInvite>;
}) {
  try {
    const result = await db
      .update(teamLicenseInvite)
      .set({ ...updates })
      .where(eq(teamLicenseInvite.id, teamLicenseId))
      .returning();

    return result;
  } catch (err) {
    log.error(
      err,
      `Failed to update team license invite with id ${teamLicenseId}`,
    );
    throw err;
  }
}

export async function deleteTeamLicenseInviteById({
  teamLicenseId,
  teamLicenseInviteId,
}: {
  teamLicenseId: string;
  teamLicenseInviteId: string;
}) {
  try {
    const result = await db
      .delete(teamLicenseInvite)
      .where(
        and(
          eq(teamLicenseInvite.id, teamLicenseInviteId),
          eq(teamLicenseInvite.licenseId, teamLicenseId),
        ),
      )
      .returning({ id: teamLicenseInvite.id });

    return result;
  } catch (err) {
    log.error(
      err,
      `Failed to delete team license invite with id ${teamLicenseInviteId}`,
    );
    throw err;
  }
}
