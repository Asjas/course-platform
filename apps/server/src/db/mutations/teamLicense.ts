import { eq } from "drizzle-orm";
import { db } from "~/db/index.js";
import { teamLicense, teamLicenseInvite } from "~/db/schema/teamLicense.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ module: "db:mutations:teamLicense" });

export type TeamLicense = typeof teamLicense.$inferSelect;
export type NewTeamLicense = typeof teamLicense.$inferInsert;
export type TeamLicenseInvite = typeof teamLicenseInvite.$inferSelect;
export type NewTeamLicenseInvite = typeof teamLicenseInvite.$inferInsert;

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

export async function updateTeamLicenseById(
  id: string,
  updates: Partial<TeamLicense>,
) {
  try {
    const result = await db
      .update(teamLicense)
      .set({ ...updates })
      .where(eq(teamLicense.id, id))
      .returning();

    return result;
  } catch (err) {
    log.error(err, `Failed to update team license with id ${id}`);
    throw err;
  }
}

export async function deleteTeamLicenseById({ id }: TeamLicense) {
  try {
    const result = db
      .delete(teamLicense)
      .where(eq(teamLicense.id, id))
      .returning({ id: teamLicense.id });

    return result;
  } catch (err) {
    log.error(err, `Failed to delete team license with id ${id}`);
    throw err;
  }
}

export async function insertTeamLicenseInvite({
  newTeamLicenseInvite,
}: {
  newTeamLicenseInvite: NewTeamLicenseInvite;
}) {
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

export async function updateTeamLicenseInviteById(
  id: string,
  updates: Partial<TeamLicenseInvite>,
) {
  try {
    const result = await db
      .update(teamLicenseInvite)
      .set({ ...updates })
      .where(eq(teamLicenseInvite.id, id))
      .returning();

    return result;
  } catch (err) {
    log.error(err, `Failed to update team license invite with id ${id}`);
    throw err;
  }
}

export async function deleteTeamLicenseInviteById({ id }: TeamLicenseInvite) {
  try {
    const result = await db
      .delete(teamLicenseInvite)
      .where(eq(teamLicenseInvite.id, id))
      .returning({ id: teamLicenseInvite.id });

    return result;
  } catch (err) {
    log.error(err, `Failed to delete team license invite with id ${id}`);
    throw err;
  }
}
