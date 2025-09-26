import { eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import { ONE_DAY } from "~/lib/constants.js";
import { redis } from "~/lib/redis.js";

// All licenses are admin only
// This query is used in the admin dashboard
export async function getAllTeamLicenses() {
  const preparedStatement = db.query.teamLicense
    .findMany({ with: { user: true } })
    .prepare("getAllTeamLicenses");

  const teamLicenses = await preparedStatement.execute();

  return { teamLicenses, count: teamLicenses.length };
}

// All licenses are admin only
// This query is used in the admin dashboard
export async function getAllTeamLicensesCached() {
  const cacheKey = `teamLicenses:all`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const teamLicenses = await getAllTeamLicenses();
  if (teamLicenses.count > 0) {
    await redis.setex(cacheKey, JSON.stringify(teamLicenses), ONE_DAY);
  }

  return teamLicenses;
}

// Individual licenses are accessible by admin and the user themselves
export async function getTeamLicenseById(id: string) {
  const preparedStatement = db.query.teamLicense
    .findFirst({
      where: (teamLicense) => eq(teamLicense.id, sql.placeholder("id")),
      with: { user: true },
    })
    .prepare("getTeamLicenseById");

  const teamLicense = await preparedStatement.execute({ id });

  return teamLicense ?? null;
}

// Individual licenses are accessible by admin and the user themselves
export async function getTeamLicenseByIdCached(id: string) {
  const cacheKey = `teamLicense:id:${id}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const teamLicense = await getTeamLicenseById(id);
  if (teamLicense) {
    await redis.setex(cacheKey, JSON.stringify(teamLicense), ONE_DAY);
  }

  return teamLicense;
}
