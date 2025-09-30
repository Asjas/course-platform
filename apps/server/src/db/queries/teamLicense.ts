import { eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ module: "db:queries:team-license" });

// All licenses are admin only
// This query is used in the admin dashboard
export async function getAllTeamLicenses() {
  const preparedStatement = db.query.teamLicense
    .findMany({ with: { purchaser: true, invites: true, course: true } })
    .prepare("getAllTeamLicenses");

  try {
    const teamLicenses = await preparedStatement.execute();

    return { teamLicenses, count: teamLicenses.length };
  } catch (err) {
    log.error(err, "Failed to get all team licenses");
    throw err;
  }
}

// Individual licenses are accessible by admin and the user themselves
export async function getTeamLicenseById(teamLicenseId: string) {
  const preparedStatement = db.query.teamLicense
    .findFirst({
      where: (teamLicense) =>
        eq(teamLicense.id, sql.placeholder("teamLicenseId")),
      with: {
        purchaser: true,
        invites: true,
        course: true,
        payment: true,
        invoice: true,
      },
    })
    .prepare("getTeamLicenseById");

  try {
    const teamLicense = await preparedStatement.execute({ teamLicenseId });

    return teamLicense ?? null;
  } catch (err) {
    log.error(err, `Failed to get team license with id ${teamLicenseId}`);
    throw err;
  }
}
