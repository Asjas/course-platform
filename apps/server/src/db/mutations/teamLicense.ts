import { eq } from "drizzle-orm";
import { db } from "~/db/index.js";
import { teamLicense } from "~/db/schema/teamLicense.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ module: "db:mutations:team-license" });

export type TeamLicense = typeof teamLicense.$inferSelect;
export type NewTeamLicense = typeof teamLicense.$inferInsert;

export async function insertTeamLicense(newTeamLicense: NewTeamLicense) {
  try {
    const result = await db
      .insert(teamLicense)
      .values(newTeamLicense)
      .returning();

    return result;
  } catch (err) {
    log.error(err, "Failed to insert team license");

    throw err;
  }
}

export async function updateTeamLicenseById({
  teamLicenseId,
  updates,
}: {
  teamLicenseId: string;
  updates: Partial<TeamLicense>;
}) {
  try {
    const result = await db
      .update(teamLicense)
      .set({ ...updates })
      .where(eq(teamLicense.id, teamLicenseId))
      .returning();

    return result;
  } catch (err) {
    log.error(err, `Failed to update team license with id ${teamLicenseId}`);
    throw err;
  }
}

export async function deleteTeamLicenseById(teamLicenseId: string) {
  try {
    const result = db
      .delete(teamLicense)
      .where(eq(teamLicense.id, teamLicenseId))
      .returning({ id: teamLicense.id });

    return result;
  } catch (err) {
    log.error(err, `Failed to delete team license with id ${teamLicenseId}`);
    throw err;
  }
}
