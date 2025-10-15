import { eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ routes: "db:queries:user" });

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
        teamLicenses: { with: { invites: true } },
        tickets: true,
      },
    })
    .prepare("getAllUsers");

  try {
    const users = await preparedStatement.execute();

    return { users, count: users.length };
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, "Failed to get all users");
    }

    throw err;
  }
}

export async function getUserById({ userId }: { userId: string }) {
  const preparedStatement = db.query.user
    .findFirst({
      where: (user) => eq(user.id, sql.placeholder("userId")),
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
        teamLicenses: { with: { invites: true } },
      },
    })
    .prepare("getUserById");

  try {
    const user = await preparedStatement.execute({ userId });

    return user ?? null;
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, `Failed to get user with id ${userId}`);
    }

    throw err;
  }
}
