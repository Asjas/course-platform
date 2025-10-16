import { eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";

const preparedGetAllUsers = db.query.user
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

const preparedGetUserById = db.query.user
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

export async function getAllUsers() {
  const users = await preparedGetAllUsers.execute();

  return users;
}

export async function getUserById({ userId }: { userId: string }) {
  const user = await preparedGetUserById.execute({ userId });

  if (!user) {
    return null;
  }

  return user;
}
