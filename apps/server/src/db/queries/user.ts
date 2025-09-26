import { eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import { ONE_DAY } from "~/lib/constants.js";
import { redis } from "~/lib/redis.js";

// All users are admin only
// This query is used in the admin dashboard
export async function getAllUsers() {
  const preparedStatement = db.query.user
    .findMany({
      with: {
        enrollments: true,
        progress: {
          with: {
            course: true,
          },
        },
        payments: { with: { invoice: true } },
        wishlists: { with: { course: true } },
        announcements: {
          with: {
            reads: true,
          },
        },
        tickets: true,
        teamLicenses: true,
      },
    })
    .prepare("getAllUsers");

  const users = await preparedStatement.execute();

  return { users, count: users.length };
}

// All users are admin only
// This query is used in the admin dashboard
export async function getAllUsersCached() {
  const cacheKey = `users:all`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const users = await getAllUsers();
  if (users.count > 0) {
    await redis.setex(cacheKey, JSON.stringify(users), ONE_DAY);
  }

  return users;
}

// Individual users are accessible by admin and the user themselves
export async function getUserById(id: string) {
  const preparedStatement = db.query.user
    .findFirst({
      where: (user) => eq(user.id, sql.placeholder("id")),
      with: {
        enrollments: {
          with: {
            course: {
              with: {
                progress: true,
                modules: {
                  with: {
                    lessons: {
                      with: {
                        progress: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        tickets: {
          with: {
            comments: true,
            attachments: true,
          },
        },
        payments: { with: { invoice: true } },
        wishlists: { with: { course: true } },
        announcements: {
          with: {
            reads: true,
          },
        },
        sessions: true,
        teamLicenses: true,
      },
    })
    .prepare("getUserById");

  const user = await preparedStatement.execute({ id });

  return user ?? null;
}

// Individual users are accessible by admin and the user themselves
export async function getUserByIdCached(id: string) {
  const cacheKey = `user:${id}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const user = await getUserById(id);
  if (user) {
    await redis.set(cacheKey, JSON.stringify(user), "EX", ONE_DAY);
  }

  return user;
}
