import { getAllUsers, getUserById } from "~/routes/users/queries.js";

export async function getAllUsersCache() {
  const { users, count } = await getAllUsers();

  if (!users) {
    return { users: null, count };
  }

  return {
    users,
    count,
  };
}

export async function getUserByIdCache({ userId }: { userId: string }) {
  const user = await getUserById({ userId });

  if (!user) {
    return { user: null };
  }

  return {
    user,
  };
}
