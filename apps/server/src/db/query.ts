import { eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import { session, user } from "~/db/schema/user.js";
import { ONE_HOUR } from "~/lib/constants.js";
import { redis } from "~/lib/redis.js";

export const selectUserById = db
  .select()
  .from(user)
  .where(eq(user.id, sql.placeholder("id")))
  .prepare("selectUserById");

export async function selectUserByIdCached(id: string) {
  const cacheKey = `user:${id}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const user = await selectUserById.execute({ id });
  await redis.set(cacheKey, JSON.stringify(user), "EX", ONE_HOUR);

  return user;
}

export const selectSessionByToken = db
  .select()
  .from(session)
  .where(eq(session.token, sql.placeholder("token")))
  .prepare("selectSessionByToken");

export async function selectSessionByTokenCached(token: string) {
  const cacheKey = `session:${token}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const result = await selectSessionByToken.execute({ token });

  // Drizzle prepared select may return an array; pick the first item if present.
  const session = Array.isArray(result)
    ? (result[0] ?? null)
    : (result ?? null);

  if (session) {
    await redis.set(cacheKey, JSON.stringify(session), "EX", ONE_HOUR);
  }

  return session;
}

export const selectSessionsByUserId = db
  .select()
  .from(session)
  .where(eq(session.userId, sql.placeholder("userId")))
  .prepare("selectSessionsByUserId");

export async function selectSessionsByUserIdCached(userId: string) {
  const cacheKey = `sessions:user:${userId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const result = await selectSessionsByUserId.execute({ userId });

  // Normalize result to array
  const sessions = Array.isArray(result) ? result : result ? [result] : [];

  // Cache the array (including empty array to prevent thundering-cache misses)
  await redis.set(cacheKey, JSON.stringify(sessions), "EX", ONE_HOUR);

  return sessions;
}
